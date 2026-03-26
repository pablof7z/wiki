import { describe, expect, it, vi } from 'vitest';
import { NDKDraft, NDKWiki } from '@nostr-dev-kit/ndk';
import {
	buildWikiDraftEvent,
	collapseLatestDraftsByIdentifier,
	collapseLatestDraftsByKey,
	deriveNewWikiDraftKey,
	deriveWikiDraftKeyFromEvent,
	findMatchingWikiDraft,
	hydrateWikiDraftRecord,
	loadWikiDraftById,
	removeWikiDraftById,
	upsertActiveWikiDraft
} from './wiki-drafts';

function createWikiDraftEvent({
	title,
	dTag,
	content = 'Hello world',
	category,
	targetAddress
}: {
	title: string;
	dTag: string;
	content?: string;
	category?: string;
	targetAddress?: string;
}) {
	const event = new NDKWiki(undefined);
	event.kind = 30818;
	event.title = title;
	event.dTag = dTag;
	event.content = content;

	if (category) {
		event.tags.push(['c', category]);
	}

	if (targetAddress) {
		event.tags.push(['a', targetAddress, '', 'draft-target']);
	}

	return event;
}

function createDraft({
	id,
	createdAt,
	content = 'encrypted',
	event
}: {
	id: string;
	createdAt: number;
	content?: string;
	event?: NDKWiki;
}) {
	const draft = new NDKDraft(undefined);
	draft.identifier = id;
	draft.created_at = createdAt;
	draft.content = content;
	draft.tags.push(['k', '30818']);
	if (event) draft._event = event;
	return draft;
}

describe('wiki drafts', () => {
	it('derives a new draft key from a normalized title', () => {
		expect(deriveNewWikiDraftKey('  Ada Lovelace  ')).toBe('new:ada-lovelace');
	});

	it('derives an edit draft key from the target article address', () => {
		const event = createWikiDraftEvent({
			title: 'Ada',
			dTag: 'ada',
			targetAddress: '30818:pubkey123:ada'
		});

		expect(deriveWikiDraftKeyFromEvent(event)).toBe('edit:30818:pubkey123:ada');
	});

	it('collapses drafts by identifier and ignores blank tombstones', () => {
		const older = createDraft({
			id: 'draft-a',
			createdAt: 10,
			event: createWikiDraftEvent({ title: 'Alpha', dTag: 'alpha' })
		});
		const tombstone = createDraft({ id: 'draft-a', createdAt: 20, content: '' });

		expect(collapseLatestDraftsByIdentifier([older, tombstone])).toEqual([]);
	});

	it('hydrates a decrypted wiki draft into a manager record', async () => {
		const event = createWikiDraftEvent({
			title: 'History of Athens',
			dTag: 'history-of-athens',
			category: 'History'
		});
		const draft = createDraft({ id: 'draft-history', createdAt: 42, event });

		const record = await hydrateWikiDraftRecord(draft);

		expect(record).toMatchObject({
			draftId: 'draft-history',
			key: 'new:history-of-athens',
			origin: 'new',
			title: 'History of Athens',
			category: 'History',
			content: 'Hello world',
			updatedAt: 42,
			publishable: true
		});
	});

	it('builds wrapped draft events as wiki kind 30818 instead of article kind 30023', () => {
		const event = buildWikiDraftEvent(undefined, {
			title: 'Athens',
			category: 'History',
			content: 'Draft body',
			dTag: 'athens'
		});

		expect(event.kind).toBe(30818);
	});

	it('loads a specific draft id from the author draft set without relying on a direct #d filter', async () => {
		const target = createDraft({
			id: 'draft-target',
			createdAt: 42,
			event: createWikiDraftEvent({ title: 'Target', dTag: 'target' })
		});
		const other = createDraft({
			id: 'draft-other',
			createdAt: 10,
			event: createWikiDraftEvent({ title: 'Other', dTag: 'other' })
		});
		const fetchEvents = vi.fn().mockResolvedValue(new Set([other, target]));
		const ndk = { fetchEvents } as any;

		const record = await loadWikiDraftById(ndk, 'pubkey123', 'draft-target');

		expect(record?.draftId).toBe('draft-target');
		expect(fetchEvents).toHaveBeenCalledWith(
			{
				kinds: [31234],
				authors: ['pubkey123'],
				'#k': ['30818', '30023']
			},
			{ closeOnEose: true }
		);
	});

	it('keeps only the latest active draft for a logical key', () => {
		const older = {
			draftId: 'old',
			key: 'new:topic',
			updatedAt: 10
		} as any;
		const newer = {
			draftId: 'new',
			key: 'new:topic',
			updatedAt: 20
		} as any;

		expect(collapseLatestDraftsByKey([older, newer])).toEqual([newer]);
	});

	it('finds a conflicting draft while excluding the active draft id', () => {
		const drafts = [
			{ draftId: 'active', key: 'new:topic', updatedAt: 10 },
			{ draftId: 'other', key: 'new:topic', updatedAt: 20 }
		] as any;

		expect(findMatchingWikiDraft(drafts, 'new:topic', 'active')?.draftId).toBe('other');
	});

	it('replaces an existing active draft when a new one for the same key is saved', () => {
		const current = [
			{ draftId: 'draft-a', key: 'new:topic-a', updatedAt: 10 },
			{ draftId: 'draft-b', key: 'new:topic-b', updatedAt: 8 }
		] as any;
		const replacement = {
			draftId: 'draft-c',
			key: 'new:topic-a',
			updatedAt: 12
		} as any;

		expect(upsertActiveWikiDraft(current, replacement)).toEqual([replacement, current[1]]);
		expect(removeWikiDraftById(upsertActiveWikiDraft(current, replacement), 'draft-c')).toEqual([
			current[1]
		]);
	});
});
