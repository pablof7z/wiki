<script lang="ts">
	import { ndk } from "@/ndk";
	import { NDKEvent, type Hexpubkey, type NDKEventId, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
	import { derived, writable, type Readable } from "svelte/store";
	import Button from "./ui/button/button.svelte";
	import { currentUser } from "@/stores/session";

    export let event: NDKEvent;
    export let reactions: Readable<NDKEvent[]>;
    export let reactionCount: number | undefined = undefined;

    let currentUserHasReacted = false;
    let deletedId = writable<NDKEventId | undefined>();

    $: if ($currentUser) {
        currentUserHasReacted = $reactions.some(r => r.pubkey === $currentUser.pubkey);
    }

    const grupedReactions = derived([reactions, deletedId], ([$reactions, $deletedId]) => {
        const map: Record<string, Set<Hexpubkey>> = {
            "+": new Set(),
            "-": new Set(),
        };

        for (const reaction of $reactions) {
            if (reaction.id === $deletedId) continue;
            const type = reaction.content;
            if (!map[type]) map[type] = new Set();
            map[type].add(reaction.pubkey);
        }

        return map;
    })

    function prettifyReaction(r: string) {
        if (r === "+") return "👍";
        if (r === "-") return "👎";
        return r;
    }

    async function react(type: string) {
        const r = new NDKEvent($ndk, {
            kind: 7,
            content: type,
        } as NostrEvent);
        r.tag(event);
        r.publish();
    }

	function deleteUserReaction() {
        if (!$currentUser) return;
        const reaction = $reactions.find(r => r.pubkey === $currentUser.pubkey);
        if (!reaction) return;
        reaction.delete();
        $deletedId = reaction.id;
        currentUserHasReacted = false;
	}

    $: reactionCount = new Set($reactions.map(r => r.pubkey)).size;
</script>


<div class="flex flex-col gap-1">
    {#each Object.keys($grupedReactions) as type}
        <div class="flex flex-row items-center gap-2">
            <h2 class="flex-none">
                {#if !currentUserHasReacted}
                    <Button on:click={() => react(type)}>{prettifyReaction(type)}</Button>
                {:else}
                    {prettifyReaction(type)}
                {/if}
            </h2>
            <div class="flex flex-row flex-wrap -space-x-2 hover:space-x-0 transition-all duration-300">
                {#each Array.from($grupedReactions[type]) as pubkey (pubkey)}
                    {#if pubkey === $currentUser?.pubkey}
                        <button on:click={deleteUserReaction}>
                            <Avatar ndk={$ndk} {pubkey} class="w-10 h-10 object-cover rounded-full flex-none border-4 border-orange-600" />
                        </button>
                    {:else}
                        <Avatar ndk={$ndk} {pubkey} class="w-10 h-10 object-cover rounded-full flex-none border-4 border-orange-600" />
                    {/if}
                {/each}
            </div>
        </div>
    {/each}

</div>