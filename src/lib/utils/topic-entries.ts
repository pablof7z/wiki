import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { wotFilterAndRankEvents } from '$lib/stores/wot';

export function isDeferredEntry(entry: NDKEvent): boolean {
	return entry.getMatchingTags('a').some((tag) => tag[3] === 'defer');
}

export function getRenderableTopicEntries(events?: Iterable<NDKEvent> | null): NDKEvent[] {
	if (!events) return [];

	return wotFilterAndRankEvents(Array.from(events).filter((entry) => !isDeferredEntry(entry)));
}
