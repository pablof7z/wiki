import { describe, expect, it } from 'vitest';
import { buildProfileTopicSummaries } from './profile-topics';

describe('buildProfileTopicSummaries', () => {
	it('groups authored entries by topic and keeps the latest version metadata', () => {
		const topics = buildProfileTopicSummaries(
			[
				{
					id: 'older',
					created_at: 10,
					content: 'one two',
					tags: [
						['d', 'bitcoin'],
						['title', 'Bitcoin']
					]
				},
				{
					id: 'latest',
					created_at: 20,
					content: 'one two three four',
					tags: [
						['d', 'bitcoin'],
						['title', 'Bitcoin 2'],
						['c', 'Money']
					]
				}
			],
			'f7z.io'
		);

		expect(topics).toEqual([
			{
				id: 'latest',
				dTag: 'bitcoin',
				title: 'Bitcoin 2',
				entryHref: '/bitcoin/f7z.io',
				createdAt: 20,
				versionCount: 2,
				isDeferred: false,
				wordCount: 4,
				category: 'Money'
			}
		]);
	});

	it('marks deferred entries and preserves encoded route ids', () => {
		const topics = buildProfileTopicSummaries(
			[
				{
					id: 'deferred',
					created_at: 30,
					content: 'draft entry',
					tags: [
						['d', 'nostr protocol'],
						['a', '30818:pubkey:nostr protocol', '', 'defer']
					]
				}
			],
			'grinch@nostrcheck.me'
		);

		expect(topics[0]).toMatchObject({
			id: 'deferred',
			dTag: 'nostr protocol',
			entryHref: '/nostr%20protocol/grinch%40nostrcheck.me',
			isDeferred: true,
			versionCount: 1
		});
	});
});
