import { describe, expect, it } from 'vitest';
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
import {
	NIP22_COMMENT_KIND,
	buildCommentThread,
	buildNip22CommentTags,
	flattenCommentThread,
	getCommentParentId,
	isDirectReplyToRoot
} from './nip22';

function makeEvent(overrides: Partial<{ id: string; kind: number; pubkey: string; content: string; tags: string[][]; created_at: number }> = {}) {
	return new NDKEvent(undefined, {
		id: overrides.id ?? '1'.repeat(64),
		kind: overrides.kind ?? NDKKind.Wiki,
		pubkey: overrides.pubkey ?? '2'.repeat(64),
		content: overrides.content ?? '',
		tags: overrides.tags ?? [],
		created_at: overrides.created_at ?? 1,
		sig: '3'.repeat(128)
	});
}

function makeWikiEvent() {
	return makeEvent({
		id: 'a'.repeat(64),
		kind: NDKKind.Wiki,
		pubkey: 'b'.repeat(64),
		tags: [['d', 'bitcoin'], ['title', 'Bitcoin']]
	});
}

describe('NIP-22 helpers', () => {
	it('builds correct top-level tags for a wiki article comment', () => {
		const article = makeWikiEvent();
		const tags = buildNip22CommentTags(article, article);

		expect(tags).toEqual([
			['A', article.tagAddress(), ''],
			['K', String(NDKKind.Wiki)],
			['P', article.pubkey, ''],
			['a', article.tagAddress(), ''],
			['e', article.id, '', article.pubkey],
			['k', String(NDKKind.Wiki)],
			['p', article.pubkey, '']
		]);
	});

	it('builds correct reply tags for a highlight comment thread', () => {
		const highlight = makeEvent({
			id: 'c'.repeat(64),
			kind: NDKKind.Highlight,
			pubkey: 'd'.repeat(64)
		});
		const parentComment = makeEvent({
			id: 'e'.repeat(64),
			kind: NIP22_COMMENT_KIND,
			pubkey: 'f'.repeat(64)
		});

		expect(buildNip22CommentTags(highlight, parentComment)).toEqual([
			['E', highlight.id, '', highlight.pubkey],
			['K', String(NDKKind.Highlight)],
			['P', highlight.pubkey, ''],
			['e', parentComment.id, '', parentComment.pubkey],
			['k', String(NIP22_COMMENT_KIND)],
			['p', parentComment.pubkey, '']
		]);
	});

	it('detects direct replies to the root item', () => {
		const article = makeWikiEvent();
		const topLevelComment = makeEvent({
			id: '4'.repeat(64),
			kind: NIP22_COMMENT_KIND,
			pubkey: '5'.repeat(64),
			tags: buildNip22CommentTags(article, article)
		});

		expect(isDirectReplyToRoot(topLevelComment, article)).toBe(true);
	});

	it('extracts parent ids for nested comment replies', () => {
		const reply = makeEvent({
			id: '6'.repeat(64),
			kind: NIP22_COMMENT_KIND,
			pubkey: '7'.repeat(64),
			tags: [
				['E', '1'.repeat(64), '', '2'.repeat(64)],
				['K', String(NDKKind.Highlight)],
				['P', '2'.repeat(64), ''],
				['e', '8'.repeat(64), '', '9'.repeat(64)],
				['k', String(NIP22_COMMENT_KIND)],
				['p', '9'.repeat(64), '']
			]
		});

		expect(getCommentParentId(reply)).toBe('8'.repeat(64));
	});

	it('builds and flattens a reply tree', () => {
		const highlight = makeEvent({
			id: '9'.repeat(64),
			kind: NDKKind.Highlight,
			pubkey: 'a'.repeat(64)
		});
		const first = makeEvent({
			id: 'b'.repeat(64),
			kind: NIP22_COMMENT_KIND,
			pubkey: 'c'.repeat(64),
			created_at: 10,
			tags: buildNip22CommentTags(highlight, highlight)
		});
		const reply = makeEvent({
			id: 'd'.repeat(64),
			kind: NIP22_COMMENT_KIND,
			pubkey: 'e'.repeat(64),
			created_at: 11,
			tags: buildNip22CommentTags(highlight, first)
		});
		const second = makeEvent({
			id: 'f'.repeat(64),
			kind: NIP22_COMMENT_KIND,
			pubkey: '0'.repeat(64),
			created_at: 12,
			tags: buildNip22CommentTags(highlight, highlight)
		});

		const thread = buildCommentThread([first, reply, second], highlight);
		const flattened = flattenCommentThread(thread);

		expect(thread).toHaveLength(2);
		expect(thread[0]?.comment.id).toBe(second.id);
		expect(thread[1]?.replies[0]?.comment.id).toBe(reply.id);
		expect(flattened.map((entry) => [entry.comment.id, entry.depth])).toEqual([
			[second.id, 0],
			[first.id, 0],
			[reply.id, 1]
		]);
	});
});
