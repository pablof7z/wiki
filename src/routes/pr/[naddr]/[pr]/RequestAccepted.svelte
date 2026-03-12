<script lang="ts">
	import { NDKEvent } from '@nostr-dev-kit/ndk';
	import { nip19 } from 'nostr-tools';

	let { event }: { event: NDKEvent } = $props();

	const versionTag = $derived(event.getMatchingTags('e').find((t) => t[3] !== 'fork')?.[1]);
	const pointer = $derived(versionTag ? nip19.neventEncode({ id: versionTag }) : undefined);
</script>

<div class="surface-inset my-4 rounded-[1.4rem] px-4 py-4 text-sm">
	<div class="font-medium text-foreground">This request was accepted.</div>
	{#if pointer}
		<a href="/a/{pointer}" class="subtle-link mt-2 inline-flex text-sm">
			View the accepted version
		</a>
	{/if}
</div>
