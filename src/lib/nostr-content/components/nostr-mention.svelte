<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { ndk as defaultNdk } from '$lib/ndk.svelte';
	import Name from '$lib/components/Name.svelte';
	import NdkAvatar from '$lib/components/NdkAvatar.svelte';

	let {
		ndk = defaultNdk,
		bech32,
		class: className = ''
	}: {
		ndk?: NDKSvelte;
		bech32: string;
		class?: string;
	} = $props();

	const href = $derived(`/p/${bech32}`);
</script>

<a
	href={href}
	class={`inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 align-middle text-sm text-foreground no-underline transition-colors hover:bg-muted ${className}`}
>
	<NdkAvatar {ndk} npub={bech32} class="h-5 w-5 text-[0.6rem]" />
	<span class="min-w-0 truncate">
		<Name {ndk} npub={bech32} npubMaxLength={12} />
	</span>
</a>
