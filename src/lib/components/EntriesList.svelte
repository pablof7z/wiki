<script lang="ts">
	import { ndk } from "@/ndk.svelte";
	import { wotEnabled, isInWoT } from "@/stores/wot";
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
				if ($wotEnabled && !isInWoT(pubkey)) {
					return;
				}

				if (!byDtag[dTag]) byDtag[dTag] = [];

				byDtag[dTag].push(entry);
			});

			return byDtag;
		});

	$effect(() => {
		let visible = 0;
		let notVisible = 0;
		const events = entries.events;

		if (events) {
			events.forEach((entry) => {
				const dTag = entry.dTag;
				const pubkey = entry.pubkey;
				const deferred = entry.getMatchingTags("a").some(t => t[3] === "defer");

				if (!dTag || deferred) return;

				if ($wotEnabled && !isInWoT(pubkey)) {
					notVisible++;
				} else {
					visible++;
				}
			});
		}

		entriesVisible = visible;
		entriesNotVisible = notVisible;
	});
</script>

<div class="flex flex-col gap-3">
{#each Object.entries(entriesByTopic) as [topic, entries] (topic)}
    <div class="
		bg-white dark:bg-neutral-900
		border border-neutral-200 dark:border-neutral-800
		rounded-lg p-4
		hover:border-neutral-300 dark:hover:border-neutral-700
		transition-colors
		flex flex-row items-center gap-4
	">
        <a href="/{encodeURIComponent(topic)}" class="flex-1 flex flex-col gap-1 min-w-0">
            <div class="font-medium text-base">{topic}</div>
            <div class="text-xs text-neutral-500 truncate">
                {Array.from(new Set(
                    entries.map((entry) => entry.relay?.url).filter(r => r)
                )).join(", ")}
            </div>
        </a>

        <div class="flex flex-row flex-wrap justify-end gap-1 max-w-xs">
            {#each Array.from(entries).slice(0, 10) as entry (entry.pubkey)}
                <Avatar ndk={ndk} pubkey={entry.pubkey} class="w-8 h-8 object-cover rounded-full flex-none" />
            {/each}
            {#if entries.length > 10}
                <div class="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium">
                    +{entries.length - 10}
                </div>
            {/if}
        </div>
    </div>
{/each}
</div>