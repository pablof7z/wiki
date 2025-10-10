<script lang="ts">
	import { ndk } from "@/ndk.svelte";
	import { NDKEvent, type Hexpubkey, type NDKEventId, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { Avatar } from "@nostr-dev-kit/svelte";
	import type { Subscription } from "@nostr-dev-kit/svelte";
	import Button from "./ui/button/button.svelte";

    let {
        event,
        reactions,
        reactionCount = $bindable(undefined)
    }: {
        event: NDKEvent;
        reactions: Subscription<NDKEvent>;
        reactionCount?: number | undefined;
    } = $props();

    let currentUser = $derived(ndk.$sessions?.currentUser);
    let deletedId = $state(undefined as NDKEventId | undefined);

    const reactionsArray = $derived(Array.from(reactions.events ?? []));

    const currentUserHasReacted = $derived.by(() => {
        if (!currentUser) return false;
        return reactionsArray.some(r => r.pubkey === currentUser.pubkey);
    });

    const grupedReactions = $derived.by(() => {
        const map: Record<string, Set<Hexpubkey>> = {
            "+": new Set(),
            "-": new Set(),
        };

        for (const reaction of reactionsArray) {
            if (reaction.id === deletedId) continue;
            const type = reaction.content;
            if (!map[type]) map[type] = new Set();
            map[type].add(reaction.pubkey);
        }

        return map;
    });

    $effect(() => {
        reactionCount = new Set(reactionsArray.map(r => r.pubkey)).size;
    });

    function prettifyReaction(r: string) {
        if (r === "+") return "👍";
        if (r === "-") return "👎";
        return r;
    }

    async function react(type: string) {
        const r = new NDKEvent(ndk, {
            kind: 7,
            content: type,
        } as NostrEvent);
        r.tag(event);
        r.publish();
    }

	function deleteUserReaction() {
        if (!currentUser) return;
        const reaction = reactionsArray.find(r => r.pubkey === currentUser.pubkey);
        if (!reaction) return;
        reaction.delete();
        deletedId = reaction.id;
	}
</script>


<div class="flex flex-col gap-1">
    {#each Object.keys(grupedReactions) as type}
        <div class="flex flex-row items-center gap-2">
            <h2 class="flex-none">
                {#if !currentUserHasReacted}
                    <Button on:click={() => react(type)}>{prettifyReaction(type)}</Button>
                {:else}
                    {prettifyReaction(type)}
                {/if}
            </h2>
            <div class="flex flex-row flex-wrap -space-x-2 hover:space-x-0 transition-all duration-300">
                {#each Array.from(grupedReactions[type]) as pubkey (pubkey)}
                    {#if pubkey === currentUser?.pubkey}
                        <button on:click={deleteUserReaction}>
                            <Avatar ndk={ndk} {pubkey} class="w-10 h-10 object-cover rounded-full flex-none border-4 border-orange-600" />
                        </button>
                    {:else}
                        <Avatar ndk={ndk} {pubkey} class="w-10 h-10 object-cover rounded-full flex-none border-4 border-orange-600" />
                    {/if}
                {/each}
            </div>
        </div>
    {/each}

</div>