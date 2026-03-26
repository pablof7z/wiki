import { describe, expect, it } from 'vitest';
import { matchesWikiSearch } from './wiki-search';

function makeEvent(overrides: Partial<{ dTag: string; content: string; tags: string[][] }> = {}) {
	return {
		dTag: overrides.dTag,
		content: overrides.content ?? '',
		tags: overrides.tags ?? []
	} as any;
}

describe('matchesWikiSearch', () => {
	it('matches an exact d-tag', () => {
		const event = makeEvent({ dTag: 'russia', content: 'unrelated body' });

		expect(matchesWikiSearch(event, 'russia')).toBe(true);
	});

	it('matches query terms in content', () => {
		const event = makeEvent({ dTag: 'europe', content: 'Russia spans Europe and Asia.' });

		expect(matchesWikiSearch(event, 'russia europe')).toBe(true);
	});

	it('rejects unrelated events', () => {
		const event = makeEvent({ dTag: 'omagh', content: 'A town in County Tyrone.' });

		expect(matchesWikiSearch(event, 'russia')).toBe(false);
	});
});
