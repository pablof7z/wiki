import { ndk } from '$lib/ndk.svelte';
import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
import {
	applyCachedNip05ToProfile,
	getCachedNip05ForPubkey,
	rememberUserProfileNip05
} from './nip05-cache';

/**
 * Reactively resolves the best route identifier for a user.
 * Returns NIP-05 when available, undefined otherwise.
 * Must be called during component initialization.
 */
export function useNip05RouteId(pubkey: () => string) {
	let nip05 = $state<string | undefined>(undefined);

	$effect(() => {
		const pk = pubkey();
		nip05 = getCachedNip05ForPubkey(pk);
		if (!pk) return;
		if (nip05) return;

		let cancelled = false;

		ndk.fetchUser(pk).then((user) => {
			if (cancelled || !user) return;

			user.profile = applyCachedNip05ToProfile(user.pubkey, user.profile);
			const cachedNip05 = rememberUserProfileNip05(user.pubkey, user.profile);
			if (cachedNip05) {
				nip05 = cachedNip05;
				return;
			}

			user.fetchProfile({ cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY })
				.then((profile) => {
					if (cancelled) return;
					const resolvedNip05 = rememberUserProfileNip05(user.pubkey, profile);
					if (resolvedNip05) {
						nip05 = resolvedNip05;
					}
				})
				.catch(() => {});
		});

		return () => {
			cancelled = true;
		};
	});

	return {
		get id() {
			return nip05;
		}
	};
}
