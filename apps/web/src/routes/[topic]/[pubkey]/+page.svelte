<script lang="ts">
    import { page } from "$app/stores";
    import { ndk } from "$lib/ndk";
	import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
	import { onMount } from "svelte";
	import EntryCard from "@/components/EntryCard.svelte";
	import EntriesList from "@/components/EntriesList.svelte";
	import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";

    export let topic: string;
    export let pubkey: string;

    let event: NDKEvent | undefined;
    let otherVersions: NDKEventStore<NDKEvent> | undefined;

    let mounted = false;
    onMount(() => mounted = true)

    $: if ($page.params.topic !== topic || $page.params.pubkey !== pubkey && mounted) {
        topic = $page.params.topic;
        pubkey = $page.params.pubkey;

        if (pubkey.startsWith('npub1')) {
            const user = $ndk.getUser({npub: pubkey});
            pubkey = user!.pubkey;
        }

        event = undefined;

        $ndk.fetchEvents({
            kinds: [ 30818 as number],
            "#d": [topic],
            authors: [pubkey],
        }).then((events) => {
            if (events.length === 0) return;
            event = Array.from(events).sort((a, b) => b.created_at! - a.created_at!)[0];
        });

        otherVersions = $ndk.storeSubscribe({
            kinds: [ 30818 as number],
            "#d": [topic],
        });
    }
</script>

{#if event}
    {#key event.id}
        <EntryCard {event} {otherVersions} />
    {/key}
{/if}