export const WELCOME_OAUTH_COOKIE = 'wikifreedia-welcome-oauth';
export const WELCOME_SOCIAL_PREFILL_STORAGE_KEY = 'wikifreedia-welcome-prefill';

export const socialAuthProviders = [
	{
		id: 'twitter',
		label: 'Twitter',
		buttonLabel: 'Login with Twitter'
	}
] as const;

export type SocialAuthProvider = (typeof socialAuthProviders)[number]['id'];

export type WelcomeProfilePrefill = {
	provider: SocialAuthProvider;
	providerLabel: string;
	username: string;
	displayName: string;
	about: string;
	picture: string;
	profileUrl: string;
};

type TokenResponse = {
	access_token?: string;
	error?: string;
	error_description?: string;
};

type TwitterUserResponse = {
	data?: {
		name?: string;
		username?: string;
		description?: string;
		profile_image_url?: string;
	};
	detail?: string;
	title?: string;
	errors?: Array<{ detail?: string; message?: string; title?: string }>;
};

type ProviderConfig = {
	authorizeUrl: string;
	tokenUrl: string;
	scopes: string[];
	fetchProfile(args: {
		accessToken: string;
		fetch: typeof globalThis.fetch;
	}): Promise<WelcomeProfilePrefill>;
};

const providerConfigs: Record<SocialAuthProvider, ProviderConfig> = {
	twitter: {
		authorizeUrl: 'https://x.com/i/oauth2/authorize',
		tokenUrl: 'https://api.x.com/2/oauth2/token',
		scopes: ['users.read'],
		fetchProfile: async ({ accessToken, fetch }) => {
			const url = new URL('https://api.x.com/2/users/me');
			url.searchParams.set('user.fields', 'description,profile_image_url');

			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			if (!response.ok) {
				throw new Error(await readErrorMessage(response, 'Failed to load your Twitter profile.'));
			}

			return normalizeTwitterProfile((await response.json()) as TwitterUserResponse);
		}
	}
};

export function isSocialAuthProvider(value: string): value is SocialAuthProvider {
	return socialAuthProviders.some((provider) => provider.id === value);
}

export function getSocialAuthProvider(provider: SocialAuthProvider) {
	return socialAuthProviders.find((entry) => entry.id === provider)!;
}

export function getSocialAuthRedirectUri(origin: string, provider: SocialAuthProvider): string {
	return new URL(`/auth/callback/${provider}`, origin).toString();
}

export function getSocialAuthClientId(
	provider: SocialAuthProvider,
	env: Record<string, string | undefined>
): string | null {
	switch (provider) {
		case 'twitter':
			return env.TWITTER_CLIENT_ID?.trim() || null;
	}
}

export function getSocialAuthClientSecret(
	provider: SocialAuthProvider,
	env: Record<string, string | undefined>
): string | null {
	switch (provider) {
		case 'twitter':
			return env.TWITTER_CLIENT_SECRET?.trim() || null;
	}
}

export function buildAuthorizeUrl(
	provider: SocialAuthProvider,
	args: {
		clientId: string;
		redirectUri: string;
		state: string;
		codeChallenge: string;
	}
): string {
	const config = providerConfigs[provider];
	const url = new URL(config.authorizeUrl);

	url.searchParams.set('response_type', 'code');
	url.searchParams.set('client_id', args.clientId);
	url.searchParams.set('redirect_uri', args.redirectUri);
	url.searchParams.set('scope', config.scopes.join(' '));
	url.searchParams.set('state', args.state);
	url.searchParams.set('code_challenge', args.codeChallenge);
	url.searchParams.set('code_challenge_method', 'S256');

	return url.toString();
}

export async function exchangeAuthorizationCode(
	provider: SocialAuthProvider,
	args: {
		clientId: string;
		clientSecret: string | null;
		code: string;
		codeVerifier: string;
		redirectUri: string;
		fetch: typeof globalThis.fetch;
	}
): Promise<string> {
	const config = providerConfigs[provider];
	const body = new URLSearchParams({
		code: args.code,
		grant_type: 'authorization_code',
		redirect_uri: args.redirectUri,
		code_verifier: args.codeVerifier,
		client_id: args.clientId
	});

	const response = await args.fetch(config.tokenUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			...(args.clientSecret
				? {
						Authorization: `Basic ${btoa(`${args.clientId}:${args.clientSecret}`)}`
					}
				: {})
		},
		body
	});

	if (!response.ok) {
		throw new Error(
			await readErrorMessage(
				response,
				`Failed to authorize ${getSocialAuthProvider(provider).label}.`
			)
		);
	}

	const payload = (await response.json()) as TokenResponse;
	if (!payload.access_token) {
		throw new Error(`Missing access token from ${getSocialAuthProvider(provider).label}.`);
	}

	return payload.access_token;
}

export async function fetchSocialProfile(
	provider: SocialAuthProvider,
	args: {
		accessToken: string;
		fetch: typeof globalThis.fetch;
	}
): Promise<WelcomeProfilePrefill> {
	return providerConfigs[provider].fetchProfile(args);
}

export async function createPkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
	const codeVerifier = randomBase64Url(32);
	const encodedVerifier = new TextEncoder().encode(codeVerifier);
	const digest = await crypto.subtle.digest('SHA-256', encodedVerifier);

	return {
		codeVerifier,
		codeChallenge: toBase64Url(new Uint8Array(digest))
	};
}

export function createOAuthState(): string {
	return randomBase64Url(24);
}

export function normalizeTwitterProfile(payload: TwitterUserResponse): WelcomeProfilePrefill {
	const username = cleanString(payload.data?.username).toLowerCase();

	if (!username) {
		throw new Error('Twitter did not return a username.');
	}

	return {
		provider: 'twitter',
		providerLabel: 'Twitter',
		username,
		displayName: cleanString(payload.data?.name),
		about: cleanString(payload.data?.description),
		picture: cleanString(payload.data?.profile_image_url),
		profileUrl: `https://x.com/${username}`
	};
}

function cleanString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function randomBase64Url(byteLength: number): string {
	const bytes = new Uint8Array(byteLength);
	crypto.getRandomValues(bytes);
	return toBase64Url(bytes);
}

function toBase64Url(bytes: Uint8Array): string {
	let binary = '';

	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
	const text = await response.text();
	if (!text) return fallback;

	try {
		const payload = JSON.parse(text) as TokenResponse & TwitterUserResponse;
		return (
			cleanString(payload.error_description) ||
			cleanString(payload.detail) ||
			cleanString(payload.title) ||
			cleanString(payload.errors?.[0]?.detail) ||
			cleanString(payload.errors?.[0]?.message) ||
			cleanString(payload.error) ||
			fallback
		);
	} catch {
		return text.trim() || fallback;
	}
}
