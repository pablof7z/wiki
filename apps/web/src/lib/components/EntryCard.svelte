<script lang="ts">
	import { onMount } from 'svelte';
	import { ndk } from "@/ndk";
	import type { NDKEvent } from "@nostr-dev-kit/ndk";
    import EventContent from "@/components/EventContent.svelte";
	import { Name, Avatar } from "@nostr-dev-kit/ndk-svelte-components";
    import Button from "@/components/ui/button/button.svelte";

    export let skipTitle = false;
    export let event: NDKEvent;
    let title = event.tagValue("title") || event.dTag;
    let forkPubkey: string;
    let fork: NDKEvent;

    onMount(() => {
        const forkValue = event.getMatchingTags("a").find(t => t[3] === "fork");
        if (forkValue) {
            const forkId = event.getMatchingTags("e").find(t => t[3] === "fork")?.[1];
            if (forkId) {
                $ndk.fetchEvents({ids: [forkId]}).then((f) => {
                    if (f.size === 0) return;
                    fork = Array.from(f)[0];
                    forkPubkey = fork.pubkey;
                });
            }
        }
    })

    const reactions = $ndk.storeSubscribe({ kinds: [7], ...event.filter() });
</script>

<div class="flex flex-col gap-2 items-start bg-white rounded-xl shadow">
    {#if !skipTitle}
        <h1 class="px-6 pt-4">{title}</h1>
    {/if}
    <div class="flex flex-row gap-2 items-start bg-zinc-50 px-6 py-2 w-full">
        <a href="/p/{event.author.npub}">
            <Avatar ndk={$ndk} pubkey={event.pubkey} class="w-12 h-12 rounded-full object-cover" />
        </a>
        <div class="flex flex-col items-start w-full">
            <a href="/p/{event.author.npub}">
                <Name ndk={$ndk} pubkey={event.pubkey} />
            </a>
            <div class="text-xs text-neutral-500 flex flex-row gap-8 items-center">
                <span>{event.created_at}</span>

                <span>{event.onRelays?.map(r => r.url).join(', ')}</span>

                {#if fork}
                    <Button href="/a/{fork.encode()}" size="sm">
                        Forked from <Name ndk={$ndk} pubkey={forkPubkey} />
                    </Button>
                {/if}

                <Button href="/a/{event.encode()}/edit" size="sm">
                    Edit
                </Button>
            </div>

            <div class="flex flex-row items-start gap-2 my-2 p-2 w-full">
                {$reactions.length} reactions
            </div>
        </div>
    </div>

    <div class="p-6 w-full">
        <EventContent {event} />
    </div>
</div>