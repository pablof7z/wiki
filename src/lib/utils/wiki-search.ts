import type { NDKEvent } from '@nostr-dev-kit/ndk';

function normalizeSearchValue(value: string): string {
	return value.trim().toLowerCase();
}

function collectSearchableValues(event: NDKEvent): string[] {
	const values = new Set<string>();

	if (event.dTag) values.add(event.dTag);
	if (event.content) values.add(event.content);

	for (const tag of event.tags) {
		for (const value of tag.slice(1)) {
			if (value) values.add(value);
		}
	}

	return Array.from(values, normalizeSearchValue);
}

export function matchesWikiSearch(event: NDKEvent, query: string): boolean {
	const normalizedQuery = normalizeSearchValue(query);
	if (!normalizedQuery) return true;

	if (normalizeSearchValue(event.dTag ?? '') === normalizedQuery) {
		return true;
	}

	const searchableValues = collectSearchableValues(event);
	const terms = normalizedQuery.split(/\s+/).filter(Boolean);

	return terms.every((term) => searchableValues.some((value) => value.includes(term)));
}
