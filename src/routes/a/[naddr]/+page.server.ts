import type { PageServerLoad } from './$types';
import { getServerNdk, loadUserProfile, getPreferredDisplayName, shortenHexPubkey } from '$lib/server/nostr';
import { buildArticleShareData, buildMissingEntryShareData } from '$lib/server/share';

export const load: PageServerLoad = async ({ params, url }) => {
	try {
		const ndk = await getServerNdk();
		const event = await ndk.fetchEvent(params.naddr, { closeOnEose: true });

		if (!event) {
			return buildMissingEntryShareData(url);
		}

		const user = ndk.getUser({ pubkey: event.pubkey });
		const profile = await loadUserProfile(user);
		const authorName = getPreferredDisplayName(profile, shortenHexPubkey(event.pubkey));

		return buildArticleShareData({
			url,
			event,
			profile,
			authorName
		});
	} catch (error) {
		console.warn('[share] failed to load article metadata', error);
		return buildMissingEntryShareData(url);
	}
};
