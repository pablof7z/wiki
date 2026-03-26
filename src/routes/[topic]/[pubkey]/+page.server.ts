import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';
import type { PageServerLoad } from './$types';
import {
	buildArticleShareData,
	buildTopicFallbackShareData
} from '$lib/server/share';
import {
	fetchUserWithProfile,
	getPreferredDisplayName,
	getServerNdk,
	loadUserProfile,
	shortenHexPubkey
} from '$lib/server/nostr';
import { prettifyNip05 } from '$lib/utils/nip05';

const ARTICLE_KIND = 30818;
const TOPIC_ROUTE_SEED_RELAY_URL = 'wss://relay.wikifreedia.xyz';
const TOPIC_ROUTE_FETCH_TIMEOUT_MS = 1800;

export const load: PageServerLoad = async ({ params, url }) => {
	const fallback = buildTopicFallbackShareData({
		url,
		topic: params.topic,
		authorName: params.pubkey
	});

	try {
		const matchedEntry = await resolveTopicRouteEntry(params.topic, params.pubkey);
		if (matchedEntry) {
			return {
				...buildArticleShareData({
					url,
					event: matchedEntry.event,
					profile: matchedEntry.profile,
					authorName: matchedEntry.authorName,
					eyebrow: 'Living entry'
				}),
				userPubkey: matchedEntry.event.pubkey
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
	const topicNdk = await getServerNdk([TOPIC_ROUTE_SEED_RELAY_URL]);
	const profileNdk = await getServerNdk();
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
	const normalizedIdentifier = identifier.trim().toLowerCase();

	for (const event of latestByAuthor) {
		if (event.pubkey.toLowerCase() === normalizedIdentifier) {
			const profile = await loadUserProfile(profileNdk.getUser({ pubkey: event.pubkey }));

			return {
				event,
				profile,
				authorName: getPreferredDisplayName(profile, shortenHexPubkey(event.pubkey))
			};
		}

		const user = profileNdk.getUser({ pubkey: event.pubkey });
		if (user.npub.toLowerCase() === normalizedIdentifier) {
			const profile = await loadUserProfile(user);

			return {
				event,
				profile,
				authorName: getPreferredDisplayName(profile, shortenHexPubkey(event.pubkey))
			};
		}
	}

	const entriesWithProfiles = await Promise.all(
		latestByAuthor.map(async (event) => {
			const user = profileNdk.getUser({ pubkey: event.pubkey });
			const profile = await loadUserProfile(user);
			const routeNip05 = prettifyNip05(profile?.nip05 ?? '').trim().toLowerCase();

			return {
				event,
				profile,
				routeNip05,
				authorName: getPreferredDisplayName(profile, shortenHexPubkey(event.pubkey))
			};
		})
	);

	return entriesWithProfiles.find((entry) => entry.routeNip05 === normalizedIdentifier);
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
