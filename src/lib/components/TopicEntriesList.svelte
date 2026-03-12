<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import TopicEntriesListItem from './TopicEntriesListItem.svelte';
	import { getRenderableTopicEntries } from '$lib/utils/topic-entries';

	let { entries }: { entries: Subscription<NDKEvent> } = $props();

	const entriesToRender = $derived(getRenderableTopicEntries(entries.events));
</script>

<div class="divide-y divide-white/8">
	{#each entriesToRender as entry (entry.id)}
		<div class="py-3 first:pt-0 last:pb-0">
			<TopicEntriesListItem {entry} />
		</div>
	{/each}
</div>
