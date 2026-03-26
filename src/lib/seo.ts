export const SITE_NAME = 'Wikifreedia';
export const DEFAULT_SOCIAL_IMAGE_PATH = '/og-default.png';
export const DEFAULT_SOCIAL_IMAGE_WIDTH = 1200;
export const DEFAULT_SOCIAL_IMAGE_HEIGHT = 630;

export type SeoImage = {
	url: string;
	alt: string;
	width?: number;
	height?: number;
};

export type SeoMetadata = {
	title: string;
	description: string;
	canonical: string;
	type?: string;
	image?: SeoImage;
	siteName?: string;
	author?: string;
	publishedTime?: string;
	section?: string;
	username?: string;
	robots?: string;
};
