<script lang="ts">
	import { wotFilterEvents, wotRankEvents } from '@/stores/wot';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import TopicEntriesListItem from './TopicEntriesListItem.svelte';

	let { entries }: { entries: Subscription<NDKEvent> } = $props();

	const entriesToRender = $derived.by(() => {
		const events = entries.events;
		if (!events) return [];

		// Filter out deferred entries
		const nonDeferred = Array.from(events).filter((entry) => {
			const isDeferred = entry.getMatchingTags('a').some((t) => t[3] === 'defer');
			return !isDeferred;
		});

		// Apply WoT filtering if enabled, then rank by WoT
		return wotRankEvents(wotFilterEvents(nonDeferred));
	});
</script>

<div class="divide-y divide-white/8">
	{#each entriesToRender as entry (entry.id)}
		<div class="py-3 first:pt-0 last:pb-0">
			<TopicEntriesListItem {entry} />
		</div>
	{/each}
</div>
