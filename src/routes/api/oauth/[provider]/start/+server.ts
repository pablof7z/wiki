import { env } from '$env/dynamic/private';
import {
	WELCOME_OAUTH_COOKIE,
	buildAuthorizeUrl,
	createOAuthState,
	createPkcePair,
	getSocialAuthClientId,
	getSocialAuthRedirectUri,
	isSocialAuthProvider
} from '$lib/auth/oauth';
import { redirect } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

type OAuthCookieState = {
	provider: string;
	state: string;
	codeVerifier: string;
};

export const GET: RequestHandler = async ({ cookies, params, url }) => {
	const provider = params.provider;
	if (!isSocialAuthProvider(provider)) {
		return new Response('Unknown OAuth provider.', { status: 404 });
	}

	const clientId = getSocialAuthClientId(provider, env);
	if (!clientId) {
		throw redirect(
			302,
			new URL(`/welcome?oauth_error=missing_provider_config&provider=${provider}`, url).toString()
		);
	}

	const redirectUri = getSocialAuthRedirectUri(url.origin, provider);
	const state = createOAuthState();
	const { codeVerifier, codeChallenge } = await createPkcePair();
	const cookieState: OAuthCookieState = {
		provider,
		state,
		codeVerifier
	};

	cookies.set(WELCOME_OAUTH_COOKIE, JSON.stringify(cookieState), {
		httpOnly: true,
		maxAge: 60 * 10,
		path: '/',
		sameSite: 'lax',
		secure: url.protocol === 'https:'
	});

	throw redirect(
		302,
		buildAuthorizeUrl(provider, {
			clientId,
			redirectUri,
			state,
			codeChallenge
		})
	);
};
