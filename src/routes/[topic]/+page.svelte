<script lang="ts">
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import TopicEntriesList from '$lib/components/TopicEntriesList.svelte';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import { getRenderableTopicEntries } from '$lib/utils/topic-entries';

	let { topic = $bindable($page.params.topic) }: { topic?: string } = $props();

	let mounted = $state(true);

	const entries = ndk.$subscribe(() => {
		if (!mounted) return { filters: [] };

		const currentTopic = $page.params.topic;
		if (!currentTopic) return { filters: [] };

		return {
			filters: [{ kinds: [30818 as number], '#d': [currentTopic] }],
			subId: 'entries'
		};
	});

	const topicEntries = $derived(getRenderableTopicEntries(entries.events));
</script>

<PageContainer>
	<section class="glass-panel rounded-[2.5rem] px-6 py-6 sm:px-8 sm:py-8">
		<p class="eyebrow mb-3">Topic dossier</p>
		<h1>{topic}</h1>

		{#if topicEntries.length > 0}
			<p class="mt-4 text-base text-muted-foreground">
				There {topicEntries.length === 1 ? 'is' : 'are'}
				{topicEntries.length}
				{topicEntries.length === 1 ? ' entry' : ' entries'} for this topic.
			</p>

			<div class="mt-6">
				<TopicEntriesList {entries} />
			</div>
		{:else}
			<div class="surface-inset mt-6 rounded-[1.8rem] px-5 py-6 text-muted-foreground">
				No entries found for this topic.
			</div>
		{/if}
	</section>
</PageContainer>
