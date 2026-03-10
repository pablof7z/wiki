<script lang="ts">
	import { page } from "$app/stores";
	import { ndk } from "$lib/ndk.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
	import Editor from "../Editor.svelte";
	import { goto } from "$app/navigation";
	import type { Subscription } from "@nostr-dev-kit/svelte";
	import EntryCard from "$lib/components/EntryCard.svelte";

    let { naddr }: { naddr: string } = $props();

    let events: Subscription<NDKEvent> | undefined;
    let event = $state<NDKEvent | undefined>(undefined);
    let newContent = $state(false);
    let title = $state<string>("");
    let category = $state<string | undefined>(undefined);
    let saving = $state(false);
    let publishable = $state(true);
    let statusMessage = $state("");

    let currentUser: NDKUser;
    ndk.signer?.user().then((user) => {
        currentUser = user;
    });

    let mounted = $state(true);

    $effect(() => {
        const currentNaddr = $page.params.naddr;
        if (currentNaddr && currentNaddr !== naddr && mounted) {
            if (events) events.stop();

            // First fetch the initial event
            ndk.fetchEvent(currentNaddr).then((fetchedEvent) => {
                if (fetchedEvent) {
                    // Then subscribe to updates for this specific addressable event
                    events = ndk.$subscribe(() => ({
                        filters: [{
                            kinds: [fetchedEvent.kind],
                            "#d": [fetchedEvent.dTag!],
                            authors: [fetchedEvent.pubkey],
                        }],
                        subId: 'edit-page-event'
                    }));
                }
            });
        }
    });

    $effect(() => {
        if (events) {
            const eventsList = Array.from(events.events);
            if (eventsList.length > 0) {
                const latest = eventsList
                    .sort((a, b) => {
                        const time = b.created_at! - a.created_at!
                        if (time !== 0) return time
                        return b.content.length - a.content.length
                    })[0];
                if (latest && event?.id !== latest.id) {
                    event = latest;
                    content = latest.content;
                    title = latest.tagValue("title") || latest.dTag!;
                    category = latest.tagValue("c") ?? undefined;
                }
            }
        }
    });

    async function save() {
        if (!event) return;

        saving = true;
        const prevKey = event.pubkey;

        if (prevKey !== currentUser.pubkey) {
            event.removeTag("e");
            event.removeTag("a");
            event.tag(event, "fork");
        }

        try {
            event.id = "";
            event.sig = "";
            event.pubkey = "";
            event.created_at = undefined;
            event.removeTag("title");
            event.alt = "This is a wiki article about " + title + "\n\nYou can read it on https://wikifreedia.xyz/a/" + event.encode();
            event.tags.push(["title", title]);
            event.removeTag("c");
            if (category) event.tags.push(["c", category]);
            event.removeTag("published_at");
            event.tags.push(["published_at", Math.floor(Date.now() / 1000).toString()]);
            await event.publish();
            goto(`/${event.dTag}/${event.author.npub}`);
        } finally {
            saving = false;
        }
    }

    let content = $state<string>("");
    let preview = $state(false);

    function togglePreview() {
        preview = !preview;
    }
</script>

{#if event}
    <div class="grid w-full items-center gap-4">
        {#key content}
            {#if !preview}
                <Editor
                    bind:content={event.content}
                    baseEvent={event}
                    bind:newContent
                    bind:publishable
                    bind:statusMessage
                    bind:title
                    bind:category
                />
            {:else}
                <EntryCard {event} skipEdit={true} />
            {/if}

            <div class="flex flex-row gap-4">
                <Button class="w-fit px-10" onclick={() => save()} disabled={!publishable || saving}>
                    {#if saving}
                        Saving...
                    {:else}
                        Save
                    {/if}
                </Button>

                <Button variant="ghost" onclick={togglePreview}>
                    Preview
                </Button>
            </div>

            {#if !publishable && statusMessage}
                <p class="text-sm text-amber-600">{statusMessage}</p>
            {/if}
        {/key}
    </div>
{:else}
    Looking for event
{/if}
