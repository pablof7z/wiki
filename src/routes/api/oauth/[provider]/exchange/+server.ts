import { env } from '$env/dynamic/private';
import {
	WELCOME_OAUTH_COOKIE,
	exchangeAuthorizationCode,
	fetchSocialProfile,
	getSocialAuthClientId,
	getSocialAuthClientSecret,
	getSocialAuthRedirectUri,
	isSocialAuthProvider
} from '$lib/auth/oauth';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

type OAuthCookieState = {
	provider: string;
	state: string;
	codeVerifier: string;
};

export const POST: RequestHandler = async ({ cookies, fetch, params, request, url }) => {
	const provider = params.provider;
	if (!isSocialAuthProvider(provider)) {
		return json({ error: 'Unknown OAuth provider.' }, { status: 404 });
	}

	const payload = (await request.json().catch(() => null)) as {
		code?: unknown;
		state?: unknown;
	} | null;
	const code = typeof payload?.code === 'string' ? payload.code.trim() : '';
	const state = typeof payload?.state === 'string' ? payload.state.trim() : '';

	if (!code || !state) {
		return json({ error: 'Missing OAuth code or state.' }, { status: 400 });
	}

	const rawCookie = cookies.get(WELCOME_OAUTH_COOKIE);
	if (!rawCookie) {
		return json(
			{ error: 'OAuth session expired. Start again from the welcome screen.' },
			{ status: 400 }
		);
	}

	let cookieState: OAuthCookieState;
	try {
		cookieState = JSON.parse(rawCookie) as OAuthCookieState;
	} catch {
		cookies.delete(WELCOME_OAUTH_COOKIE, { path: '/' });
		return json(
			{ error: 'OAuth session is invalid. Start again from the welcome screen.' },
			{ status: 400 }
		);
	}

	if (cookieState.provider !== provider || cookieState.state !== state || !cookieState.codeVerifier) {
		cookies.delete(WELCOME_OAUTH_COOKIE, { path: '/' });
		return json(
			{ error: 'OAuth state verification failed. Start again from the welcome screen.' },
			{ status: 400 }
		);
	}

	const clientId = getSocialAuthClientId(provider, env);
	if (!clientId) {
		cookies.delete(WELCOME_OAUTH_COOKIE, { path: '/' });
		return json({ error: 'Twitter OAuth is not configured on this deployment.' }, { status: 500 });
	}

	try {
		const accessToken = await exchangeAuthorizationCode(provider, {
			clientId,
			clientSecret: getSocialAuthClientSecret(provider, env),
			code,
			codeVerifier: cookieState.codeVerifier,
			redirectUri: getSocialAuthRedirectUri(url.origin, provider),
			fetch
		});
		const profile = await fetchSocialProfile(provider, {
			accessToken,
			fetch
		});
		return json(
			{ profile },
			{
				headers: {
					'Cache-Control': 'no-store'
				}
			}
		);
	} catch (error) {
		return json(
			{
				error: error instanceof Error ? error.message : 'Failed to import your social profile.'
			},
			{ status: 400 }
		);
	} finally {
		cookies.delete(WELCOME_OAUTH_COOKIE, { path: '/' });
	}
};
