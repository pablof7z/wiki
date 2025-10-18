<script lang="ts">
	import { wotEnabled, wotFilterEvents, wotRankEvents } from "@/stores/wot";
	import { type NDKEventId, type NDKEvent } from "@nostr-dev-kit/ndk";
	import type { Subscription } from "@nostr-dev-kit/svelte";
	import UserName from "./UserName.svelte";
	import TopicEntriesListItem from "./TopicEntriesListItem.svelte";

    let { entries, topic }: { entries: Subscription<NDKEvent>; topic: string } = $props();

    const entriesToRender = $derived.by(() => {
        const events = entries.events;
        if (!events) return [];

        // Filter out deferred entries
        const nonDeferred = Array.from(events).filter((entry) => {
            const isDeferred = entry.getMatchingTags("a").some(t => t[3] === "defer");
            return !isDeferred;
        });

        // Apply WoT filtering if enabled, then rank by WoT
        return wotRankEvents(wotFilterEvents(nonDeferred));
    });
</script>

<div class="rounded-xl">
{#each entriesToRender as entry, i (entry.id)}
    <div class="
        flex flex-row items-start gap-2 w-full p-2
        {i%2===0 ? 'bg-black/10' : 'dark:bg-black/20'}
    ">
        <TopicEntriesListItem {entry} {topic} />
    </div>
{/each}
</div>