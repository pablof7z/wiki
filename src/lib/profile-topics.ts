import type { NostrEvent } from '@nostr-dev-kit/ndk';

export type ProfileTopicSummary = {
	id: string;
	dTag: string;
	title: string;
	entryHref: string;
	createdAt?: number;
	versionCount: number;
	isDeferred: boolean;
	wordCount: number;
	category?: string;
};

export function buildProfileTopicSummaries(
	events: Iterable<Pick<NostrEvent, 'id' | 'created_at' | 'content' | 'tags'>>,
	routeId: string
): ProfileTopicSummary[] {
	const byTopic = new Map<string, ProfileTopicSummary>();

	for (const event of events) {
		const eventId = event.id?.trim();
		if (!eventId) continue;

		const dTagValue = getFirstTagValue(event.tags, 'd');
		if (!dTagValue) continue;
		const dTag = dTagValue;

		const createdAt = event.created_at ?? 0;
		const existing = byTopic.get(dTag);
		const nextTopic: ProfileTopicSummary = {
			id: eventId,
			dTag,
			title: getFirstTagValue(event.tags, 'title') || dTag || 'Untitled',
			entryHref: `/${encodeURIComponent(dTag)}/${encodeURIComponent(routeId)}`,
			createdAt: event.created_at,
			versionCount: existing?.versionCount ?? 0,
			isDeferred: hasDeferredMarker(event.tags),
			wordCount: countWords(event.content),
			category: getFirstTagValue(event.tags, 'c')
		};

		if (!existing || createdAt > (existing.createdAt ?? 0)) {
			byTopic.set(dTag, nextTopic);
		} else {
			byTopic.set(dTag, {
				...existing,
				versionCount: existing.versionCount
			});
		}

		const current = byTopic.get(dTag);
		if (current) {
			current.versionCount += 1;
		}
	}

	return Array.from(byTopic.values()).sort((left, right) => {
		const createdAtDelta = (right.createdAt ?? 0) - (left.createdAt ?? 0);
		if (createdAtDelta !== 0) return createdAtDelta;
		return left.dTag.localeCompare(right.dTag);
	});
}

function getFirstTagValue(tags: string[][], tagName: string): string | undefined {
	for (const tag of tags) {
		if (tag[0] !== tagName) continue;
		const value = tag[1]?.trim();
		if (value) return value;
	}

	return undefined;
}

function hasDeferredMarker(tags: string[][]): boolean {
	return tags.some((tag) => tag[0] === 'a' && tag[3] === 'defer');
}

function countWords(content: string): number {
	const normalized = content.trim();
	if (!normalized) return 0;
	return normalized.split(/\s+/).length;
}
