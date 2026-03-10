<script lang="ts">
	import { ndk } from "$lib/ndk.svelte";
	import type { NDKEvent, NDKRelaySet, NDKUser } from "@nostr-dev-kit/ndk";
	import { Avatar } from "@nostr-dev-kit/svelte";
	import Name from "$lib/components/Name.svelte";

    let { baseEvent, activeEvent, relaySet, currentUser }: {
        baseEvent: NDKEvent;
        activeEvent?: NDKEvent;
        relaySet: NDKRelaySet;
        currentUser: NDKUser
    } = $props();

    const sub = ndk.$subscribe(() => ({
        filters: [{
            "#d": [baseEvent.dTag!],
            kinds: [baseEvent.kind!]
        }],
        subId: 'alternativeVersions',
        relaySet
    }));

    const authorizedPubkeys = $derived(baseEvent.getMatchingTags("p").map((tag) => tag[1]));
    const baseCreatedAt = $derived(baseEvent.created_at ?? 0);

    const authorizedVersions = $derived.by(() =>
        sub.events.filter((event) => authorizedPubkeys.includes(event.pubkey))
    );

    const unauthorizedVersions = $derived.by(() =>
        sub.events.filter(
            (event) =>
                event.pubkey !== baseEvent.pubkey && !authorizedPubkeys.includes(event.pubkey)
        )
    );
</script>

{#if authorizedVersions.length > 0}
    <h3>Alternative Versions</h3>
    {#each authorizedVersions as version}
        {#if currentUser.pubkey !== version.pubkey && (!activeEvent || version.id !== activeEvent.id)}
            <button class="flex flex-row items-center gap-2">
                <Avatar ndk={ndk} pubkey={version.pubkey} class="w-8 h-8 object-cover rounded-full" />
                <Name ndk={ndk} pubkey={version.pubkey} />'s version
                {#if (version.created_at ?? 0) > baseCreatedAt}
                    <span class="text-xs text-gray-500">edited {version.created_at}</span>
                {/if}
            </button>
        {/if}
    {/each}
{/if}

{#if unauthorizedVersions.length > 0}
    <h3>Unauthed Versions</h3>
    {#each unauthorizedVersions as version}
        <button class="flex flex-row items-center gap-2">
            <Avatar ndk={ndk} pubkey={version.pubkey} class="w-8 h-8 object-cover rounded-full" />
            <Name ndk={ndk} pubkey={version.pubkey} />'s version
            {#if (version.created_at ?? 0) > baseCreatedAt}
                <span class="text-xs text-gray-500">edited {version.created_at}</span>
            {/if}
        </button>
    {/each}
{/if}
