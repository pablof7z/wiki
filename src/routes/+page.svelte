<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import CategoryList from '$lib/components/CategoryList.svelte';
	import EntriesList from '$lib/components/EntriesList.svelte';
	import LandingPage from '$lib/components/landing/LandingPage.svelte';
	import ProlificWikifreaks from '$lib/components/ProlificWikifreaks.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { wotEnabled, wotSize } from '$lib/stores/wot';
	import { NDKRelaySet, type NDKFilter, NDKWiki } from '@nostr-dev-kit/ndk';
	import { ArrowLeft } from 'radix-icons-svelte';

	const HOME_ENTRY_LIMIT = 250;

	let entriesVisible = $state(0);
	let entriesNotVisible = $state(0);
	let mounted = $state(true);
	let query = $derived($page.url.searchParams.get('q') || '');
	let category = $derived($page.url.searchParams.get('c'));
	let hasActiveFilters = $derived(Boolean(query || category));

	const entries = ndk.$subscribe(() => {
		if (!mounted) return { filters: [] };

		const searchQuery = $page.url.searchParams.get('q') || '';
		const searchCategory = $page.url.searchParams.get('c');

		if (searchQuery) {
			const filters: NDKFilter[] = [{ kinds: [30818 as number], search: searchQuery }];
			filters.push({ kinds: [30818 as number], '#d': [searchQuery] });
			const relaySet = NDKRelaySet.fromRelayUrls(['wss://relay.wikifreedia.xyz'], ndk);
			return { filters, subId: 'entries', relaySet };
		}

		if (searchCategory) {
			return { filters: [{ kinds: [30818 as number], '#c': [searchCategory] }], subId: 'entries' };
		}

		return { filters: [{ kinds: NDKWiki.kinds, limit: HOME_ENTRY_LIMIT }], subId: 'entries' };
	});

	function clearFilters() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Wikifreedia</title>
	<meta
		name="description"
		content="Search, compare, and publish decentralized encyclopedia entries on Nostr."
	/>
</svelte:head>

{#if !hasActiveFilters}
	<LandingPage />
{:else}
<div class="page-shell pb-20 pt-4 sm:pt-6">
	<div class="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px] mt-2">
		<div class="space-y-6">
			<section class="glass-panel rounded-[2.25rem] p-5 sm:p-7">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						{#if hasActiveFilters}
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

								<button
									type="button"
									onclick={clearFilters}
									class="subtle-link inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm"
								>
									<ArrowLeft class="h-4 w-4" />
									Return to the full atlas
								</button>
							</div>

							<p class="eyebrow mb-3">Search Results</p>
							<h2 class="text-[clamp(2rem,4vw,3rem)]">
								{query
									? `Results for "${query}"`
									: `${category}`}
							</h2>
							<p class="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
								Results are surfaced immediately. Refine the search from the header or jump back to the full atlas.
							</p>
						{/if}
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
						class="surface-inset mt-6 flex flex-col gap-4 rounded-[1.5rem] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
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
							paginationKey={`${query ?? ''}:${category ?? ''}`}
							bind:entriesVisible
							bind:entriesNotVisible
						/>
					{:else}
						<div class="surface-inset rounded-[1.5rem] px-5 py-6 text-sm text-muted-foreground">
							Loading entries from cache and relays...
						</div>
					{/if}
				</div>
			</section>

			<CategoryList {entries} />
		</div>

		<div class="space-y-6">
			<ProlificWikifreaks />

			<section class="glass-panel-soft rounded-[2rem] p-6">
				<p class="eyebrow mb-3">Editorial model</p>
				<h3 class="text-xl">Knowledge without a central gatekeeper</h3>
				<p class="mt-3 text-sm leading-7 text-muted-foreground">
					Every entry is just a signed event. Authors can publish competing versions, readers can
					trace provenance, and readers decide what should rise.
				</p>
			</section>
		</div>
	</div>
</div>
{/if}
