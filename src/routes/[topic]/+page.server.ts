import type { NDKEvent, NostrEvent } from '@nostr-dev-kit/ndk';
import type { PageServerLoad } from './$types';
import { nip19 } from 'nostr-tools';
import { buildTopicComparisonHref } from '$lib/utils/article-comparison';
import { buildTopicIndexShareData } from '$lib/server/share';
import { getServerNdk, shortenHexPubkey } from '$lib/server/nostr';
import type { TopicEntrySeed } from '$lib/topic-entry-seed';

const TOPIC_KIND = 30818;
const TOPIC_FETCH_TIMEOUT_MS = 1800;
const TOPIC_SEED_RELAY_URL = 'wss://relay.wikifreedia.xyz';

export const load: PageServerLoad = async ({ params, url }) => {
	try {
		const ndk = await getServerNdk([TOPIC_SEED_RELAY_URL]);
		const fetchedEvents = await withTimeout(
			ndk.fetchEvents(
				{
					kinds: [TOPIC_KIND],
					'#d': [params.topic]
				},
				{ closeOnEose: true }
			),
			TOPIC_FETCH_TIMEOUT_MS
		);
		const topicEvents = getRenderableTopicEvents(Array.from(fetchedEvents ?? []));

		const topicEntries: TopicEntrySeed[] = topicEvents.map((event) => {
			const authorRouteId = nip19.npubEncode(event.pubkey);

			return {
				id: event.id,
				authorName: shortenHexPubkey(event.pubkey),
				entryHref: `/${encodeURIComponent(params.topic)}/${encodeURIComponent(authorRouteId)}`,
				permalinkHref: `/a/${event.encode()}`,
				compareHref:
					topicEvents.length > 1
						? buildTopicComparisonHref(params.topic, [event.id])
						: undefined
			};
		});

		return {
			...buildTopicIndexShareData({
				url,
				topic: params.topic,
				entryCount: topicEntries.length
			}),
			topicEntries,
			seedEvents: topicEvents.map((event) => event.rawEvent() as NostrEvent)
		};
	} catch (error) {
		console.warn('[share] failed to load topic index metadata', error);

		return {
			...buildTopicIndexShareData({
				url,
				topic: params.topic,
				entryCount: 0
			}),
			topicEntries: [] satisfies TopicEntrySeed[],
			seedEvents: [] satisfies NostrEvent[]
		};
	}
};

function getRenderableTopicEvents(events: NDKEvent[]): NDKEvent[] {
	return events
		.filter((event) => !event.getMatchingTags('a').some((tag) => tag[3] === 'defer'))
		.sort((left, right) => {
			const createdAtDelta = (right.created_at ?? 0) - (left.created_at ?? 0);
			if (createdAtDelta !== 0) return createdAtDelta;
			return left.id.localeCompare(right.id);
		});
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
