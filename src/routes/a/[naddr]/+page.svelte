<script lang="ts">
    import { page } from "$app/stores";
    import { ndk } from "$lib/ndk.svelte";
	import type { NDKEvent } from "@nostr-dev-kit/ndk";
	import EntryCard from "@/components/EntryCard.svelte";
	import PageContainer from "@/components/PageContainer.svelte";

    let { naddr = $bindable($page.params.naddr) }: { naddr?: string } = $props();
    let event: NDKEvent | undefined = $state(undefined);

    let mounted = $state(true);

    $effect(() => {
        const currentNaddr = $page.params.naddr;
        if (currentNaddr && currentNaddr !== naddr && mounted) {
            naddr = currentNaddr;
            event = undefined;

            ndk.fetchEvent(naddr).then((fetchedEvent) => {
                event = fetchedEvent ?? undefined;
            });
        }
    });
</script>

<PageContainer>
	{#if event}
		{#key event.id}
			<EntryCard {event} />
		{/key}
	{/if}
</PageContainer>