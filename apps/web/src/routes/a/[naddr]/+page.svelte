<script lang="ts">
    import { page } from "$app/stores";
    import { ndk } from "$lib/ndk";
	import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
    import { decode} from "nostr-tools/nip19";
	import { onMount } from "svelte";
	import EntryCard from "@/components/EntryCard.svelte";

    export let naddr: string;
    let event: NDKEvent | undefined;

    let mounted = false;
    onMount(() => mounted = true)

    $: if ($page.params.naddr !== naddr && mounted) {
        naddr = $page.params.naddr;

        event = undefined;

        let filter: NDKFilter;

        const {data, type } = decode(naddr);
        if (type === "naddr") {
            filter = {
                kinds: [data.kind],
                "#d": [data.identifier],
                authors: [data.pubkey],
            };
        } else if (type === "nevent"){
            filter = { ids: [data.id] }
        }

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