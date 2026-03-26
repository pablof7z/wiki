<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import TopicEntriesListItem from './TopicEntriesListItem.svelte';
	import { buildTopicComparisonHref } from '$lib/utils/article-comparison';
	import { getRenderableTopicEntries } from '$lib/utils/topic-entries';

	let {
		entries = undefined,
		events = undefined
	}: {
		entries?: Subscription<NDKEvent>;
		events?: Iterable<NDKEvent>;
	} = $props();

	const entriesToRender = $derived(getRenderableTopicEntries(events ?? entries?.events));
</script>

	<div class="divide-y divide-white/[0.03]">
		{#each entriesToRender as entry (entry.id)}
			<div class="py-3 first:pt-0 last:pb-0">
				<TopicEntriesListItem
					{entry}
					compareHref={entriesToRender.length > 1
						? buildTopicComparisonHref(entry.dTag ?? '', [entry.id])
						: undefined}
				/>
			</div>
		{/each}
	</div>
