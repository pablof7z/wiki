import type { PageServerLoad } from './$types';
import {
	fetchProfileByPubkey,
	fetchEventByAddress,
	getServerNdk,
	loadUserProfile,
	getPreferredDisplayName,
	shortenHexPubkey
} from '$lib/server/nostr';
import { buildArticleShareData, buildMissingEntryShareData, sanitizeProfile } from '$lib/server/share';
import { prettifyNip05 } from '$lib/utils/nip05';

export const load: PageServerLoad = async ({ params, url, setHeaders }) => {
	setHeaders({
		'cache-control': 'private, no-store'
	});

	try {
		const ndk = await getServerNdk();
		const event = await fetchEventByAddress(params.naddr);

		if (!event) {
			return buildMissingEntryShareData(url);
		}

		const user = ndk.getUser({ pubkey: event.pubkey });
		const initialProfile = await loadUserProfile(user);
		const fetchedProfile =
			!initialProfile?.nip05 ? await fetchProfileByPubkey(event.pubkey) : undefined;
		const profile = fetchedProfile
			? {
					...initialProfile,
					...fetchedProfile
				}
			: initialProfile;
		const authorName = getPreferredDisplayName(profile, shortenHexPubkey(event.pubkey));
		const authorRouteId = prettifyNip05(profile?.nip05 ?? '') || user.npub;

		return {
			...buildArticleShareData({
				url,
				event,
				profile,
				authorName
			}),
			entryEvent: event.rawEvent(),
			authorProfile: sanitizeProfile(profile),
			authorLabel: authorRouteId || authorName,
			authorRouteId
		};
	} catch (error) {
		console.warn('[share] failed to load article metadata', error);
		return buildMissingEntryShareData(url);
	}
};
