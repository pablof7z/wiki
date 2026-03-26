import type NDK from '@nostr-dev-kit/ndk';
import { NDKEvent, NDKHighlight, type NostrEvent } from '@nostr-dev-kit/ndk';

export type HighlightSourceGroup = {
	key: string;
	current: boolean;
	highlights: NDKEvent[];
	sourceEventId?: string;
	sourceAddress?: string;
	sourceUrl?: string;
};

export function buildWikiHighlight(
	ndk: NDK,
	input: {
		article: NDKEvent;
		text: string;
		context?: string;
	}
): NDKHighlight {
	if (!input.article.dTag) {
		throw new Error('Cannot create a Wikifreedia highlight without an article d-tag.');
	}

	if (!input.article.id) {
		throw new Error('Cannot create a Wikifreedia highlight without a source event id.');
	}

	const highlight = new NDKHighlight(ndk, {
		content: input.text,
		kind: NDKHighlight.kind
	} as NostrEvent);

	if (input.article.isParamReplaceable()) {
		highlight.tags.push(['a', input.article.tagAddress(), input.article.relay?.url ?? '']);
	}

	if (input.article.id) {
		highlight.tags.push([
			'e',
			input.article.id,
			input.article.relay?.url ?? '',
			input.article.pubkey
		]);
	}

	highlight.tags.push(['p', input.article.pubkey, input.article.relay?.url ?? '']);
	highlight.tags = highlight.tags.filter(([name]) => name !== 'd');
	highlight.tags.push(['d', input.article.dTag]);

	if (input.context) {
		highlight.context = input.context;
	}

	return highlight;
}

export function getHighlightTopic(event: NDKEvent): string | undefined {
	return event.tagValue('d');
}

export function getHighlightContext(event: NDKEvent): string | undefined {
	return event.tagValue('context');
}

export function getHighlightArticleEventId(event: NDKEvent): string | undefined {
	return event.getMatchingTags('e')[0]?.[1];
}

export function getHighlightArticleAddress(event: NDKEvent): string | undefined {
	return event.getMatchingTags('a')[0]?.[1];
}

export function getHighlightSourceUrl(event: NDKEvent): string | undefined {
	return event.getMatchingTags('r')[0]?.[1];
}

export function mergeUniqueEvents(...sources: Array<Iterable<NDKEvent> | undefined>): NDKEvent[] {
	const merged = new Map<string, NDKEvent>();

	for (const source of sources) {
		if (!source) continue;

		for (const event of source) {
			if (!event.id) continue;
			merged.set(event.id, event);
		}
	}

	return Array.from(merged.values()).sort((left, right) => (right.created_at ?? 0) - (left.created_at ?? 0));
}

export function groupHighlightsBySource(
	highlights: Iterable<NDKEvent>,
	currentArticle: NDKEvent
): HighlightSourceGroup[] {
	const groups = new Map<string, HighlightSourceGroup>();

	for (const highlight of Array.from(highlights).sort((left, right) => (right.created_at ?? 0) - (left.created_at ?? 0))) {
		const sourceEventId = getHighlightArticleEventId(highlight);
		const sourceAddress = getHighlightArticleAddress(highlight);
		const sourceUrl = getHighlightSourceUrl(highlight);
		const current = sourceEventId === currentArticle.id;
		const key = current
			? `current:${currentArticle.id}`
			: sourceEventId
				? `event:${sourceEventId}`
				: sourceAddress
					? `address:${sourceAddress}`
					: sourceUrl
						? `url:${sourceUrl}`
						: `highlight:${highlight.id}`;

		const existing = groups.get(key);
		if (existing) {
			existing.highlights.push(highlight);
			continue;
		}

		groups.set(key, {
			key,
			current,
			highlights: [highlight],
			sourceEventId,
			sourceAddress,
			sourceUrl
		});
	}

	return Array.from(groups.values()).sort((left, right) => {
		if (left.current !== right.current) return left.current ? -1 : 1;
		const leftNewest = left.highlights[0]?.created_at ?? 0;
		const rightNewest = right.highlights[0]?.created_at ?? 0;
		return rightNewest - leftNewest;
	});
}
