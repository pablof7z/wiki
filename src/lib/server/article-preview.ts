import { Resvg } from '@resvg/resvg-js';
import {
	DEFAULT_SOCIAL_IMAGE_HEIGHT,
	DEFAULT_SOCIAL_IMAGE_WIDTH
} from '$lib/seo';

const ARTICLE_PREVIEW_PATH = '/api/article-preview';
const DEFAULT_EXCERPT = 'Read this living entry on Wikifreedia.';
const MAX_TITLE_LENGTH = 140;
const MAX_AUTHOR_LENGTH = 80;
const MAX_SECTION_LENGTH = 36;
const MAX_PUBLISHED_LENGTH = 36;
const MAX_EXCERPT_LENGTH = 280;

export type ArticlePreviewImageData = {
	title: string;
	authorName?: string;
	excerpt?: string;
	section?: string;
	publishedLabel?: string;
};

export function buildArticlePreviewImageUrl(
	pageUrl: URL,
	data: ArticlePreviewImageData
): string {
	const imageUrl = new URL(ARTICLE_PREVIEW_PATH, pageUrl.origin);
	const title = sanitizeText(data.title, MAX_TITLE_LENGTH) || 'Untitled';
	const authorName = sanitizeText(data.authorName, MAX_AUTHOR_LENGTH) || 'Wikifreedia';
	const excerpt = sanitizeText(data.excerpt, MAX_EXCERPT_LENGTH) || DEFAULT_EXCERPT;
	const section = sanitizeText(data.section, MAX_SECTION_LENGTH);
	const publishedLabel = sanitizeText(data.publishedLabel, MAX_PUBLISHED_LENGTH);

	imageUrl.searchParams.set('title', title);
	imageUrl.searchParams.set('author', authorName);
	imageUrl.searchParams.set('excerpt', excerpt);

	if (section) {
		imageUrl.searchParams.set('section', section);
	}

	if (publishedLabel) {
		imageUrl.searchParams.set('published', publishedLabel);
	}

	return imageUrl.toString();
}

export function renderArticlePreviewPng(data: ArticlePreviewImageData): Buffer {
	const svg = renderArticlePreviewSvg(data);
	const resvg = new Resvg(svg, {
		background: '#0b1118',
		fitTo: {
			mode: 'width',
			value: DEFAULT_SOCIAL_IMAGE_WIDTH
		},
		font: {
			loadSystemFonts: true,
			defaultFontFamily: 'Arial',
			sansSerifFamily: 'Arial'
		}
	});

	return resvg.render().asPng();
}

function renderArticlePreviewSvg(data: ArticlePreviewImageData): string {
	const title = sanitizeText(data.title, MAX_TITLE_LENGTH) || 'Untitled';
	const authorName = sanitizeText(data.authorName, MAX_AUTHOR_LENGTH) || 'Wikifreedia';
	const excerpt = sanitizeText(data.excerpt, MAX_EXCERPT_LENGTH) || DEFAULT_EXCERPT;
	const section = sanitizeText(data.section, MAX_SECTION_LENGTH) || 'Living entry';
	const publishedLabel = sanitizeText(data.publishedLabel, MAX_PUBLISHED_LENGTH);

	const titleLines = wrapText(title, 28, 3);
	const excerptLines = wrapText(excerpt, 64, 7);
	const metaLine = [authorName, publishedLabel].filter(Boolean).join(' / ');

	let titleText = '';
	for (const [index, line] of titleLines.entries()) {
		titleText += `<text x="154" y="${232 + index * 62}" font-size="54" font-weight="700" fill="#15171d">${escapeXml(line)}</text>`;
	}

	let excerptText = '';
	for (const [index, line] of excerptLines.entries()) {
		excerptText += `<text x="154" y="${446 + index * 28}" font-size="23" fill="#3b4251">${escapeXml(line)}</text>`;
	}

	let fillerLines = '';
	const fillerWidths = [720, 684, 628, 576];
	for (const [index, width] of fillerWidths.entries()) {
		const y = 466 + excerptLines.length * 28 + index * 26;
		if (y > 536) break;
		fillerLines += `<rect x="154" y="${y}" width="${width}" height="11" rx="5.5" fill="#d8cfbf" opacity="${0.65 - index * 0.1}" />`;
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${DEFAULT_SOCIAL_IMAGE_WIDTH}" height="${DEFAULT_SOCIAL_IMAGE_HEIGHT}" viewBox="0 0 ${DEFAULT_SOCIAL_IMAGE_WIDTH} ${DEFAULT_SOCIAL_IMAGE_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="88" y1="34" x2="1132" y2="612" gradientUnits="userSpaceOnUse">
      <stop stop-color="#13202b" />
      <stop offset="1" stop-color="#0b1118" />
    </linearGradient>
    <linearGradient id="paper" x1="96" y1="64" x2="1104" y2="566" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fbf5e9" />
      <stop offset="1" stop-color="#efe5d7" />
    </linearGradient>
    <filter id="shadow" x="60" y="36" width="1080" height="558" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix" />
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
      <feOffset dy="14" />
      <feGaussianBlur stdDeviation="18" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.020 0 0 0 0 0.035 0 0 0 0 0.055 0 0 0 0.28 0" />
      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_1" />
      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_1" result="shape" />
    </filter>
  </defs>
  <rect width="${DEFAULT_SOCIAL_IMAGE_WIDTH}" height="${DEFAULT_SOCIAL_IMAGE_HEIGHT}" fill="url(#bg)" />
  <circle cx="1042" cy="104" r="132" fill="#27445f" opacity="0.28" />
  <circle cx="176" cy="578" r="164" fill="#153047" opacity="0.22" />
  <g filter="url(#shadow)">
    <rect x="96" y="64" width="1008" height="502" rx="30" fill="url(#paper)" />
    <rect x="96" y="64" width="1008" height="72" rx="30" fill="#e8dece" />
    <path d="M96 106C96 83.9086 113.909 66 136 66H1064C1086.09 66 1104 83.9086 1104 106V136H96V106Z" fill="#e8dece" />
    <circle cx="132" cy="100" r="8" fill="#d7745f" />
    <circle cx="158" cy="100" r="8" fill="#d9b15e" />
    <circle cx="184" cy="100" r="8" fill="#6ea87d" />
    <text x="220" y="107" font-size="20" fill="#6b6257">wikifreedia / article preview</text>
    <rect x="154" y="166" width="146" height="34" rx="17" fill="#d7dee8" />
    <text x="176" y="189" font-size="17" font-weight="700" fill="#213245">${escapeXml(
			section.toUpperCase()
		)}</text>
    <rect x="838" y="166" width="202" height="34" rx="17" fill="#efe4d3" stroke="#dacfbf" />
    <text x="861" y="189" font-size="17" fill="#5a544b">live article snapshot</text>
    ${titleText}
    <text x="154" y="394" font-size="22" font-weight="600" fill="#505765">${escapeXml(metaLine)}</text>
    <rect x="154" y="414" width="786" height="1" fill="#d7ccbc" />
    ${excerptText}
    ${fillerLines}
    <rect x="998" y="208" width="56" height="244" rx="28" fill="#e9dece" />
    <rect x="1017" y="238" width="18" height="112" rx="9" fill="#c9bdad" />
    <rect x="1008" y="468" width="36" height="36" rx="18" fill="#d9cebf" />
    <rect x="94" y="550" width="1012" height="16" rx="8" fill="#e5d9c9" />
  </g>
</svg>`;
}

function sanitizeText(value: string | undefined, maxLength: number): string | undefined {
	if (!value) return undefined;

	const normalized = value
		.replace(/[\u0000-\u001f\u007f]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (!normalized) return undefined;
	if (normalized.length <= maxLength) return normalized;
	return `${normalized.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function wrapText(value: string, maxChars: number, maxLines: number): string[] {
	const words = value.split(/\s+/).filter(Boolean);
	if (words.length === 0) return [];

	const lines: string[] = [];
	let currentLine = '';
	let truncated = false;

	for (const word of words) {
		let remainingWord = word;

		while (remainingWord.length > maxChars) {
			if (currentLine) {
				lines.push(currentLine);
				currentLine = '';
			}

			lines.push(remainingWord.slice(0, maxChars));
			remainingWord = remainingWord.slice(maxChars);

			if (lines.length === maxLines) {
				truncated = true;
				return finalizeWrappedLines(lines, maxChars, maxLines, truncated);
			}
		}

		const nextLine = currentLine ? `${currentLine} ${remainingWord}` : remainingWord;

		if (nextLine.length <= maxChars) {
			currentLine = nextLine;
			continue;
		}

		if (currentLine) {
			lines.push(currentLine);
			currentLine = remainingWord;
		}

		if (lines.length === maxLines) {
			truncated = true;
			return finalizeWrappedLines(lines, maxChars, maxLines, truncated);
		}
	}

	if (currentLine) {
		lines.push(currentLine);
	}

	return finalizeWrappedLines(lines, maxChars, maxLines, truncated);
}

function finalizeWrappedLines(
	lines: string[],
	maxChars: number,
	maxLines: number,
	truncated: boolean
): string[] {
	const limited = lines.slice(0, maxLines);
	if (!truncated && lines.length <= maxLines) return limited;

	const lastLineIndex = Math.max(0, limited.length - 1);
	const lastLine = limited[lastLineIndex] ?? '';
	limited[lastLineIndex] = `${lastLine.slice(0, Math.max(0, maxChars - 3)).trim()}...`;
	return limited;
}

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}
