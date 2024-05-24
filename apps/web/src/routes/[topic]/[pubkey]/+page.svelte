<script lang="ts">
    import { page } from "$app/stores";
    import { ndk } from "$lib/ndk";
	import { NDKUser, type Hexpubkey, type NDKEvent } from "@nostr-dev-kit/ndk";
	import { onMount } from "svelte";
	import EntryCard from "@/components/EntryCard.svelte";
	import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
	import { pushState, replaceState } from "$app/navigation";
	import { attemptToGetNip05, getPubkeyFromUserId, maybePrettifyUrl } from "@/utils/userId-loader";

    export let topic: string;
    export let userId: string;

    let error: string;

    let event: NDKEvent | undefined;
    let otherVersions: NDKEventStore<NDKEvent> | undefined;

    let mounted = false;
    onMount(() => mounted = true)

    async function loadEventsWithUserPubkey(pubkey: Hexpubkey) {
        const events = await $ndk.fetchEvents({
            kinds: [ 30818 as number],
            "#d": [topic],
            authors: [pubkey],
        });
        if (events.size === 0) return;

        event = Array.from(events).sort((a, b) => b.created_at! - a.created_at!)[0];

        otherVersions = $ndk.storeSubscribe({
            kinds: [ 30818 as number],
            "#d": [topic],
        });
    }

    async function preparePage(userId: string) {
        getPubkeyFromUserId(userId)
            .then(async (pubkey: Hexpubkey) => {
                loadEventsWithUserPubkey(pubkey);

                // if the userId was an npub or a partial pubkey, try to prettify the URL
                maybePrettifyUrl(userId, pubkey, `/${encodeURIComponent(topic)}/<userId>`);
            })
            .catch((e) => { error = e; });
    }

    $: if ($page.params.topic !== topic || $page.params.pubkey !== userId && mounted) {
        topic = $page.params.topic;
        userId = $page.params.pubkey;
        event = undefined;
        otherVersions = undefined;

        preparePage(userId);
    }
</script>

{#if event}
    {#key event.id}
        <EntryCard {event} {otherVersions} />
    {/key}
{:else if error}
    <div>{error}</div>
{:else}
    <div>Loading...</div>
{/if}