<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { ndk } from '$lib/ndk.svelte';
	import TopicEntriesList from '$lib/components/TopicEntriesList.svelte';
	import { fetchWikipediaArticle, type WikipediaArticle } from '$lib/utils/wikipedia';
	import PageContainer from '$lib/components/PageContainer.svelte';

	let { topic = $bindable($page.params.topic) }: { topic?: string } = $props();

	let mounted = $state(true);
	let wikipediaArticle = $state<WikipediaArticle | null>(null);
	let loadingWikipedia = $state(false);
	let lastFetchedTopic = $state<string | null>(null);

	const entries = ndk.$subscribe(() => {
		if (!mounted) return { filters: [] };

		const currentTopic = $page.params.topic;
		if (!currentTopic) return { filters: [] };

		return {
			filters: [{ kinds: [30818 as number], '#d': [currentTopic] }],
			subId: 'entries'
		};
	});

	$effect(() => {
		const currentTopic = $page.params.topic;

		if (currentTopic !== lastFetchedTopic) {
			wikipediaArticle = null;
			lastFetchedTopic = null;
			loadingWikipedia = false;
		}

		if (
			currentTopic &&
			entries.events &&
			entries.events.length === 0 &&
			!loadingWikipedia &&
			!wikipediaArticle &&
			lastFetchedTopic !== currentTopic
		) {
			loadingWikipedia = true;
			lastFetchedTopic = currentTopic;
			fetchWikipediaArticle(currentTopic).then((article) => {
				if (article && article.redirectedFrom && article.title !== currentTopic) {
					goto(`/${article.title}`, { replaceState: true });
				} else {
					wikipediaArticle = article;
					loadingWikipedia = false;
				}
			});
		}
	});
</script>

<PageContainer>
	<section class="glass-panel rounded-[2.5rem] px-6 py-6 sm:px-8 sm:py-8">
		<p class="eyebrow mb-3">Topic dossier</p>
		<h1>{topic}</h1>

		{#if entries.events && entries.events.length > 0}
			<p class="mt-4 text-base text-muted-foreground">
				There {entries.events.length === 1 ? 'is' : 'are'}
				{entries.events.length}
				{entries.events.length === 1 ? ' entry' : ' entries'} for this topic.
			</p>

			<div class="mt-6">
				<TopicEntriesList {entries} />
			</div>
		{:else if loadingWikipedia}
			<div class="glass-panel-soft mt-6 rounded-[1.8rem] px-5 py-6 text-muted-foreground">
				Searching Wikipedia...
			</div>
		{:else if wikipediaArticle}
			<div class="glass-panel-soft mt-6 rounded-[1.8rem] p-6">
				<div class="mb-4 flex items-center gap-2">
					<h2 class="text-xl">From Wikipedia</h2>
				</div>

				<h3 class="mb-4 text-2xl">{wikipediaArticle.title}</h3>

				<div class="prose max-w-none mb-4">
					{@html wikipediaArticle.content}
				</div>

				<a
					href={wikipediaArticle.url}
					target="_blank"
					rel="noopener noreferrer"
					class="subtle-link inline-flex items-center gap-1"
				>
					View on Wikipedia
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
				</a>
			</div>
		{:else}
			<div class="glass-panel-soft mt-6 rounded-[1.8rem] px-5 py-6 text-muted-foreground">
				No entries found for this topic.
			</div>
		{/if}
	</section>
</PageContainer>
