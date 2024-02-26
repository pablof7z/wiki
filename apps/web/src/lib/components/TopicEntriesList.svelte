<script lang="ts">
	import { wot, wotFilter } from "@/stores/wot";
	import { type NDKEventId, type NDKEvent } from "@nostr-dev-kit/ndk";
	import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
	import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";
	import { derived } from "svelte/store";
	import UserName from "./UserName.svelte";
	import { networkFollows } from "@/stores/session";
	import TopicEntriesListItem from "./TopicEntriesListItem.svelte";

    export let entries: NDKEventStore<NDKEvent>;
    export let topic: string;

    const entriesToRender = derived([entries, wot, wotFilter], ([$entries, $wot, $wotFilter]) => {
        if (!$entries) return [];

        return $entries.filter((entry) => {
            const isDefered = entry.getMatchingTags("a").some(t => t[3] === "defer");

            // Don't list the entries that have been defered
            if (isDefered) return false;

            if ($wotFilter) {
                return $wot.has(entry.pubkey);
            } else {
                return true;
            }
        })

        .sort((a, b) => {
            const aScore = $networkFollows.get(a.pubkey) ?? 0;
            const bScore = $networkFollows.get(b.pubkey) ?? 0;

            return bScore - aScore;
        });
    });
</script>

<div class="rounded-xl">
{#each $entriesToRender as entry, i (entry.id)}
    <div class="
        flex flex-row items-start gap-2 w-full p-2
        {i%2===0 ? 'bg-black/10' : 'dark:bg-black/20'}
    ">
        <TopicEntriesListItem {entry} {topic} />
    </div>
{/each}
</div>