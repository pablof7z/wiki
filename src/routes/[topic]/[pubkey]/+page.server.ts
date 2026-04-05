import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';
import type { PageServerLoad } from './$types';
import {
	buildArticleShareData,
	buildTopicFallbackShareData,
	sanitizeProfile
} from '$lib/server/share';
import {
	fetchEventByAddress,
	fetchUserWithProfile,
	getServerNdk,
	getPreferredDisplayName,
	loadUserProfile,
	shortenHexPubkey
} from '$lib/server/nostr';
import { prettifyNip05 } from '$lib/utils/nip05';
import { nip19 } from 'nostr-tools';

const ARTICLE_KIND = 30818;
const TOPIC_ROUTE_SEED_RELAY_URL = 'wss://relay.wikifreedia.xyz';
const TOPIC_ROUTE_FETCH_TIMEOUT_MS = 4000;

export const load: PageServerLoad = async ({ params, url, setHeaders }) => {
	setHeaders({
		'cache-control': 'private, no-store'
	});

	const fallback = buildTopicFallbackShareData({
		url,
		topic: params.topic,
		authorName: params.pubkey
	});

	try {
		const matchedEntry = await resolveTopicRouteEntry(params.topic, params.pubkey);
		if (matchedEntry) {
			const authorRouteId =
				prettifyNip05(matchedEntry.profile?.nip05 ?? '') ||
				params.pubkey ||
				nip19.npubEncode(matchedEntry.event.pubkey);

			return {
				...buildArticleShareData({
					url,
					event: matchedEntry.event,
					profile: matchedEntry.profile,
					authorName: matchedEntry.authorName,
					eyebrow: 'Living entry'
				}),
				userPubkey: matchedEntry.event.pubkey,
				entryEvent: matchedEntry.event.rawEvent(),
				authorProfile: sanitizeProfile(matchedEntry.profile),
				authorLabel: authorRouteId || matchedEntry.authorName,
				authorRouteId
			};
		}

		const { user, profile } = await fetchUserWithProfile(params.pubkey);
		if (!user) {
			return {
				...fallback,
				userPubkey: undefined
			};
		}

		return {
			...buildTopicFallbackShareData({
				url,
				topic: params.topic,
				authorName: getPreferredDisplayName(profile, shortenHexPubkey(user.pubkey)),
				profile
			}),
			userPubkey: user.pubkey
		};
	} catch (error) {
		console.warn('[share] failed to resolve topic route author', error);

		return {
			...fallback,
			userPubkey: undefined
		};
	}
};

async function resolveTopicRouteEntry(
	topic: string,
	identifier: string
): Promise<
	| {
			event: NDKEvent;
			profile?: NDKUserProfile;
			authorName: string;
	  }
	| undefined
> {
	const normalizedIdentifier = identifier.trim().toLowerCase();
	const exactMatch = await resolveExactTopicRouteEntry(topic, identifier, normalizedIdentifier);
	if (exactMatch) return exactMatch;

	return resolveTopicRouteEntryByTopicScan(topic, normalizedIdentifier);
}

async function resolveExactTopicRouteEntry(
	topic: string,
	identifier: string,
	normalizedIdentifier: string
): Promise<
	| {
			event: NDKEvent;
			profile?: NDKUserProfile;
			authorName: string;
	  }
	| undefined
> {
	const { user, profile } = await fetchUserWithProfile(identifier);
	if (!user) return undefined;

	const eventAddress = nip19.naddrEncode({
		kind: ARTICLE_KIND,
		pubkey: user.pubkey,
		identifier: topic,
		relays: [TOPIC_ROUTE_SEED_RELAY_URL]
	});
	const event = await fetchEventByAddress(eventAddress, [TOPIC_ROUTE_SEED_RELAY_URL]);
	if (!event) return undefined;

	const nextProfile = profile ?? (await loadUserProfile(user));
	if (!matchesTopicRouteIdentifier(normalizedIdentifier, user.pubkey, user.npub, nextProfile?.nip05)) {
		return undefined;
	}

	return toResolvedTopicRouteEntry(event, nextProfile);
}

async function resolveTopicRouteEntryByTopicScan(
	topic: string,
	normalizedIdentifier: string
): Promise<
	| {
			event: NDKEvent;
			profile?: NDKUserProfile;
			authorName: string;
	  }
	| undefined
> {
	const topicNdk = await getServerNdk([TOPIC_ROUTE_SEED_RELAY_URL]);
	const fetchedEvents = await withTimeout(
		topicNdk.fetchEvents(
			{
				kinds: [ARTICLE_KIND],
				'#d': [topic]
			},
			{ closeOnEose: true }
		),
		TOPIC_ROUTE_FETCH_TIMEOUT_MS
	);
	const latestByAuthor = getLatestRenderableEntries(Array.from(fetchedEvents ?? []));
	const profileByPubkey = await fetchTopicRouteProfiles(latestByAuthor.map((event) => event.pubkey));

	for (const event of latestByAuthor) {
		const npub = nip19.npubEncode(event.pubkey);
		if (matchesTopicRouteIdentifier(normalizedIdentifier, event.pubkey, npub)) {
			return toResolvedTopicRouteEntry(event, profileByPubkey.get(event.pubkey));
		}
	}

	const matchedEntry = latestByAuthor.find((event) =>
		matchesTopicRouteIdentifier(
			normalizedIdentifier,
			event.pubkey,
			nip19.npubEncode(event.pubkey),
			profileByPubkey.get(event.pubkey)?.nip05
		)
	);

	if (!matchedEntry) return undefined;
	return toResolvedTopicRouteEntry(matchedEntry, profileByPubkey.get(matchedEntry.pubkey));
}

function matchesTopicRouteIdentifier(
	identifier: string,
	pubkey: string,
	npub: string,
	nip05?: string
): boolean {
	if (pubkey.toLowerCase() === identifier) return true;
	if (npub.toLowerCase() === identifier) return true;

	const routeNip05 = prettifyNip05(nip05 ?? '').trim().toLowerCase();
	return Boolean(routeNip05) && routeNip05 === identifier;
}

function toResolvedTopicRouteEntry(
	event: NDKEvent,
	profile?: NDKUserProfile
): {
	event: NDKEvent;
	profile?: NDKUserProfile;
	authorName: string;
} {
	return {
		event,
		profile,
		authorName: getPreferredDisplayName(profile, shortenHexPubkey(event.pubkey))
	};
}

async function fetchTopicRouteProfiles(pubkeys: string[]): Promise<Map<string, NDKUserProfile>> {
	const uniquePubkeys = Array.from(new Set(pubkeys));
	if (uniquePubkeys.length === 0) return new Map();

	const profileNdk = await getServerNdk();
	const fetchedProfiles = await withTimeout(
		profileNdk.fetchEvents(
			{
				kinds: [0],
				authors: uniquePubkeys
			},
			{ closeOnEose: true }
		),
		TOPIC_ROUTE_FETCH_TIMEOUT_MS
	);

	const latestProfileEventByPubkey = new Map<string, NDKEvent>();
	for (const event of Array.from(fetchedProfiles ?? [])) {
		const existing = latestProfileEventByPubkey.get(event.pubkey);
		if (!existing || (event.created_at ?? 0) > (existing.created_at ?? 0)) {
			latestProfileEventByPubkey.set(event.pubkey, event);
		}
	}

	return new Map(
		Array.from(latestProfileEventByPubkey.entries())
			.map(([pubkey, event]) => [pubkey, parseProfileEvent(event)] as const)
			.filter((entry): entry is readonly [string, NDKUserProfile] => Boolean(entry[1]))
	);
}

function parseProfileEvent(event: NDKEvent): NDKUserProfile | undefined {
	try {
		const parsed = JSON.parse(event.content) as unknown;
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
		return parsed as NDKUserProfile;
	} catch {
		return undefined;
	}
}

function getLatestRenderableEntries(events: NDKEvent[]): NDKEvent[] {
	const latestByAuthor = new Map<string, NDKEvent>();

	for (const event of events) {
		if (event.getMatchingTags('a').some((tag) => tag[3] === 'defer')) continue;

		const existing = latestByAuthor.get(event.pubkey);
		if (!existing || (event.created_at ?? 0) > (existing.created_at ?? 0)) {
			latestByAuthor.set(event.pubkey, event);
		}
	}

	return Array.from(latestByAuthor.values());
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | undefined> {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	try {
		return await Promise.race([
			promise,
			new Promise<undefined>((resolve) => {
				timeoutId = setTimeout(() => resolve(undefined), timeoutMs);
			})
		]);
	} finally {
		if (timeoutId) clearTimeout(timeoutId);
	}
}
