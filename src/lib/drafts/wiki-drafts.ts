import NDK, {
	NDKDraft,
	NDKEvent,
	NDKKind,
	NDKWiki,
	type NDKFilter
} from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import { normalizeDTag } from '$lib/utils/dtag';
import { analyzeMarkupForRichEditor } from '$lib/utils/markup';

const WIKI_KIND_TAG = String(NDKKind.Wiki);
const LEGACY_ARTICLE_KIND_TAG = String(NDKKind.Article);
const SUPPORTED_DRAFT_KIND_TAGS = [WIKI_KIND_TAG, LEGACY_ARTICLE_KIND_TAG];
const DRAFT_TARGET_MARKER = 'draft-target';
const DRAFT_EXPIRATION_SECONDS = 90 * 24 * 60 * 60;

export type WikiDraftOrigin = 'new' | 'edit';

export type WikiDraftRecord = {
	draft: NDKDraft;
	event: NDKEvent;
	draftId: string;
	key: string;
	origin: WikiDraftOrigin;
	title: string;
	category: string;
	content: string;
	targetAddress?: string;
	targetNaddr?: string;
	updatedAt: number;
	publishable: boolean;
	publishabilityMessage?: string;
};

export type WikiDraftSaveInput = {
	draftId?: string;
	title: string;
	category?: string;
	content: string;
	dTag: string;
	targetAddress?: string;
};

type AddressRef = {
	kind: number;
	pubkey: string;
	identifier: string;
};

export function deriveNewWikiDraftKey(title: string): string | undefined {
	const dTag = normalizeDTag(title);
	return dTag ? `new:${dTag}` : undefined;
}

export function getWikiDraftTargetAddress(event: Pick<NDKEvent, 'tagValue'>): string | undefined {
	return event.tagValue('a', DRAFT_TARGET_MARKER);
}

export function deriveWikiDraftKeyFromEvent(
	event: Pick<NDKEvent, 'dTag' | 'tagValue'>
): string | undefined {
	const targetAddress = getWikiDraftTargetAddress(event);
	if (targetAddress) return `edit:${targetAddress}`;

	const dTag = event.dTag ?? normalizeDTag(event.tagValue('title') ?? '');
	return dTag ? `new:${dTag}` : undefined;
}

export function collapseLatestDraftsByIdentifier(drafts: NDKDraft[]): NDKDraft[] {
	const latestByIdentifier = new Map<string, NDKDraft>();

	for (const draft of drafts) {
		const identifier = draft.dTag;
		if (!identifier) continue;

		const existing = latestByIdentifier.get(identifier);
		if (!existing || compareDraftAge(draft, existing) < 0) {
			latestByIdentifier.set(identifier, draft);
		}
	}

	return Array.from(latestByIdentifier.values()).filter((draft) => draft.content !== '');
}

export function collapseLatestDraftsByKey(records: WikiDraftRecord[]): WikiDraftRecord[] {
	const latestByKey = new Map<string, WikiDraftRecord>();

	for (const record of records) {
		const existing = latestByKey.get(record.key);
		if (!existing || compareUpdatedAt(record, existing) < 0) {
			latestByKey.set(record.key, record);
		}
	}

	return Array.from(latestByKey.values()).sort((a, b) => compareUpdatedAt(a, b));
}

export function upsertActiveWikiDraft(
	records: WikiDraftRecord[],
	nextRecord: WikiDraftRecord
): WikiDraftRecord[] {
	return [nextRecord, ...records.filter((record) => record.draftId !== nextRecord.draftId && record.key !== nextRecord.key)]
		.sort((a, b) => compareUpdatedAt(a, b));
}

export function removeWikiDraftById(records: WikiDraftRecord[], draftId: string): WikiDraftRecord[] {
	return records.filter((record) => record.draftId !== draftId);
}

export function findMatchingWikiDraft(
	records: WikiDraftRecord[],
	key: string | undefined,
	excludingDraftId?: string
): WikiDraftRecord | undefined {
	if (!key) return undefined;

	return records.find((record) => record.key === key && record.draftId !== excludingDraftId);
}

export function getWikiDraftResumeHref(record: WikiDraftRecord): string | undefined {
	if (record.origin === 'edit') {
		if (!record.targetNaddr) return undefined;
		return `/a/${encodeURIComponent(record.targetNaddr)}/edit?draft=${encodeURIComponent(record.draftId)}`;
	}

	return `/new?draft=${encodeURIComponent(record.draftId)}`;
}

export function getWikiDraftLiveHref(record: WikiDraftRecord): string | undefined {
	if (!record.targetNaddr) return undefined;
	return `/a/${encodeURIComponent(record.targetNaddr)}`;
}

export async function hydrateWikiDraftRecord(draft: NDKDraft): Promise<WikiDraftRecord | undefined> {
	const draftId = draft.dTag;
	if (!draftId || draft.content === '') return undefined;
	if (!SUPPORTED_DRAFT_KIND_TAGS.includes(draft.tagValue('k') ?? '')) return undefined;

	const event = await draft.getEvent();
	if (!event) return undefined;

	const key = deriveWikiDraftKeyFromEvent(event);
	if (!key) return undefined;

	const targetAddress = getWikiDraftTargetAddress(event);
	const title = event.tagValue('title') || event.dTag || 'Untitled draft';
	const category = event.tagValue('c') ?? '';
	const analysis = analyzeMarkupForRichEditor(event.content);

	return {
		draft,
		event,
		draftId,
		key,
		origin: targetAddress ? 'edit' : 'new',
		title,
		category,
		content: event.content,
		targetAddress,
		targetNaddr: targetAddress ? encodeAddressRef(parseAddressRef(targetAddress)) : undefined,
		updatedAt: draft.created_at ?? 0,
		publishable: analysis.publishable,
		publishabilityMessage: analysis.message
	};
}

export async function listWikiDraftsForAuthor(ndk: NDK, authorPubkey: string): Promise<WikiDraftRecord[]> {
	const drafts = await fetchWikiDraftsForAuthor(ndk, authorPubkey);
	const hydrated = await Promise.all(drafts.map((draft) => hydrateWikiDraftRecord(draft)));

	return collapseLatestDraftsByKey(hydrated.filter((record): record is WikiDraftRecord => Boolean(record)));
}

export async function loadWikiDraftById(
	ndk: NDK,
	authorPubkey: string,
	draftId: string
): Promise<WikiDraftRecord | undefined> {
	const drafts = await fetchWikiDraftsForAuthor(ndk, authorPubkey);
	const draft = drafts.find((candidate) => candidate.dTag === draftId);
	if (!draft) return undefined;

	return hydrateWikiDraftRecord(draft);
}

export async function saveWikiDraft(ndk: NDK, input: WikiDraftSaveInput): Promise<WikiDraftRecord> {
	const draft = new NDKDraft(ndk);
	draft.identifier = input.draftId ?? createOpaqueDraftId();
	draft.event = buildWikiDraftEvent(ndk, input);
	replaceExpirationTag(draft);
	await draft.save({});

	const record = await hydrateWikiDraftRecord(draft);
	if (!record) throw new Error('Failed to hydrate saved draft.');

	return record;
}

export async function deleteWikiDraft(
	ndk: NDK,
	draftId: string,
	kindTag = WIKI_KIND_TAG
): Promise<void> {
	const tombstone = new NDKDraft(ndk);
	tombstone.identifier = draftId;
	tombstone.tags.push(['k', kindTag]);
	tombstone.content = '';
	tombstone.created_at = undefined;
	tombstone.id = '';
	tombstone.sig = '';
	await tombstone.publishReplaceable();
}

export function buildWikiDraftEvent(ndk: NDK | undefined, input: WikiDraftSaveInput): NDKWiki {
	const event = new NDKWiki(ndk);
	event.kind = NDKKind.Wiki;
	event.content = input.content;
	event.dTag = input.dTag;
	event.title = input.title.trim() || undefined;
	event.removeTag('c');

	if (input.category?.trim()) {
		event.tags.push(['c', input.category.trim()]);
	}

	event.removeTag('a', DRAFT_TARGET_MARKER);
	if (input.targetAddress) {
		event.tags.push(['a', input.targetAddress, '', DRAFT_TARGET_MARKER]);
	}

	return event;
}

function buildDraftFilter(extra: Record<string, string[] | undefined>): NDKFilter {
	return {
		kinds: [NDKKind.Draft],
		'#k': SUPPORTED_DRAFT_KIND_TAGS,
		...extra
	};
}

async function fetchWikiDraftsForAuthor(ndk: NDK, authorPubkey: string): Promise<NDKDraft[]> {
	const events = await ndk.fetchEvents(buildDraftFilter({ authors: [authorPubkey] }), {
		closeOnEose: true
	});

	return collapseLatestDraftsByIdentifier(
		(Array.from(events) as NDKEvent[]).map((event) => wrapDraft(event))
	);
}

function wrapDraft(event: NDKEvent): NDKDraft {
	return event instanceof NDKDraft ? event : NDKDraft.from(event);
}

function replaceExpirationTag(draft: NDKDraft): void {
	draft.removeTag('expiration');
	draft.tags.push(['expiration', String(Math.floor(Date.now() / 1000) + DRAFT_EXPIRATION_SECONDS)]);
}

function createOpaqueDraftId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID().replace(/-/g, '');
	}

	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function compareDraftAge(a: Pick<NDKDraft, 'created_at' | 'content'>, b: Pick<NDKDraft, 'created_at' | 'content'>): number {
	const timeDiff = (b.created_at ?? 0) - (a.created_at ?? 0);
	if (timeDiff !== 0) return timeDiff;

	return b.content.length - a.content.length;
}

function compareUpdatedAt(
	a: Pick<WikiDraftRecord, 'updatedAt' | 'draftId'>,
	b: Pick<WikiDraftRecord, 'updatedAt' | 'draftId'>
): number {
	const timeDiff = b.updatedAt - a.updatedAt;
	if (timeDiff !== 0) return timeDiff;

	return b.draftId.localeCompare(a.draftId);
}

function parseAddressRef(address: string): AddressRef | undefined {
	const [rawKind, pubkey, identifier] = address.split(':');
	const kind = Number(rawKind);

	if (!Number.isFinite(kind) || !pubkey || !identifier) return undefined;

	return { kind, pubkey, identifier };
}

function encodeAddressRef(addressRef: AddressRef | undefined): string | undefined {
	if (!addressRef) return undefined;

	return nip19.naddrEncode({
		kind: addressRef.kind,
		pubkey: addressRef.pubkey,
		identifier: addressRef.identifier,
		relays: []
	});
}
