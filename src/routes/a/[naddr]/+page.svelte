<script lang="ts">
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import EntryCard from '$lib/components/EntryCard.svelte';

	let event: NDKEvent | undefined = $state(undefined);
	let loading = $state(true);
	let loadError = $state<string | undefined>(undefined);

	$effect(() => {
		const currentNaddr = $page.params.naddr;
		if (!currentNaddr) return;

		loading = true;
		loadError = undefined;
		event = undefined;

		ndk
			.fetchEvent(currentNaddr)
			.then((fetchedEvent) => {
				event = fetchedEvent ?? undefined;
				if (!fetchedEvent) loadError = 'Entry not found.';
			})
			.catch((error) => {
				loadError = String(error);
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<div class="page-shell pt-6 pb-16">
	{#if loading}
		<div class="surface-inset rounded-[2rem] px-6 py-8 text-muted-foreground">Loading entry...</div>
	{:else if event}
		{#key event.id}
			<EntryCard {event} />
		{/key}
	{:else}
		<div class="surface-inset rounded-[2rem] px-6 py-8 text-muted-foreground">
			{loadError || 'Entry not found.'}
		</div>
	{/if}
</div>
