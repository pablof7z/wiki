import { describe, expect, it } from 'vitest';
import { buildArticlePreviewImageUrl, renderArticlePreviewPng } from './article-preview';

describe('article preview image helpers', () => {
	it('builds a same-origin preview image URL with encoded article data', () => {
		const imageUrl = new URL(
			buildArticlePreviewImageUrl(new URL('https://wikifreedia.example/a/naddr123'), {
				title: 'A living article title',
				authorName: 'Alice Example',
				excerpt: 'This preview should be derived from the article body.',
				section: 'Culture',
				publishedLabel: 'Mar 27, 2026'
			})
		);

		expect(imageUrl.origin).toBe('https://wikifreedia.example');
		expect(imageUrl.pathname).toBe('/api/article-preview');
		expect(imageUrl.searchParams.get('title')).toBe('A living article title');
		expect(imageUrl.searchParams.get('author')).toBe('Alice Example');
		expect(imageUrl.searchParams.get('section')).toBe('Culture');
		expect(imageUrl.searchParams.get('published')).toBe('Mar 27, 2026');
	});

	it('renders a PNG buffer for the article preview image', () => {
		const png = renderArticlePreviewPng({
			title: 'Can the preview image reflect the article itself?',
			authorName: 'Alice Example',
			excerpt: 'Yes. This route renders a social card that looks like an article snapshot instead of falling back to a generic image.',
			section: 'Technology',
			publishedLabel: 'Mar 27, 2026'
		});

		expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
		expect(png.byteLength).toBeGreaterThan(1500);
	});
});
