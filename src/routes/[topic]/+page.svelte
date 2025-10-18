<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { ndk } from "$lib/ndk.svelte";
	import { NDKArticle, NDKEvent } from "@nostr-dev-kit/ndk";
	import type { Subscription } from "@nostr-dev-kit/svelte";
	import { Avatar, EventContent } from "@nostr-dev-kit/svelte";
	import Name from "@/components/Name.svelte";
	import TopicEntry from "./TopicEntry.svelte";
	import EntriesList from "@/components/EntriesList.svelte";
	import TopicEntriesList from "@/components/TopicEntriesList.svelte";
	import { fetchWikipediaArticle, type WikipediaArticle } from "$lib/utils/wikipedia";
	import PageContainer from "@/components/PageContainer.svelte";

    let { topic = $bindable($page.params.topic) }: { topic?: string } = $props();

    let mounted = $state(true);
    let wikipediaArticle = $state<WikipediaArticle | null>(null);
    let loadingWikipedia = $state(false);
    let lastFetchedTopic = $state<string | null>(null);

    const entries = ndk.$subscribe(() => {
        if (!mounted) return { filters: [] };

        const currentTopic = $page.params.topic;
        return {
            filters: [{ kinds: [ 30818 as number], "#d": [currentTopic] }],
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
	<h1>{topic}</h1>

	{#if entries.events && entries.events.length > 0}
		<h3 class="text-lg text-neutral-500 font-medium">
			There are {entries.events.length} entries for this topic
		</h3>

		<TopicEntriesList {topic} {entries} />
	{:else if loadingWikipedia}
		<p class="text-neutral-500">Searching Wikipedia...</p>
	{:else if wikipediaArticle}
		<div class="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 my-4">
			<div class="flex items-center gap-2 mb-4">
				<svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 16l-1.789-3.894h-3.894L10.422 16H8.211L12 7.789 15.789 16h-1.895z"/>
				</svg>
				<h2 class="text-xl font-semibold text-blue-900 dark:text-blue-100">From Wikipedia</h2>
			</div>

			<h3 class="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{wikipediaArticle.title}</h3>

			<div class="prose dark:prose-invert max-w-none mb-4">
				{@html wikipediaArticle.content}
			</div>

			<a
				href={wikipediaArticle.url}
				target="_blank"
				rel="noopener noreferrer"
				class="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
			>
				View on Wikipedia
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
				</svg>
			</a>
		</div>
	{:else}
		<p class="text-neutral-500">No entries found for this topic.</p>
	{/if}
</PageContainer>