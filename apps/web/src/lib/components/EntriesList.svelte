<script lang="ts">
	import { ndk } from "@/ndk";
	import { minimumScore, wot, wotFilter } from "@/stores/wot";
	import type { NDKEvent } from "@nostr-dev-kit/ndk";
	import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
    import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
	import { derived } from "svelte/store";

    export let entries: NDKEventStore<NDKEvent>;
    export let entriesVisible = 0;
	export let entriesNotVisible = 0;

    const entriesByTopic = derived([entries, wotFilter, minimumScore], ([$entries]) => {
			entriesVisible = 0;
			entriesNotVisible = 0;

			const byDtag: Record<string, NDKEvent[]> = {};
			$entries.forEach((entry) => {
				const dTag = entry.dTag;
				const pubkey = entry.pubkey;
				const deferred = entry.getMatchingTags("a").some(t => t[3] === "defer");

				if (!dTag) return;
				if (deferred) return;

				// if we are filtering by wot, we need to check if the pubkey is in the wot
				if ($wotFilter && !$wot.has(pubkey)) {
					entriesNotVisible++;
					return;
				}

				entriesVisible++;

				if (!byDtag[dTag]) byDtag[dTag] = [];

				byDtag[dTag].push(entry);
			});

			return byDtag;
		});
</script>

<div class="rounded-xl">
{#each Object.entries($entriesByTopic) as [topic, entries], i (topic)}
    <div class="
		item
		flex flex-row items-start gap-2 w-full p-2
		{i%2===0 ? 'bg-black/10' : 'dark:bg-black/20'}
	">
        <a href="/{encodeURIComponent(topic)}" class="grow flex flex-col items-start">
            {topic}
            <div class="text-xs text-neutral-500">
                {Array.from(new Set(
                    entries.map((entry) => entry.relay?.url).filter(r => r)
                )).join(", ")}
            </div>
        </a>

        <div class="place-self-end flex flex-row flex-wrap justify-end">
            {#each Array.from(entries).slice(0, 100) as entry (entry.pubkey)}
                <Avatar ndk={$ndk} pubkey={entry.pubkey} class="w-8 h-8 object-cover rounded-full flex-none" />
            {/each}
        </div>

    </div>
{/each}
</div>
<style lang="postcss">
	.item:first-of-type {
		@apply rounded-t-xl;
	}
</style>