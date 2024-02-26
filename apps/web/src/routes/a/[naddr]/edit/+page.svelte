<script lang="ts">
	import { page } from "$app/stores";
	import { ndk } from "$lib/ndk";
    import {type AddressPointer, decode} from "nostr-tools/nip19";
	import Button from "@/components/ui/button/button.svelte";
	import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
	import { onMount } from "svelte";
	import Editor from "../Editor.svelte";
	import { goto } from "$app/navigation";
	import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";

    export let naddr: string;

    let events: NDKEventStore<NDKEvent> | undefined;
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

        if (events) events.unsubscribe();

        events = $ndk.storeSubscribe(filter);
    }

    $: if ($events) {
        let _ = Array.from($events)
            .sort((a, b) => {
                const time = b.created_at! - a.created_at!
                if (time !== 0) return time
                return b.content.length - a.content.length
            })[0];
        if (_ && event?.id !== _.id) {
            event = _;
            content = event.content;
            title = event.tagValue("title") || event.dTag!;
        }
    }

    async function save() {
        const prevKey = event.pubkey;

        if (prevKey !== currentUser.pubkey) {
            event.removeTag("e");
            event.removeTag("a");
            event.tag(event, "fork");
        }

        event.id = "";
        event.sig = "";
        event.pubkey = "";
        event.created_at = undefined;
        event.removeTag("title");
        event.tags.push(["title", title]);
        event.removeTag("published_at");
        event.tags.push(["published_at", Math.floor(Date.now() / 1000).toString()]);
        await event.publish();
        goto(`/${event.dTag}/${event.pubkey.slice(0, 18)}`);
    }

    let content: string;
</script>

{#if event}
    <div class="grid w-full items-center gap-4">
        {#key content}
            <Editor bind:content={event.content} baseEvent={event} bind:newContent bind:title />

            <Button class="w-fit px-10" on:click={() => save()}>
                Save
            </Button>
        {/key}
    </div>
{:else}
    Looking for event
{/if}
