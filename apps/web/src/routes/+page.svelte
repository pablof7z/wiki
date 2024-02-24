<script lang="ts">
	import { ndk } from '$lib/ndk';
	import type { NDKEventStore } from '@nostr-dev-kit/ndk-svelte';
	import { NDKEvent, type Hexpubkey, type NDKSubscription, type NostrEvent } from '@nostr-dev-kit/ndk';
	import { derived, type Readable } from 'svelte/store';
	import { Avatar } from '@nostr-dev-kit/ndk-svelte-components';
	import { onDestroy, onMount } from 'svelte';
	import { minimumScore, wot, wotFilter } from '@/stores/wot';
	import { Switch } from "$lib/components/ui/switch";

	let entries: NDKEventStore<NDKEvent> | undefined;
	let entriesByTopic: Readable<Record<string, NDKEvent[]>> | undefined;

	let entriesVisible = 0;
	let entriesNotVisible = 0;

	onDestroy(() => {
		entries?.unsubscribe();
	});

	onMount(() => {
		entries = $ndk.storeSubscribe([
			{ kinds: [ 30818 as number] }
		], { subId: 'entries' })

		entriesByTopic = derived([entries, wotFilter, minimumScore], ([$entries]) => {
			entriesVisible = 0;
			entriesNotVisible = 0;

			const byDtag: Record<string, NDKEvent[]> = {};
			$entries.forEach((entry) => {
				const dTag = entry.dTag;
				const pubkey = entry.pubkey;

				if (!dTag) return;

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
	})
</script>

{#if entriesByTopic && $entriesByTopic && $entries}
	<div class="flex flex-row justify-between">
		<label>
			<Switch bind:checked={$wotFilter} />
			Web-of-trust filter
		</label>

		<div>
			{entriesVisible} entries
			{#if entriesNotVisible > 0}
				({entriesNotVisible} not visible)
			{/if}
		</div>
	</div>

	{#each Object.entries($entriesByTopic) as [topic, entries], i (topic)}
		<div class="flex flex-row items-start gap-2 w-full p-2" class:bg-zinc-100={i%2===0}>
			<a href="/{topic}" class="grow flex flex-col items-start">
				{topic}
				<div class="text-xs text-neutral-500">
					{Array.from(new Set(
						entries.map((entry) => entry.relay?.url).filter(r => r)
					)).join(", ")}
				</div>
			</a>

			<div class="place-self-end flex flex-row flex-nowrap">
				{#each Array.from(entries) as entry (entry.pubkey)}
					<Avatar ndk={$ndk} pubkey={entry.pubkey} class="w-8 h-8 object-cover rounded-full flex-none" />
				{/each}
			</div>

		</div>
	{/each}
{/if}
