<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { ndk } from "@/ndk";
	import { NDKEvent, type NostrEvent } from "@nostr-dev-kit/ndk";
    import EventContent from "@/components/EventContent.svelte";
	import { Name, Avatar } from "@nostr-dev-kit/ndk-svelte-components";
    import Button from "@/components/ui/button/button.svelte";
	import { currentUser } from '@/stores/session';
	import { derived } from 'svelte/store';
	import EntryCardSupportFooter from './EntryCardSupportFooter.svelte';


    export let skipTitle = false;
    export let event: NDKEvent;
    export let skipEdit = false;
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

    async function requestMerge() {
        const content = prompt("Optionally provide a message to the author of the original entry on what was changed");
        const merge = new NDKEvent($ndk, {
            content,
            kind: 818,
        } as NostrEvent);
        merge.tag(fork);
        merge.tags.push(["e", event.id, event.relay?.url ?? "", "fork"]);
        await merge.publish();
    }

    const reactions = $ndk.storeSubscribe({ kinds: [7], ...event.filter() });
    const pullRequests = $ndk.storeSubscribe({ kinds: [818 as number], ...event.filter(), "#e": [event.id] });

    onDestroy(() => {
        reactions.unsubscribe();
        pullRequests.unsubscribe();
    });

    /**
     * Find all pull requests that are a-tagging this event and are not marked as a fork
     */
    const incomingPullRequests = derived(pullRequests, ($pullRequests) => {
        const aTag = event.tagAddress();
        return Array.from($pullRequests).filter((pr) => pr.getMatchingTags("a").find(t => t[1] === aTag && t[3] !== "fork"));
    })

    /**
     * Find all pull requests that are e-tagging this event and are marked as a fork
     */
    const outgoingPullRequests = derived(pullRequests, ($pullRequests) => {
        return Array.from($pullRequests).filter((pr) => pr.getMatchingTags("e").find(t => t[1] === event.id && t[3] === "fork"));
    })
</script>

<div class="flex flex-col gap-2 items-start bg-white dark:bg-black rounded-xl shadow">
    <div class="flex flex-col px-6 pt-4 w-full">
        {#if !skipTitle}
            <div class="flex flex-row justify-between">
                <h1 class="grow">{title}</h1>

                <div class:hidden={skipEdit}>
                    <Button href="/a/{event.encode()}/edit" size="sm">
                        Edit
                    </Button>
                </div>
            </div>
        {/if}
        <div class="flex flex-row gap-4 items-center text-base w-full mt-1">
            <a href="/p/{event.author.npub}" class="flex flex-row items-center gap-2 w-56">
                <Avatar ndk={$ndk} pubkey={event.pubkey} class="w-5 h-5 object-cover rounded-full flex-none" />
                <Name ndk={$ndk} pubkey={event.pubkey} class="inline-block truncate" />
            </a>

            <span class="opacity-50">{(new Date(event.created_at*1000)).toLocaleDateString()}</span>

            <div class="flex flex-row items-start gap-2 w-full whitespace-nowrap opacity-50">
                {$reactions.length} reactions
            </div>

            {#if fork}
                <a href="/a/{fork.encode()}" class="flex flex-row gap-1 whitespace-nowrap max-w-40 text-orange-500">
                    Forked from <Name ndk={$ndk} pubkey={forkPubkey} class="inline truncate" />
                </a>

                {#if $currentUser?.pubkey === event.pubkey}
                    <Button on:click={requestMerge} size="sm">
                        Request merge
                    </Button>
                {/if}
            {/if}
        </div>
    </div>

    {#if event.pubkey === $currentUser?.pubkey && $incomingPullRequests.length > 0}
        <div class="px-6 bg-zinc-50 dark:bg-white/20 w-full">
            <div class="text-sm text-orange-500">
                {$incomingPullRequests.length} incoming pull requests
            </div>

            {#each $incomingPullRequests as pr}
                <a href="/pr/{event.encode()}/{pr.id}" class="flex flex-row gap-2 items-center">
                    <Avatar ndk={$ndk} pubkey={pr.pubkey} class="w-8 h-8 rounded-full object-cover" />
                    <Name ndk={$ndk} pubkey={pr.pubkey} class="inline-block" />
                </a>
            {/each}
        </div>
    {/if}

    <div class="p-6 w-full">
        <EventContent {event} />
    </div>
</div>

{#if $currentUser && $currentUser.pubkey !== event.pubkey}
    <EntryCardSupportFooter {event} />
{/if}