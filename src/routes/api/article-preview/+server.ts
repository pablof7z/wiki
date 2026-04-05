import type { RequestHandler } from './$types';
import { renderArticlePreviewPng } from '$lib/server/article-preview';

export const GET: RequestHandler = async ({ url }) => {
	const png = renderArticlePreviewPng({
		title: url.searchParams.get('title') ?? 'Untitled',
		authorName: url.searchParams.get('author') ?? 'Wikifreedia',
		excerpt: url.searchParams.get('excerpt') ?? undefined,
		section: url.searchParams.get('section') ?? undefined,
		publishedLabel: url.searchParams.get('published') ?? undefined
	});
	const body = new Uint8Array(png);

	return new Response(body, {
		headers: {
			'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
			'content-length': String(png.byteLength),
			'content-type': 'image/png'
		}
	});
};
