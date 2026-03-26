export const BLOSSOM_PROFILE_UPLOAD_SERVER = 'https://blossom.primal.net';

type AvatarVariant = {
	id: string;
	label: string;
	bgFrom: string;
	bgTo: string;
	skin: string;
	hair: string;
	shirt: string;
	accent: string;
	hairStyle: 'crop' | 'wave' | 'bob' | 'buzz' | 'curly' | 'part' | 'pixie' | 'crown';
	accessory?: 'glasses' | 'hoops';
};

const SUGGESTED_AVATAR_VARIANTS: AvatarVariant[] = [
	{
		id: 'marlow',
		label: 'Marlow',
		bgFrom: '#1d3557',
		bgTo: '#4d84b8',
		skin: '#f0c6a4',
		hair: '#261b1e',
		shirt: '#e76f51',
		accent: '#f4d7b2',
		hairStyle: 'wave'
	},
	{
		id: 'sora',
		label: 'Sora',
		bgFrom: '#372248',
		bgTo: '#7b4ea3',
		skin: '#f5d2bb',
		hair: '#21152f',
		shirt: '#ff8fab',
		accent: '#ffd6e0',
		hairStyle: 'bob'
	},
	{
		id: 'quinn',
		label: 'Quinn',
		bgFrom: '#133c55',
		bgTo: '#3e8e9f',
		skin: '#e9b998',
		hair: '#13232f',
		shirt: '#f4a261',
		accent: '#ffe1bf',
		hairStyle: 'buzz',
		accessory: 'glasses'
	},
	{
		id: 'iona',
		label: 'Iona',
		bgFrom: '#4a1942',
		bgTo: '#893168',
		skin: '#f3c9ac',
		hair: '#40211c',
		shirt: '#ffb703',
		accent: '#ffe3a1',
		hairStyle: 'curly'
	},
	{
		id: 'juniper',
		label: 'Juniper',
		bgFrom: '#1b4332',
		bgTo: '#52b788',
		skin: '#f2c39d',
		hair: '#16211a',
		shirt: '#dad7cd',
		accent: '#f5ede0',
		hairStyle: 'pixie'
	},
	{
		id: 'ren',
		label: 'Ren',
		bgFrom: '#16213e',
		bgTo: '#4e6e81',
		skin: '#ebb793',
		hair: '#14161d',
		shirt: '#cdb4db',
		accent: '#efe0f6',
		hairStyle: 'crop'
	},
	{
		id: 'paloma',
		label: 'Paloma',
		bgFrom: '#512b58',
		bgTo: '#b27092',
		skin: '#f1c7a2',
		hair: '#311b2e',
		shirt: '#f28482',
		accent: '#ffd8d6',
		hairStyle: 'part',
		accessory: 'hoops'
	},
	{
		id: 'atlas',
		label: 'Atlas',
		bgFrom: '#283618',
		bgTo: '#7ca982',
		skin: '#dca986',
		hair: '#221f1c',
		shirt: '#bc6c25',
		accent: '#f6bd60',
		hairStyle: 'crown'
	},
	{
		id: 'tala',
		label: 'Tala',
		bgFrom: '#004e64',
		bgTo: '#4ea8de',
		skin: '#f6d0b7',
		hair: '#231f2a',
		shirt: '#ffd166',
		accent: '#fff0c2',
		hairStyle: 'wave'
	},
	{
		id: 'niko',
		label: 'Niko',
		bgFrom: '#3a0ca3',
		bgTo: '#7b2cbf',
		skin: '#e7b087',
		hair: '#1f1235',
		shirt: '#4cc9f0',
		accent: '#d9f6ff',
		hairStyle: 'buzz'
	},
	{
		id: 'mae',
		label: 'Mae',
		bgFrom: '#264653',
		bgTo: '#5c8d89',
		skin: '#f4c7a9',
		hair: '#3b2f2f',
		shirt: '#e9c46a',
		accent: '#fff1bf',
		hairStyle: 'bob',
		accessory: 'glasses'
	},
	{
		id: 'zev',
		label: 'Zev',
		bgFrom: '#3d405b',
		bgTo: '#81b29a',
		skin: '#dca17f',
		hair: '#211f2f',
		shirt: '#e07a5f',
		accent: '#f8d6cd',
		hairStyle: 'crop'
	},
	{
		id: 'lyra',
		label: 'Lyra',
		bgFrom: '#5f0f40',
		bgTo: '#9a1750',
		skin: '#f0c3a5',
		hair: '#29161d',
		shirt: '#fb8b24',
		accent: '#ffd0a1',
		hairStyle: 'curly',
		accessory: 'hoops'
	},
	{
		id: 'noor',
		label: 'Noor',
		bgFrom: '#0f4c5c',
		bgTo: '#4d908e',
		skin: '#efc3a0',
		hair: '#182022',
		shirt: '#f9844a',
		accent: '#ffd8c2',
		hairStyle: 'part'
	},
	{
		id: 'beck',
		label: 'Beck',
		bgFrom: '#2b2d42',
		bgTo: '#5c677d',
		skin: '#d7a17c',
		hair: '#161616',
		shirt: '#ef476f',
		accent: '#ffd3de',
		hairStyle: 'crown'
	},
	{
		id: 'sol',
		label: 'Sol',
		bgFrom: '#5a189a',
		bgTo: '#9d4edd',
		skin: '#f5ccb0',
		hair: '#2d1b3d',
		shirt: '#06d6a0',
		accent: '#c9fff2',
		hairStyle: 'pixie'
	}
];

export type SuggestedPictureOption = {
	id: string;
	url: string;
	alt: string;
	label: string;
};

export function buildSuggestedPictureOptions(
	count = 8,
	random: () => number = Math.random
): SuggestedPictureOption[] {
	const variants = [...SUGGESTED_AVATAR_VARIANTS];

	for (let index = variants.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(random() * (index + 1));
		[variants[index], variants[swapIndex]] = [variants[swapIndex], variants[index]];
	}

	return variants.slice(0, Math.min(count, variants.length)).map((variant) => ({
		id: variant.id,
		url: createAvatarDataUrl(variant),
		alt: `${variant.label} avatar`,
		label: variant.label
	}));
}

function createAvatarDataUrl(variant: AvatarVariant): string {
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none">
			<defs>
				<linearGradient id="bg-${variant.id}" x1="20" y1="16" x2="136" y2="144" gradientUnits="userSpaceOnUse">
					<stop stop-color="${variant.bgFrom}" />
					<stop offset="1" stop-color="${variant.bgTo}" />
				</linearGradient>
			</defs>
			<rect width="160" height="160" rx="80" fill="url(#bg-${variant.id})" />
			<circle cx="126" cy="34" r="22" fill="${variant.accent}" opacity="0.18" />
			<path d="M0 128c28-20 59-30 93-30 26 0 48 5 67 16v46H0z" fill="${variant.accent}" opacity="0.16" />
			<path d="M28 160c6-31 25-47 52-47 30 0 46 16 52 47H28z" fill="${variant.shirt}" />
			<path d="M57 117c6 10 13 15 23 15s17-5 23-15l8 5c-7 13-18 21-31 21-14 0-24-8-31-21l8-5z" fill="${variant.accent}" opacity="0.92" />
			<rect x="71" y="90" width="18" height="22" rx="9" fill="${variant.skin}" />
			<ellipse cx="80" cy="70" rx="28" ry="31" fill="${variant.skin}" />
			${buildHairSvg(variant)}
			<circle cx="69" cy="71" r="2.7" fill="#1f1f1f" />
			<circle cx="91" cy="71" r="2.7" fill="#1f1f1f" />
			<path d="M65 62c2-3 5-4 8-4s6 1 8 4" stroke="#2d2d2d" stroke-width="2.5" stroke-linecap="round" opacity="0.35" />
			<path d="M79 61c2-3 5-4 8-4s6 1 8 4" stroke="#2d2d2d" stroke-width="2.5" stroke-linecap="round" opacity="0.35" />
			<path d="M72 84c2.5 3 5.5 4.5 8 4.5s5.5-1.5 8-4.5" stroke="#8a4f48" stroke-width="2.5" stroke-linecap="round" />
			${buildAccessorySvg(variant)}
		</svg>
	`;

	return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
}

function buildHairSvg(variant: AvatarVariant): string {
	const fill = variant.hair;

	switch (variant.hairStyle) {
		case 'crop':
			return `<path d="M46 69c1-27 16-44 34-44 22 0 37 17 37 41 0 8-1 12-3 16-7-11-19-18-34-18S53 71 46 82c-1-3-1-7 0-13z" fill="${fill}" />`;
		case 'wave':
			return `<path d="M41 74c1-32 18-50 40-50 14 0 25 6 33 17 8 10 11 24 8 40-8-11-18-18-31-20-21-3-38 4-50 21-1-3-1-5 0-8z" fill="${fill}" />`;
		case 'bob':
			return `<path d="M39 64c4-27 20-43 41-43 22 0 40 17 41 42 1 17-5 30-17 40-4-18-16-30-24-30s-20 12-24 30c-13-9-19-22-17-39z" fill="${fill}" />`;
		case 'buzz':
			return `<path d="M50 60c5-20 18-32 34-32 17 0 30 12 34 32-9-7-21-11-34-11s-25 4-34 11z" fill="${fill}" />`;
		case 'curly':
			return `<path d="M42 73c2-30 18-47 40-47 10 0 19 3 27 10 12 10 18 25 16 42-9-11-21-16-36-16-17 0-31 6-42 18-3-3-5-5-5-7z" fill="${fill}" /><circle cx="58" cy="43" r="9" fill="${fill}" /><circle cx="78" cy="35" r="11" fill="${fill}" /><circle cx="101" cy="41" r="10" fill="${fill}" />`;
		case 'part':
			return `<path d="M44 74c1-29 16-48 38-48 13 0 23 4 31 13 8 9 12 21 11 36-9-8-18-12-28-12-11 0-18 4-22 8-8-6-17-9-27-9-1 4-2 8-3 12z" fill="${fill}" />`;
		case 'pixie':
			return `<path d="M49 68c3-26 18-41 37-41 13 0 24 6 31 17-11-2-19-1-26 4 11 0 20 5 26 14-8-1-16 2-24 8-10-8-24-9-44-2z" fill="${fill}" />`;
		case 'crown':
			return `<path d="M47 70c3-28 18-45 39-45 20 0 36 17 38 43-9-7-18-11-27-11-8 0-14 2-18 7-4-5-10-7-18-7-6 0-11 1-14 3-1 3-1 6 0 10z" fill="${fill}" />`;
	}
}

function buildAccessorySvg(variant: AvatarVariant): string {
	if (variant.accessory === 'glasses') {
		return `<g stroke="${variant.accent}" stroke-width="2.8" fill="none" opacity="0.9"><rect x="58" y="64" width="17" height="13" rx="5" /><rect x="85" y="64" width="17" height="13" rx="5" /><path d="M75 70h10" stroke-linecap="round" /></g>`;
	}

	if (variant.accessory === 'hoops') {
		return `<circle cx="52" cy="81" r="3.6" stroke="${variant.accent}" stroke-width="2" opacity="0.9" /><circle cx="108" cy="81" r="3.6" stroke="${variant.accent}" stroke-width="2" opacity="0.9" />`;
	}

	return '';
}
