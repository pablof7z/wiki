<script lang="ts">
	import { NDKSubscriptionCacheUsage, type NDKUserProfile } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import {
		applyCachedNip05ToProfile,
		rememberUserProfileNip05
	} from '$lib/utils/nip05-cache';

	let {
		ndk = $bindable(),
		npub = $bindable(),
		pubkey = $bindable(),
		userProfile = $bindable(),
		npubMaxLength = undefined,
		attribute = 'display_name',
		class: className = '',
		style = ''
	}: {
		ndk?: NDKSvelte;
		npub?: string;
		pubkey?: string;
		userProfile?: NDKUserProfile;
		npubMaxLength?: number;
		attribute?: 'display_name' | 'name' | string;
		class?: string;
		style?: string;
	} = $props();

	let profile = $state<NDKUserProfile | undefined>(applyCachedNip05ToProfile(pubkey, userProfile));
	const identifier = $derived(pubkey || npub);
	const boundUserProfile = $derived(applyCachedNip05ToProfile(pubkey, userProfile));

	$effect(() => {
		profile = boundUserProfile;
		rememberUserProfileNip05(pubkey, boundUserProfile);

		if (!ndk || !identifier || boundUserProfile) return;

		let cancelled = false;

		ndk.fetchUser(identifier).then((user) => {
			if (cancelled || !user) return;

			user.profile = applyCachedNip05ToProfile(user.pubkey, user.profile);
			profile = user.profile;
			rememberUserProfileNip05(user.pubkey, user.profile);

			return user
				.fetchProfile({ cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY })
				.then((fetchedProfile) => {
					if (cancelled) return;
					const nextProfile = applyCachedNip05ToProfile(user.pubkey, fetchedProfile ?? user.profile);
					profile = nextProfile;
					rememberUserProfileNip05(user.pubkey, nextProfile);
				})
				.catch(() => {
					if (cancelled) return;
					profile = user.profile;
					rememberUserProfileNip05(user.pubkey, user.profile);
				});
		});

		return () => {
			cancelled = true;
		};
	});

	function truncatedBech32(bech32: string | undefined, length?: number): string {
		if (!bech32) return '';
		return `${bech32.substring(0, length || 9)}...`;
	}

	function prettifyNip05(nip05: string): string {
		return nip05.startsWith('_@') ? nip05.substring(2) : nip05;
	}

	const truncatedNpub = $derived(
		npubMaxLength && (npub || pubkey)
			? truncatedBech32(npub || pubkey, npubMaxLength)
			: npub || pubkey || ''
	);

	function chooseNameFromDisplay(prof?: NDKUserProfile) {
		if (prof?.[attribute]) return prof[attribute];

		return (
			prof?.displayName ||
			prof?.name ||
			(prof?.nip05 && prettifyNip05(prof?.nip05)) ||
			truncatedNpub
		);
	}

	const displayName = $derived(
		boundUserProfile ? chooseNameFromDisplay(boundUserProfile) : chooseNameFromDisplay(profile)
	);
</script>

<span class="name {className}" {style}>
	{displayName}
</span>
