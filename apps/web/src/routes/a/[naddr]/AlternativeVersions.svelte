<script lang="ts">
	import AlternativeVersions from './AlternativeVersions.svelte';
	import { ndk } from "@/ndk";
	import type { NDKEvent, NDKRelaySet, NDKUser } from "@nostr-dev-kit/ndk";
	import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";
	import { derived } from "svelte/store";

    export let baseEvent: NDKEvent;
    export let activeEvent: NDKEvent;
    export let relaySet: NDKRelaySet;
    export let currentUser: NDKUser;

    const sub = $ndk.storeSubscribe({
        "#d": [baseEvent.dTag!],
        kinds: [baseEvent.kind!],
    }, { subId: 'alternativeVersions', relaySet});

    const authorizedPubkeys = baseEvent.getMatchingTags("p").map((t) => t[1]);

    const authorizedVersions = derived(sub, ($sub) => {
        return $sub.filter(e => authorizedPubkeys.includes(e.pubkey));
    });

    const unauthorizedVersions = derived(sub, ($sub) => {
        return $sub.filter(e => e.pubkey !== baseEvent.pubkey && !authorizedPubkeys.includes(e.pubkey));
    });
</script>

{#if $authorizedVersions.length > 0}
    <h3>Alternative Versions</h3>
    {#each $authorizedVersions as version}
        {#if currentUser.pubkey !== version.pubkey && (!activeEvent || version.id !== activeEvent.id)}
            <button class="flex flex-row items-center gap-2">
                <Avatar ndk={$ndk} pubkey={version.pubkey} class="w-8 h-8 object-cover rounded-full" />
                <Name ndk={$ndk} pubkey={version.pubkey} />'s version
                {#if version.created_at > baseEvent.created_at}
                    <span class="text-xs text-gray-500">edited {version.created_at}</span>
                {/if}
            </button>
        {/if}
    {/each}
{/if}

{#if $unauthorizedVersions.length > 0}
    <h3>Unauthed Versions</h3>
    {#each $unauthorizedVersions as version}
        <button class="flex flex-row items-center gap-2">
            <Avatar ndk={$ndk} pubkey={version.pubkey} class="w-8 h-8 object-cover rounded-full" />
            <Name ndk={$ndk} pubkey={version.pubkey} />'s version
            {#if version.created_at > baseEvent.created_at}
                <span class="text-xs text-gray-500">edited {version.created_at}</span>
            {/if}
        </button>
    {/each}
{/if}
