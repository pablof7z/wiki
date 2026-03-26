<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { NDKEvent, type NostrEvent } from '@nostr-dev-kit/ndk';
	import { ndk } from '$lib/ndk.svelte';
	import TopicEntriesSeedList from '$lib/components/TopicEntriesSeedList.svelte';
	import TopicEntriesList from '$lib/components/TopicEntriesList.svelte';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import { getRenderableTopicEntries } from '$lib/utils/topic-entries';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const topic = $derived($page.params.topic ?? '');
	const title = $derived(data.preview?.title ?? topic);
	const description = $derived(data.preview?.description ?? '');
	const seededEntryCount = $derived(data.topicEntries?.length ?? 0);
	let hydrated = $state(false);

	$effect(() => {
		hydrated = true;
	});

	const entries = ndk.$subscribe(() => {
		if (!browser) return undefined;

		const currentTopic = $page.params.topic;
		if (!currentTopic) return undefined;

		return {
			filters: [{ kinds: [30818 as number], '#d': [currentTopic] }],
			subId: 'entries'
		};
	});

	const seededEvents = $derived.by(() => {
		if (!hydrated) return [];

		return (data.seedEvents ?? []).map((event) => new NDKEvent(ndk, event as NostrEvent));
	});

	const topicEntries = $derived.by(() => {
		if (!hydrated) return [];

		const mergedEntries = new Map<string, NDKEvent>();

		for (const entry of seededEvents) {
			mergedEntries.set(entry.id, entry);
		}

		for (const entry of entries.events ?? []) {
			mergedEntries.set(entry.id, entry);
		}

		return getRenderableTopicEntries(mergedEntries.values());
	});

	const entriesLoaded = $derived(hydrated ? entries.eosed || topicEntries.length > 0 : seededEntryCount > 0);
	const entryCount = $derived(hydrated ? topicEntries.length : seededEntryCount);
	const isLoading = $derived(!entriesLoaded && entryCount === 0);
</script>

<PageContainer>
	<h1 class="text-[2.2rem] leading-[1.1]">{title}</h1>

	{#if description}
		<p class="mt-3 max-w-3xl text-sm leading-6 text-[#777]">
			{description}
		</p>
	{/if}

	{#if entryCount > 0}
		<p class="mt-3 text-sm text-[#777]">
			{entryCount}
			{entryCount === 1 ? ' entry' : ' entries'}
		</p>

		<div class="mt-6">
			{#if hydrated}
				<TopicEntriesList events={topicEntries} />
			{:else}
				<TopicEntriesSeedList entries={data.topicEntries ?? []} />
			{/if}
		</div>
	{:else if isLoading}
		<div class="surface-inset mt-6 rounded-xl px-5 py-6 text-muted-foreground">
			Loading entries...
		</div>
	{:else}
		<div class="surface-inset mt-6 rounded-xl px-5 py-6 text-muted-foreground">
			No entries found for this topic.
		</div>
	{/if}
</PageContainer>
