import { describe, expect, it } from 'vitest';
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { getRenderableTopicEntries, isDeferredEntry } from './topic-entries';

function createEntry(tags: string[][] = []): NDKEvent {
	return {
		getMatchingTags(tagName: string) {
			return tags.filter((tag) => tag[0] === tagName);
		}
	} as NDKEvent;
}

describe('topic entry helpers', () => {
	it('detects deferred entries from "a" tags', () => {
		expect(isDeferredEntry(createEntry([['a', '30818:pubkey:topic', '', 'defer']]))).toBe(true);
		expect(isDeferredEntry(createEntry([['a', '30818:pubkey:topic']]))).toBe(false);
	});

	it('excludes deferred entries from the rendered topic list', () => {
		const canonicalEntry = createEntry();
		const deferredEntry = createEntry([['a', '30818:pubkey:topic', '', 'defer']]);

		expect(getRenderableTopicEntries([canonicalEntry, deferredEntry])).toEqual([canonicalEntry]);
	});
});
