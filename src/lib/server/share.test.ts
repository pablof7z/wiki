import { describe, expect, it, vi } from 'vitest';

vi.mock('./nostr', () => ({
	getPreferredDisplayName: (_profile: unknown, fallback: string) => fallback,
	shortenHexPubkey: (pubkey: string) => pubkey
}));

import { buildArticleShareData } from './share';

describe('buildArticleShareData', () => {
	it('uses the first embedded article image when one exists', () => {
		const result = buildArticleShareData({
			url: new URL('https://wikifreedia.example/a/naddr123'),
			authorName: 'Alice Example',
			event: {
				kind: 30818,
				content: '![Alt text](https://cdn.example/article.png)\n\nArticle body',
				created_at: 1_774_579_200,
				dTag: 'living-topic',
				tagValue(name: string) {
					if (name === 'title') return 'Living Topic';
					if (name === 'c') return 'Culture';
					return undefined;
				}
			}
		});

		expect(result.seo.image?.url).toBe('https://cdn.example/article.png');
	});

	it('falls back to a generated article preview image when no article image is embedded', () => {
		const result = buildArticleShareData({
			url: new URL('https://wikifreedia.example/a/naddr123'),
			authorName: 'Alice Example',
			event: {
				kind: 30818,
				content: 'The image should come from the article content preview, not a generic placeholder.',
				created_at: 1_774_579_200,
				dTag: 'living-topic',
				tagValue(name: string) {
					if (name === 'title') return 'Living Topic';
					if (name === 'c') return 'Culture';
					return undefined;
				}
			}
		});

		const imageUrl = new URL(result.seo.image?.url ?? '');

		expect(imageUrl.origin).toBe('https://wikifreedia.example');
		expect(imageUrl.pathname).toBe('/api/article-preview');
		expect(imageUrl.searchParams.get('title')).toBe('Living Topic');
		expect(imageUrl.searchParams.get('author')).toBe('Alice Example');
		expect(imageUrl.searchParams.get('section')).toBe('Culture');
		expect(imageUrl.searchParams.get('excerpt')).toContain('article content preview');
	});
});
