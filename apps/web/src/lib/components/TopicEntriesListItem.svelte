<script lang="ts">
	import { derived } from 'svelte/store';
	import type { NDKEvent } from "@nostr-dev-kit/ndk";
	import UserName from "./UserName.svelte";
	import { ndk } from "@/ndk";
	import { Avatar } from '@nostr-dev-kit/ndk-svelte-components';

    export let entry: NDKEvent;

    const topic = entry.dTag!;

    const taggedByEvents = $ndk.storeSubscribe({
        kinds: [30818 as number],
        ...entry.filter()
    });

    const deferedToBy = derived(taggedByEvents, ($taggedByEvents) => {
        return Array.from($taggedByEvents).filter((e) => e.getMatchingTags("a").find(t => t[3] === "defer"));
    });
</script>

<div class="flex flex-row items-center justify-between w-full">
    <a href="/{encodeURIComponent(topic)}/{entry.pubkey.slice(0, 18)}" class="grow flex flex-row items-start justify-between">
        <UserName pubkey={entry.pubkey} />

        <div class="flex flex-row items-center gap-2 text-sm">
        {#if $deferedToBy.length > 0}
            <span class="opacity-50">Supported by</span>
            {#each $deferedToBy as defer (defer.pubkey)}
                <Avatar ndk={$ndk} pubkey={defer.pubkey} class="w-6 h-6 object-cover rounded-full flex-none" />
            {/each}
        {/if}
        </div>
    </a>
    <a href="/a/{entry.encode()}" class="text-xs opacity-50 shrink">Perma-link</a>
</div>