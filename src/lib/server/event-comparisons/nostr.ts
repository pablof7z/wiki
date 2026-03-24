import NDK, { type NDKEvent, type NDKUserProfile } from '@nostr-dev-kit/ndk';
import { extractMarkupTitle } from '$lib/utils/markup';
import { EventComparisonError } from './errors';
import type { ComparableEntry, ComparableEventFetcher } from './types';

const WIKI_ENTRY_KIND = 30818;
const NDK_CONNECT_TIMEOUT_MS = 2500;

type ProfileLike = Pick<NDKUserProfile, 'displayName' | 'name' | 'nip05'>;
type UserLike = {
	profile?: ProfileLike;
	fetchProfile(options?: unknown): Promise<ProfileLike | null>;
};
type ComparableEventLike = Pick<
	NDKEvent,
	'id' | 'kind' | 'content' | 'pubkey' | 'created_at' | 'dTag' | 'tagValue'
>;
type NostrClient = {
	fetchEvent(id: string, options?: unknown): Promise<ComparableEventLike | null>;
	getUser(input: { pubkey: string }): UserLike;
};
type NostrClientFactory = (relayUrls: string[]) => Promise<NostrClient>;

const ndkClients = new Map<string, Promise<NDK>>();

export function createComparableEventFetcher({
	relayUrls,
	getClient = getServerNdkClient
}: {
	relayUrls: string[];
	getClient?: NostrClientFactory;
}): ComparableEventFetcher {
	return async (eventIds: string[]) => {
		const client = await getClient(relayUrls);
		return Promise.all(eventIds.map((eventId) => fetchComparableEvent(client, eventId)));
	};
}

export function shortenHexPubkey(pubkey: string): string {
	if (pubkey.length <= 16) return pubkey;

	return `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`;
}

async function fetchComparableEvent(
	client: NostrClient,
	eventId: string
): Promise<ComparableEntry> {
	let event: ComparableEventLike | null;

	try {
		event = await client.fetchEvent(eventId, { closeOnEose: true });
	} catch (error) {
		console.error('[event-comparisons] event fetch failed', error);
		throw new EventComparisonError(
			404,
			'event_not_found',
			`Event ${eventId} could not be fetched.`
		);
	}

	if (!event) {
		throw new EventComparisonError(404, 'event_not_found', `Event ${eventId} was not found.`);
	}

	if (event.kind !== WIKI_ENTRY_KIND) {
		throw new EventComparisonError(
			422,
			'invalid_event_kind',
			`Event ${eventId} is not a Wikifreedia entry.`
		);
	}

	const content = event.content.trim();
	if (!content) {
		throw new EventComparisonError(
			422,
			'empty_event_content',
			`Event ${eventId} has no usable content to compare.`
		);
	}

	return {
		eventId,
		authorName: await resolveAuthorName(client, event.pubkey),
		authorPubkey: event.pubkey,
		title: event.tagValue('title') || extractMarkupTitle(content) || event.dTag || 'Untitled',
		createdAt: event.created_at ?? null,
		kind: event.kind,
		content
	};
}

async function resolveAuthorName(client: NostrClient, pubkey: string): Promise<string> {
	const fallbackAuthorName = shortenHexPubkey(pubkey);

	try {
		const user = client.getUser({ pubkey });
		const profile = user.profile ?? (await user.fetchProfile({ closeOnEose: true }));
		return chooseAuthorName(profile, fallbackAuthorName);
	} catch (error) {
		console.warn('[event-comparisons] profile lookup failed, using pubkey fallback', error);
		return fallbackAuthorName;
	}
}

function chooseAuthorName(
	profile: ProfileLike | null | undefined,
	fallbackAuthorName: string
): string {
	const authorName =
		profile?.displayName || profile?.name || prettifyNip05(profile?.nip05) || fallbackAuthorName;

	return authorName.trim() || fallbackAuthorName;
}

function prettifyNip05(nip05: string | undefined): string | undefined {
	if (!nip05) return undefined;

	const normalizedNip05 = nip05.trim();
	if (!normalizedNip05) return undefined;

	return normalizedNip05.startsWith('_@') ? normalizedNip05.slice(2) : normalizedNip05;
}

async function getServerNdkClient(relayUrls: string[]): Promise<NDK> {
	const relayKey = relayUrls.join(',');
	const existingClient = ndkClients.get(relayKey);
	if (existingClient) {
		return existingClient;
	}

	const clientPromise = (async () => {
		const ndk = new NDK({
			explicitRelayUrls: relayUrls,
			enableOutboxModel: false,
			clientName: 'wikifreedia'
		});

		await ndk.connect(NDK_CONNECT_TIMEOUT_MS);
		return ndk;
	})();

	ndkClients.set(relayKey, clientPromise);

	try {
		return await clientPromise;
	} catch (error) {
		ndkClients.delete(relayKey);
		throw error;
	}
}
