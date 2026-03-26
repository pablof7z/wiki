import { describe, expect, it } from 'vitest';

import {
	buildAuthorizeUrl,
	getSocialAuthRedirectUri,
	normalizeTwitterProfile,
	type SocialAuthProvider
} from './oauth';

describe('oauth helpers', () => {
	it('builds the provider callback url from the current origin', () => {
		expect(getSocialAuthRedirectUri('https://wikifreedia.xyz', 'twitter')).toBe(
			'https://wikifreedia.xyz/auth/callback/twitter'
		);
	});

	it('creates a valid provider authorize url', () => {
		const authorizeUrl = buildAuthorizeUrl('twitter', {
			clientId: 'client-id',
			redirectUri: 'https://wikifreedia.xyz/auth/callback/twitter',
			state: 'state-token',
			codeChallenge: 'challenge-token'
		});
		const url = new URL(authorizeUrl);

		expect(url.origin).toBe('https://x.com');
		expect(url.pathname).toBe('/i/oauth2/authorize');
		expect(url.searchParams.get('response_type')).toBe('code');
		expect(url.searchParams.get('client_id')).toBe('client-id');
		expect(url.searchParams.get('redirect_uri')).toBe(
			'https://wikifreedia.xyz/auth/callback/twitter'
		);
		expect(url.searchParams.get('scope')).toBe('users.read');
		expect(url.searchParams.get('state')).toBe('state-token');
		expect(url.searchParams.get('code_challenge')).toBe('challenge-token');
		expect(url.searchParams.get('code_challenge_method')).toBe('S256');
	});

	it('normalizes twitter profile data for welcome-screen prefill', () => {
		expect(
			normalizeTwitterProfile({
				data: {
					username: 'WikifreediaDev',
					name: 'Wikifreedia Dev',
					description: 'Building in public',
					profile_image_url: 'https://pbs.twimg.com/profile_images/avatar_normal.jpg'
				}
			})
		).toEqual({
			provider: 'twitter' satisfies SocialAuthProvider,
			providerLabel: 'Twitter',
			username: 'wikifreediadev',
			displayName: 'Wikifreedia Dev',
			about: 'Building in public',
			picture: 'https://pbs.twimg.com/profile_images/avatar_normal.jpg',
			profileUrl: 'https://x.com/wikifreediadev'
		});
	});
});
