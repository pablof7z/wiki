<script lang="ts">
	import { wot, wotFilter, networkFollows } from "@/stores/wot";
	import { type NDKEventId, type NDKEvent } from "@nostr-dev-kit/ndk";
	import type { Subscription } from "@nostr-dev-kit/svelte";
	import UserName from "./UserName.svelte";
	import TopicEntriesListItem from "./TopicEntriesListItem.svelte";

    let { entries, topic }: { entries: Subscription<NDKEvent>; topic: string } = $props();

    const entriesToRender = $derived.by(() => {
        const events = entries.events;
        if (!events) return [];

        return Array.from(events).filter((entry) => {
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
{#each entriesToRender as entry, i (entry.id)}
    <div class="
        flex flex-row items-start gap-2 w-full p-2
        {i%2===0 ? 'bg-black/10' : 'dark:bg-black/20'}
    ">
        <TopicEntriesListItem {entry} {topic} />
    </div>
{/each}
</div>