import { describe, expect, it } from 'vitest';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import {
	buildWikiHighlight,
	getHighlightArticleAddress,
	getHighlightArticleEventId,
	getHighlightContext,
	groupHighlightsBySource,
	mergeUniqueEvents
} from './nostr';

function makeEvent(
	overrides: Partial<{
		id: string;
		kind: number;
		pubkey: string;
		tags: string[][];
		created_at: number;
		content: string;
	}> = {}
) {
	return new NDKEvent(undefined, {
		id: overrides.id ?? '1'.repeat(64),
		kind: overrides.kind ?? NDKKind.Wiki,
		pubkey: overrides.pubkey ?? '2'.repeat(64),
		tags: overrides.tags ?? [],
		created_at: overrides.created_at ?? 1,
		content: overrides.content ?? '',
		sig: '3'.repeat(128)
	});
}

function makeWikiEvent(
	overrides: Partial<{ id: string; pubkey: string; dTag: string; created_at: number }> = {}
) {
	return makeEvent({
		id: overrides.id ?? 'a'.repeat(64),
		kind: NDKKind.Wiki,
		pubkey: overrides.pubkey ?? 'b'.repeat(64),
		created_at: overrides.created_at ?? 1,
		tags: [['d', overrides.dTag ?? 'bitcoin'], ['title', 'Bitcoin']]
	});
}

describe('highlight nostr helpers', () => {
	it('builds a wiki highlight with source, topic, and context without offsets', () => {
		const article = makeWikiEvent();
		const highlight = buildWikiHighlight(undefined as never, {
			article,
			text: 'important quote',
			context: 'full paragraph'
		});

		expect(highlight.kind).toBe(NDKKind.Highlight);
		expect(highlight.content).toBe('important quote');
		expect(getHighlightArticleAddress(highlight)).toBe(article.tagAddress());
		expect(getHighlightArticleEventId(highlight)).toBe(article.id);
		expect(highlight.getMatchingTags('p')[0]?.[1]).toBe(article.pubkey);
		expect(highlight.getMatchingTags('offset')).toEqual([]);
		expect(getHighlightContext(highlight)).toBe('full paragraph');
		expect(highlight.tagValue('d')).toBe(article.dTag);
	});

	it('deduplicates merged highlight feeds and keeps newest first', () => {
		const article = makeWikiEvent();
		const older = buildWikiHighlight(undefined as never, {
			article,
			text: 'older'
		});
		older.id = 'e'.repeat(64);
		older.created_at = 10;

		const newer = buildWikiHighlight(undefined as never, {
			article,
			text: 'newer'
		});
		newer.id = 'f'.repeat(64);
		newer.created_at = 11;

		const duplicate = buildWikiHighlight(undefined as never, {
			article,
			text: 'dup'
		});
		duplicate.id = newer.id;
		duplicate.created_at = newer.created_at;

		expect(mergeUniqueEvents([older, newer], [duplicate]).map((event) => event.id)).toEqual([
			newer.id,
			older.id
		]);
	});

	it('groups highlights by current article and other source articles', () => {
		const currentArticle = makeWikiEvent({ id: '0'.repeat(64), dTag: 'bitcoin' });
		const otherArticle = makeWikiEvent({ id: '1'.repeat(64), dTag: 'bitcoin', pubkey: '9'.repeat(64) });
		const currentHighlight = buildWikiHighlight(undefined as never, {
			article: currentArticle,
			text: 'current'
		});
		currentHighlight.id = '2'.repeat(64);
		currentHighlight.created_at = 20;

		const otherHighlight = buildWikiHighlight(undefined as never, {
			article: otherArticle,
			text: 'other'
		});
		otherHighlight.id = '3'.repeat(64);
		otherHighlight.created_at = 19;

		const groups = groupHighlightsBySource([currentHighlight, otherHighlight], currentArticle);

		expect(groups).toHaveLength(2);
		expect(groups[0]).toMatchObject({
			current: true,
			sourceEventId: currentArticle.id
		});
		expect(groups[1]).toMatchObject({
			current: false,
			sourceEventId: otherArticle.id
		});
	});
});
