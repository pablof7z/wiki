<script lang="ts">
	import type { NDKUserProfile } from "@nostr-dev-kit/ndk";
	import type NDKSvelte from "@nostr-dev-kit/svelte";

	let {
		ndk = $bindable(),
		npub = $bindable(),
		pubkey = $bindable(),
		userProfile = $bindable(),
		npubMaxLength = undefined,
		attribute = "display_name",
		class: className = "",
		style = ""
	}: {
		ndk?: NDKSvelte;
		npub?: string;
		pubkey?: string;
		userProfile?: NDKUserProfile;
		npubMaxLength?: number;
		attribute?: "display_name" | "name" | string;
		class?: string;
		style?: string;
	} = $props();

	// Fetch profile using the new $fetchProfile pattern
	const profile = ndk && pubkey && !userProfile ? ndk.$fetchProfile(() => pubkey) : undefined;

	function truncatedBech32(bech32: string | undefined, length?: number): string {
		if (!bech32) return "";
		return `${bech32.substring(0, length || 9)}...`;
	}

	function prettifyNip05(nip05: string): string {
		return nip05.startsWith("_@") ? nip05.substring(2) : nip05;
	}

	const truncatedNpub = $derived(npubMaxLength && (npub || pubkey) ? truncatedBech32(npub || pubkey, npubMaxLength) : (npub || pubkey || ""));

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
		userProfile ? chooseNameFromDisplay(userProfile) : chooseNameFromDisplay(profile)
	);
</script>

<span class="name {className}" {style}>
	{displayName}
</span>
