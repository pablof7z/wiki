import type { NostrEvent } from '@nostr-dev-kit/ndk';
import type { PageServerLoad } from './$types';
import { buildProfileTopicSummaries } from '$lib/profile-topics';
import { fetchUserWithProfile, getServerNdk } from '$lib/server/nostr';
import { buildMissingProfileShareData, buildProfileShareData } from '$lib/server/share';
import { prettifyNip05 } from '$lib/utils/nip05';

const ARTICLE_KIND = 30818;

export const load: PageServerLoad = async ({ params, url }) => {
	try {
		const { user, profile } = await fetchUserWithProfile(params.id);
		if (!user) {
			return buildMissingProfileShareData(url, params.id);
		}

		const profileShareData = buildProfileShareData({
			url,
			identifier: params.id,
			userPubkey: user.pubkey,
			resolvedNpub: user.npub,
			profile
		});

		try {
			const ndk = await getServerNdk();
			const fetchedEvents = await ndk.fetchEvents(
				{
					kinds: [ARTICLE_KIND],
					authors: [user.pubkey]
				},
				{ closeOnEose: true }
			);
			const seedEvents = Array.from(fetchedEvents).map((event) => event.rawEvent() as NostrEvent);
			const profileRouteId =
				(profile?.nip05 ? prettifyNip05(profile.nip05) : undefined) || user.npub || user.pubkey;

			return {
				...profileShareData,
				authoredTopics: buildProfileTopicSummaries(seedEvents, profileRouteId),
				seedEvents
			};
		} catch (error) {
			console.warn('[share] failed to load authored entries for profile SSR', error);

			return {
				...profileShareData,
				authoredTopics: [],
				seedEvents: [] satisfies NostrEvent[]
			};
		}
	} catch (error) {
		console.warn('[share] failed to load profile metadata', error);
		return buildMissingProfileShareData(url, params.id);
	}
};
