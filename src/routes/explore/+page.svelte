<script lang="ts">
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import AuthorGrid from '$lib/components/AuthorGrid.svelte';
	import CategoryList from '$lib/components/CategoryList.svelte';
	import EntriesList from '$lib/components/EntriesList.svelte';
	import ProlificWikifreaks from '$lib/components/ProlificWikifreaks.svelte';
	import RecommendedAuthors from '$lib/components/RecommendedAuthors.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { matchesWikiSearch } from '$lib/utils/wiki-search';
	import { wotEnabled, wotSize } from '$lib/stores/wot';
	import {
		NDKRelaySet,
		NDKSubscriptionCacheUsage,
		type NDKFilter,
		NDKWiki
	} from '@nostr-dev-kit/ndk';
	import { ArrowLeft } from 'radix-icons-svelte';

	const HOME_ENTRY_LIMIT = 250;

	let entriesVisible = $state(0);
	let entriesNotVisible = $state(0);
	let query = $derived($page.url.searchParams.get('q') || '');
	let category = $derived($page.url.searchParams.get('c'));
	let hasActiveFilters = $derived(Boolean(query || category));

	const entries = ndk.$subscribe(() => {
		const searchQuery = $page.url.searchParams.get('q') || '';
		const searchCategory = $page.url.searchParams.get('c');

		if (searchQuery) {
			const filters: NDKFilter[] = [{ kinds: [30818 as number], search: searchQuery }];
			filters.push({ kinds: [30818 as number], '#d': [searchQuery] });
			const relaySet = NDKRelaySet.fromRelayUrls(['wss://relay.wikifreedia.xyz'], ndk);
			return {
				filters,
				subId: 'entries',
				relaySet,
				exclusiveRelay: true,
				// The local SQLite cache does not implement NIP-50 `search`, so cache-first
				// subscriptions broaden to all cached kind-30818 events.
				cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
			};
		}

		if (searchCategory) {
			return { filters: [{ kinds: [30818 as number], '#c': [searchCategory] }], subId: 'entries' };
		}

		return { filters: [{ kinds: NDKWiki.kinds, limit: HOME_ENTRY_LIMIT }], subId: 'entries' };
	});

	const filteredQueryEvents = $derived.by(() => {
		if (!query) return entries.events ?? [];

		return (entries.events ?? []).filter((event) => matchesWikiSearch(event, query));
	});
</script>

<svelte:head>
	<title>{query ? `"${query}" — Wikifreedia` : category ? `${category} — Wikifreedia` : 'Explore — Wikifreedia'}</title>
	<meta
		name="description"
		content="Browse topics, authors, and categories on Wikifreedia — the decentralized encyclopedia."
	/>
</svelte:head>

{#if hasActiveFilters}
	<div class="page-shell pb-20 pt-4 sm:pt-6">
		<div class="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px] mt-2">
			<div class="space-y-6">
				<section>
					<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<div class="mb-4 flex flex-wrap items-center gap-2">
								{#if query}
									<span class="chrome-pill rounded-full px-3 py-1.5 text-xs text-muted-foreground">
										Query: {query}
									</span>
								{/if}

								{#if category}
									<span class="chrome-pill rounded-full px-3 py-1.5 text-xs text-muted-foreground">
										Category: {category}
									</span>
								{/if}

								<a
									href="/explore"
									class="subtle-link inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm"
								>
									<ArrowLeft class="h-4 w-4" />
									Return to full atlas
								</a>
							</div>

							<h2 class="text-[2rem]">
								{query
									? `Results for "${query}"`
									: `${category}`}
							</h2>
						</div>

						<div class="text-sm text-muted-foreground">
							{entriesVisible} visible
							{#if entriesNotVisible > 0}
								<span class="opacity-70"> · {entriesNotVisible} filtered</span>
							{/if}
						</div>
					</div>

					{#if $wotSize > 1000}
						<div
							class="surface-inset mt-6 flex flex-col gap-4 rounded-xl px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div>
								<p class="eyebrow mb-2">Trust Filter</p>
								<p class="text-sm text-muted-foreground">
									Use your web of trust to suppress articles outside your social graph.
								</p>
							</div>

							<label class="flex items-center gap-3 text-sm">
								<Switch bind:checked={$wotEnabled} />
								<span>Enable WoT filtering</span>
							</label>
						</div>
					{/if}

					<div class="mt-6">
						{#if entries.events}
							<EntriesList
								{entries}
								events={query ? filteredQueryEvents : undefined}
								paginationKey={`${query ?? ''}:${category ?? ''}`}
								bind:entriesVisible
								bind:entriesNotVisible
							/>
						{:else}
							<div class="surface-inset rounded-xl px-5 py-6 text-sm text-muted-foreground">
								Loading entries from cache and relays...
							</div>
						{/if}
					</div>
				</section>

				<CategoryList {entries} events={query ? filteredQueryEvents : undefined} />
			</div>

			<div class="space-y-6">
				<ProlificWikifreaks />
			</div>
		</div>
	</div>
{:else}
	<div class="page-shell pb-20 pt-4 sm:pt-6">
		<div class="mb-8">
			<h1 class="text-[2.2rem]">Explore</h1>
			<p class="mt-2 text-muted-foreground">Browse topics, authors, and categories.</p>
		</div>

		<div class="space-y-10">
			<section>
				<h2 class="text-xl mb-2">Recommended wiki authors</h2>
				<p class="mb-4 max-w-2xl text-sm text-muted-foreground">
					Public curator lists tagged as good wiki authors across the network.
				</p>
				<RecommendedAuthors />
			</section>

			<section>
				<h2 class="text-xl mb-4">Active authors</h2>
				<AuthorGrid />
			</section>

			<section>
				<h2 class="text-xl mb-4">Recent topics</h2>
				{#if entries.events}
					<EntriesList {entries} />
				{:else}
					<div class="surface-inset rounded-xl px-5 py-6 text-sm text-muted-foreground">
						Loading entries from cache and relays...
					</div>
				{/if}
			</section>

			<CategoryList {entries} />
		</div>
	</div>
{/if}
