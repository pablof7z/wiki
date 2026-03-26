<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useNip05RouteId } from '$lib/utils/user-route.svelte';
	import { nip19 } from 'nostr-tools';

	let {
		pubkey,
		class: className = '',
		children
	}: {
		pubkey: string;
		class?: string;
		children: Snippet;
	} = $props();

	const route = useNip05RouteId(() => pubkey);
	const npub = $derived(nip19.npubEncode(pubkey));
</script>

<a href="/p/{route.id || npub}" class={className}>
	{@render children()}
</a>
