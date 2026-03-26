import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';
import {
	DEFAULT_SOCIAL_IMAGE_HEIGHT,
	DEFAULT_SOCIAL_IMAGE_PATH,
	DEFAULT_SOCIAL_IMAGE_WIDTH,
	SITE_NAME,
	type SeoImage,
	type SeoMetadata
} from '$lib/seo';
import { extractMarkupTitle } from '$lib/utils/markup';
import { prettifyNip05 } from '$lib/utils/nip05';
import { getPreferredDisplayName, shortenHexPubkey } from './nostr';

const ARTICLE_KIND = 30818;
const DEFAULT_ARTICLE_DESCRIPTION = 'Read this living entry on Wikifreedia.';
const DEFAULT_PROFILE_DESCRIPTION = 'Explore this Wikifreedia author profile.';

export type EntryPreview = {
	eyebrow: string;
	title: string;
	description: string;
	authorName?: string;
	publishedLabel?: string;
};

export type ProfileSeed = {
	userPubkey: string;
	resolvedNpub: string;
	userProfile?: NDKUserProfile;
};

export type ProfilePreview = {
	displayName: string;
	handle?: string;
	about?: string;
	avatarUrl?: string;
	bannerUrl?: string;
	websiteLabel?: string;
};

export type TopicPreview = {
	title: string;
	description: string;
	entryCount: number;
};

export function buildArticleShareData({
	url,
	event,
	profile,
	authorName,
	eyebrow = 'Shared article'
}: {
	url: URL;
	event: Pick<NDKEvent, 'kind' | 'content' | 'created_at' | 'dTag' | 'tagValue'>;
	profile?: NDKUserProfile;
	authorName: string;
	eyebrow?: string;
}): { seo: SeoMetadata; preview: EntryPreview } {
	const title = eventTitle(event);
	const excerpt = excerptFromMarkup(event.content, title);
	const description = truncateDescription(
		excerpt ? `By ${authorName}. ${excerpt}` : `By ${authorName}. ${DEFAULT_ARTICLE_DESCRIPTION}`
	);
	const image = resolveImage(url, {
		primary: extractEntryImageFromContent(event.content),
		fallback: profile?.banner || profile?.picture || profile?.image,
		alt: `${title} on ${SITE_NAME}`
	});

	return {
		seo: {
			title: formatPageTitle(title),
			description,
			canonical: canonicalUrl(url),
			type: event.kind === ARTICLE_KIND ? 'article' : 'website',
			image,
			author: authorName,
			publishedTime: toIsoTimestamp(event.created_at),
			section: cleanText(event.tagValue('c'))
		},
		preview: {
			eyebrow,
			title,
			description,
			authorName,
			publishedLabel: formatPublishedLabel(event.created_at)
		}
	};
}

export function buildTopicFallbackShareData({
	url,
	topic,
	authorName,
	profile
}: {
	url: URL;
	topic: string;
	authorName: string;
	profile?: NDKUserProfile;
}): { seo: SeoMetadata; preview: EntryPreview } {
	const topicLabel = humanizeTopic(topic);
	const description = truncateDescription(
		`Read ${authorName}'s living entry on ${topicLabel} on ${SITE_NAME}.`
	);
	const image = resolveImage(url, {
		primary: profile?.banner || profile?.picture || profile?.image,
		alt: `${topicLabel} on ${SITE_NAME}`
	});

	return {
		seo: {
			title: formatPageTitle(`${topicLabel} by ${authorName}`),
			description,
			canonical: canonicalUrl(url),
			type: 'article',
			image,
			author: authorName
		},
		preview: {
			eyebrow: 'Living entry',
			title: topicLabel,
			description,
			authorName
		}
	};
}

export function buildTopicIndexShareData({
	url,
	topic,
	entryCount
}: {
	url: URL;
	topic: string;
	entryCount: number;
}): { seo: SeoMetadata; preview: TopicPreview } {
	const topicLabel = humanizeTopic(topic);
	const entryLabel =
		entryCount > 0
			? `${entryCount} living ${entryCount === 1 ? 'entry' : 'entries'}`
			: 'living entries';
	const description = truncateDescription(
		`Explore ${entryLabel} on ${topicLabel} on ${SITE_NAME}.`
	);

	return {
		seo: {
			title: formatPageTitle(topicLabel),
			description,
			canonical: canonicalUrl(url),
			type: 'website',
			image: defaultImage(url, `${topicLabel} on ${SITE_NAME}`)
		},
		preview: {
			title: topicLabel,
			description,
			entryCount
		}
	};
}

export function buildMissingEntryShareData(url: URL): {
	seo: SeoMetadata;
	preview: EntryPreview | undefined;
} {
	return {
		preview: undefined,
		seo: {
			title: formatPageTitle('Wikifreedia entry'),
			description: DEFAULT_ARTICLE_DESCRIPTION,
			canonical: canonicalUrl(url),
			type: 'article',
			image: defaultImage(url, `Wikifreedia entry`)
		}
	};
}

export function buildProfileShareData({
	url,
	identifier,
	userPubkey,
	resolvedNpub,
	profile
}: {
	url: URL;
	identifier: string;
	userPubkey: string;
	resolvedNpub: string;
	profile?: NDKUserProfile;
}): { seo: SeoMetadata; preview: ProfilePreview; seed: ProfileSeed } {
	const fallbackName =
		(profile?.nip05 ? prettifyNip05(profile.nip05) : undefined) ||
		resolvedNpub ||
		identifier ||
		shortenHexPubkey(userPubkey);
	const displayName = getPreferredDisplayName(profile, fallbackName);
	const about = cleanProfileAbout(profile?.about || profile?.bio);
	const handle = buildHandle(profile, displayName);
	const image = resolveImage(url, {
		primary: profile?.banner || profile?.picture || profile?.image,
		alt: `${displayName} on ${SITE_NAME}`
	});
	const description = truncateDescription(
		about || `Explore ${displayName}'s author profile and published entries on ${SITE_NAME}.`
	);
	const websiteLabel = cleanWebsite(profile?.website);

	return {
		seo: {
			title: formatPageTitle(displayName),
			description,
			canonical: canonicalUrl(url),
			type: 'profile',
			image,
			author: displayName,
			username: cleanText(profile?.name) || prettifyNip05(profile?.nip05 ?? '') || undefined
		},
		preview: {
			displayName,
			handle,
			about,
			avatarUrl: normalizeAbsoluteUrl(profile?.picture || profile?.image),
			bannerUrl: normalizeAbsoluteUrl(profile?.banner),
			websiteLabel
		},
		seed: {
			userPubkey,
			resolvedNpub,
			userProfile: sanitizeProfile(profile)
		}
	};
}

export function buildMissingProfileShareData(url: URL, identifier: string): {
	seo: SeoMetadata;
	preview: ProfilePreview | undefined;
	seed: ProfileSeed | undefined;
} {
	return {
		preview: undefined,
		seed: undefined,
		seo: {
			title: formatPageTitle(identifier || 'Wikifreedia author'),
			description: DEFAULT_PROFILE_DESCRIPTION,
			canonical: canonicalUrl(url),
			type: 'profile',
			image: defaultImage(url, `Wikifreedia author`)
		}
	};
}

function eventTitle(event: Pick<NDKEvent, 'content' | 'dTag' | 'tagValue'>): string {
	return event.tagValue('title') || extractMarkupTitle(event.content) || event.dTag || 'Untitled';
}

function excerptFromMarkup(content: string, title?: string): string | undefined {
	const normalized = content
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/!\[[^\]]*]\(([^)]+)\)/g, ' ')
		.replace(/image::[^\[]+\[[^\]]*]/g, ' ')
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
		.replace(/\[\[([^|\]]+)\|?([^\]]*)\]\]/g, (_match, target: string, label: string) => label || target)
		.replace(/^\s*=\s+/gm, '')
		.replace(/^\s*#+\s+/gm, '')
		.replace(/https?:\/\/\S+/g, ' ')
		.replace(/[_*`>#|[\]{}]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (!normalized) return undefined;

	const withoutTitle = title
		? normalized.replace(new RegExp(`^${escapeRegex(title)}\\s*`, 'i'), '').trim()
		: normalized;

	return truncateDescription(withoutTitle || normalized, 190);
}

function extractEntryImageFromContent(content: string): string | undefined {
	const djotImage = content.match(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/i)?.[1];
	if (djotImage) return normalizeAbsoluteUrl(djotImage);

	const asciidocImage = content.match(/image::(https?:\/\/[^\[\s]+)\[/i)?.[1];
	if (asciidocImage) return normalizeAbsoluteUrl(asciidocImage);

	const bareImageUrl = content.match(/\bhttps?:\/\/\S+\.(?:png|jpe?g|gif|webp|avif)\b/i)?.[0];
	if (bareImageUrl) return normalizeAbsoluteUrl(bareImageUrl);

	return undefined;
}

function resolveImage(
	url: URL,
	params: { primary?: string; fallback?: string; alt: string }
): SeoImage {
	const candidate = normalizeAbsoluteUrl(params.primary) || normalizeAbsoluteUrl(params.fallback);
	if (candidate) {
		return {
			url: toAbsoluteUrl(url, candidate),
			alt: params.alt
		};
	}

	return defaultImage(url, params.alt);
}

function defaultImage(url: URL, alt: string): SeoImage {
	return {
		url: new URL(DEFAULT_SOCIAL_IMAGE_PATH, url.origin).toString(),
		alt,
		width: DEFAULT_SOCIAL_IMAGE_WIDTH,
		height: DEFAULT_SOCIAL_IMAGE_HEIGHT
	};
}

function canonicalUrl(url: URL): string {
	return new URL(url.pathname, url.origin).toString();
}

function toIsoTimestamp(createdAt?: number): string | undefined {
	if (!createdAt) return undefined;
	return new Date(createdAt * 1000).toISOString();
}

function formatPublishedLabel(createdAt?: number): string | undefined {
	if (!createdAt) return undefined;

	return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(createdAt * 1000));
}

function formatPageTitle(value: string): string {
	return `${value} | ${SITE_NAME}`;
}

function cleanText(value: string | undefined): string | undefined {
	const text = value?.trim();
	return text ? text : undefined;
}

function cleanProfileAbout(value: string | undefined): string | undefined {
	const text = cleanText(value);
	if (!text) return undefined;
	if (text.replace(/[~.\-_•\s]+/g, '').length < 2) return undefined;
	return text;
}

function cleanWebsite(value: string | undefined): string | undefined {
	const trimmed = cleanText(value);
	if (!trimmed) return undefined;
	return trimmed.replace(/^https?:\/\//, '');
}

function buildHandle(profile: NDKUserProfile | undefined, displayName: string): string | undefined {
	const candidate = cleanText(profile?.name);
	if (!candidate || candidate === displayName) return undefined;
	return candidate;
}

function sanitizeProfile(profile: NDKUserProfile | undefined): NDKUserProfile | undefined {
	if (!profile) return undefined;

	const sanitized: NDKUserProfile = {};

	for (const key of ['name', 'displayName', 'picture', 'image', 'banner', 'bio', 'about', 'nip05', 'website']) {
		const value = profile[key];
		if (typeof value === 'string' && value.trim()) {
			sanitized[key] = value;
		}
	}

	if (typeof profile.created_at === 'number') {
		sanitized.created_at = profile.created_at;
	}

	return sanitized;
}

function humanizeTopic(topic: string): string {
	const trimmed = topic.trim();
	if (!trimmed) return 'Untitled';
	return decodeURIComponent(trimmed).replace(/[-_]+/g, ' ');
}

function truncateDescription(text: string, maxLength = 170): string {
	if (text.length <= maxLength) return text;

	const sliced = text.slice(0, maxLength - 1);
	const boundary = Math.max(sliced.lastIndexOf(' '), sliced.lastIndexOf('.'));
	return `${sliced.slice(0, boundary > 80 ? boundary : sliced.length).trim()}…`;
}

function normalizeAbsoluteUrl(value: string | undefined): string | undefined {
	if (!value) return undefined;

	const candidate = value.trim();
	if (!candidate) return undefined;

	if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
		return candidate;
	}

	if (candidate.startsWith('/')) {
		return candidate;
	}

	return undefined;
}

function toAbsoluteUrl(url: URL, value: string): string {
	return new URL(value, url.origin).toString();
}

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
