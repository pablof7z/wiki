<script lang="ts">
	import { page } from "$app/stores";
	import { ndk } from "$lib/ndk";
    import {type AddressPointer, decode} from "nostr-tools/nip19";
	import Button from "@/components/ui/button/button.svelte";
	import { NDKEvent, NDKRelay, type NDKFilter, type NostrEvent, NDKSubscription, NDKRelaySet, NDKUser, NDKSubscriptionCacheUsage } from "@nostr-dev-kit/ndk";
	import { onMount } from "svelte";
	import Editor from "../Editor.svelte";
	import { goto } from "$app/navigation";

    export let naddr: string;

    let event: NDKEvent;
    let newContent = false;
    let title: string;

    let currentUser: NDKUser;
    $ndk.signer?.user().then((user) => {
        currentUser = user;
    });

    let mounted = false;
    onMount(() => mounted = true)

    $: if ($page.params.naddr !== naddr && mounted) {
        naddr = $page.params.naddr;

        const data = decode(naddr).data as AddressPointer;
        const filter = {
            kinds: [data.kind],
            "#d": [data.identifier],
            authors: [data.pubkey],
        };

        $ndk.fetchEvents(filter).then((events) => {
            console.log(events);
            if (events.length === 0) return;
            event = Array.from(events).sort((a, b) => b.created_at! - a.created_at!)[0];
            title = event.tagValue("title") || event.dTag!;
        });
    }

    async function save(kind?: number) {
        const prevKey = event.pubkey;

        if (prevKey !== currentUser.pubkey) {
            event.removeTag("e");
            event.removeTag("a");
            event.tag(event, "fork");
        }

        event.id = "";
        event.sig = "";
        event.pubkey = "";
        event.removeTag("title");
        event.tags.push(["title", title]);
        event.removeTag("published_at");
        event.tags.push(["published_at", Math.floor(Date.now() / 1000).toString()]);
        await event.publish();
        goto(`/${event.dTag}/${event.pubkey.slice(0, 18)}`);
    }
</script>

{#if event}
    <div class="grid w-full items-center gap-4">
        <Editor bind:content={event.content} baseEvent={event} bind:newContent bind:title />

        <Button class="w-fit px-10" on:click={() => save()}>
            Save
        </Button>
    </div>
{/if}
