<script lang="ts">
	import { ndk } from "@/ndk.svelte";
	import { minimumScore, wot, wotFilter } from "@/stores/wot";
	import type { NDKEvent } from "@nostr-dev-kit/ndk";
	import type { Subscription } from "@nostr-dev-kit/svelte";
    import { Avatar } from "@nostr-dev-kit/svelte";

    let {
        entries,
        entriesVisible = $bindable(0),
        entriesNotVisible = $bindable(0)
    }: {
        entries: Subscription<NDKEvent>;
        entriesVisible?: number;
        entriesNotVisible?: number;
    } = $props();

	const removeFutureEntries = (now: number) => (entry: NDKEvent) => entry.created_at! > now;

    const entriesByTopic = $derived.by(() => {
			entriesVisible = 0;
			entriesNotVisible = 0;

			const byDtag: Record<string, NDKEvent[]> = {};
			const now = Math.floor(Date.now() / 1000);
			const events = entries.events;

			if (!events) return byDtag;

			events.forEach((entry) => {
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
{#each Object.entries(entriesByTopic) as [topic, entries], i (topic)}
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
                <Avatar ndk={ndk} pubkey={entry.pubkey} class="w-8 h-8 object-cover rounded-full flex-none" />
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