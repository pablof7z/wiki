<script lang="ts">
    import { page } from "$app/stores";
    import { ndk } from "$lib/ndk";
	import type { NDKEvent } from "@nostr-dev-kit/ndk";
	import { onMount } from "svelte";
	import EntryCard from "@/components/EntryCard.svelte";

    export let topic: string;
    export let pubkey: string;

    let event: NDKEvent | undefined;

    let mounted = false;
    onMount(() => mounted = true)

    $: if ($page.params.topic !== topic || $page.params.pubkey !== pubkey && mounted) {
        topic = $page.params.topic;
        pubkey = $page.params.pubkey;

        event = undefined;

        $ndk.fetchEvents({
            kinds: [ 30818 as number],
            "#d": [topic],
            authors: [pubkey],
        }).then((events) => {
            if (events.length === 0) return;
            event = Array.from(events).sort((a, b) => b.created_at! - a.created_at!)[0];
        });
    }
</script>

{#if event}
    {#key event.id}
        <EntryCard {event} />
    {/key}
{/if}