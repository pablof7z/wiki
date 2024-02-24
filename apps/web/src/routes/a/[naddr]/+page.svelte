<script lang="ts">
    import { page } from "$app/stores";
    import { ndk } from "$lib/ndk";
	import type { NDKEvent } from "@nostr-dev-kit/ndk";
	import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";
    import {type AddressPointer, decode} from "nostr-tools/nip19";
	import { onMount } from "svelte";
	import EntryCard from "@/components/EntryCard.svelte";

    export let naddr: string;
    let event: NDKEvent | undefined;
    let topic: string;

    let mounted = false;
    onMount(() => mounted = true)

    $: if ($page.params.naddr !== naddr && mounted) {
        naddr = $page.params.naddr;

        event = undefined;

        const data = decode(naddr).data as AddressPointer;
        const filter = {
            kinds: [data.kind],
            "#d": [data.identifier],
            authors: [data.pubkey],
        };

        $ndk.fetchEvents(filter).then((events) => {
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