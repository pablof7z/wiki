<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import CategoryList from '$lib/components/CategoryList.svelte';
	import EntriesList from '$lib/components/EntriesList.svelte';
	import ProlificWikifreaks from '$lib/components/ProlificWikifreaks.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { wotEnabled, wotSize } from '$lib/stores/wot';
	import { ArrowUpRight, Search } from '@lucide/svelte';
	import { NDKRelaySet, type NDKFilter, NDKWiki } from '@nostr-dev-kit/ndk';
	import { ArrowLeft } from 'radix-icons-svelte';

	const HOME_ENTRY_LIMIT = 250;
	const numberFormat = new Intl.NumberFormat('en-US');

	let entriesVisible = $state(0);
	let entriesNotVisible = $state(0);
	let newQuery = $state($page.url.searchParams.get('q') || '');
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

	const allEntries = $derived(Array.from(entries.events ?? []));

	const featuredCategories = $derived.by(() => {
		const categories = new Map<string, number>();

		for (const entry of allEntries) {
			const currentCategory = entry.tagValue('c');
			if (!currentCategory) continue;

			categories.set(currentCategory, (categories.get(currentCategory) ?? 0) + 1);
		}

		return Array.from(categories.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 8);
	});

	function formatCount(value: number) {
		return numberFormat.format(value ?? 0);
	}

	function search() {
		const url = new URL($page.url);
		const trimmed = newQuery.trim();

		if (trimmed) {
			url.searchParams.set('q', trimmed);
		} else {
			url.searchParams.delete('q');
		}

		url.searchParams.delete('c');
		goto(url.toString());
	}

	function clearFilters() {
		newQuery = '';
		goto('/');
	}

	function browseCategory(nextCategory: string) {
		const url = new URL($page.url);
		url.searchParams.delete('q');
		url.searchParams.set('c', nextCategory);
		goto(url.toString());
	}

	$effect(() => {
		newQuery = $page.url.searchParams.get('q') || '';
	});
</script>

<svelte:head>
	<title>Wikifreedia</title>
	<meta
		name="description"
		content="Search, compare, and publish decentralized encyclopedia entries on Nostr."
	/>
</svelte:head>

<div class="page-shell pb-20 pt-4 sm:pt-6">
	{#if !hasActiveFilters}
		<section
			class="relative overflow-hidden px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
		>
			<div
				class="absolute left-[8%] top-[18%] h-48 w-48 rounded-full bg-white/[0.04] blur-3xl"
			></div>
			<div
				class="absolute bottom-[12%] right-[12%] h-64 w-64 rounded-full bg-white/[0.05] blur-3xl"
			></div>

			<div class="relative z-10 flex h-full flex-col">
				<div
					class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-16 text-center"
				>
					<h1 class="display-wordmark text-[clamp(4rem,12vw,7.75rem)] leading-[0.92]">
						Wikifreedia
						<span class="ml-2 align-middle text-[0.28em] italic text-muted-foreground">v0.2</span>
					</h1>

					<p class="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
						No entry here has a canonical version. Truth is not discovered by consensus, but by
						integrating opposites and tracing how competing accounts sharpen one another.
					</p>

					<form
						class="mt-10 flex w-full max-w-4xl items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
						onsubmit={(event) => {
							event.preventDefault();
							search();
						}}
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-muted-foreground"
						>
							<Search class="h-5 w-5" />
						</div>

						<input
							bind:value={newQuery}
							type="text"
							class="h-12 flex-1 bg-transparent pr-2 text-base outline-none placeholder:text-muted-foreground/70"
							placeholder="Search a topic, person, or idea"
							aria-label="Search articles"
						/>

						<button
							type="submit"
							class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:-translate-y-px"
							aria-label="Submit search"
						>
							<ArrowUpRight class="h-5 w-5" />
						</button>
					</form>

					{#if featuredCategories.length > 0}
						<div class="mt-6 flex flex-wrap justify-center gap-2">
							{#each featuredCategories as [featuredCategory, count] (featuredCategory)}
								<button
									type="button"
									onclick={() => browseCategory(featuredCategory)}
									class="chrome-pill rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
								>
									{featuredCategory}
									<span class="ml-2 text-xs opacity-70">{formatCount(count)}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<div
		class={`grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px] ${hasActiveFilters ? 'mt-2' : 'mt-6'}`}
	>
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
