import { afterEach, describe, expect, it, vi } from 'vitest';
import { createComparableEventFetcher, shortenHexPubkey } from './nostr';

describe('createComparableEventFetcher', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('falls back to a shortened pubkey when profile lookup fails', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});

		const pubkey = 'f'.repeat(64);
		const eventId = 'a'.repeat(64);
		const fetchComparableEvents = createComparableEventFetcher({
			relayUrls: ['wss://relay.example.com'],
			getClient: async () => ({
				async fetchEvent() {
					return {
						id: eventId,
						kind: 30818,
						content: '# Entry title\n\nSome entry content',
						pubkey,
						created_at: 1_710_000_000,
						dTag: 'entry-title',
						tagValue() {
							return undefined;
						}
					};
				},
				getUser() {
					return {
						async fetchProfile() {
							throw new Error('profile fetch failed');
						}
					};
				}
			})
		});

		const [entry] = await fetchComparableEvents([eventId]);

		expect(entry.authorName).toBe(shortenHexPubkey(pubkey));
		expect(entry.title).toBe('Entry title');
	});
});
