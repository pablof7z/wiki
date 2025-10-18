<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import { NDKEvent, type Hexpubkey, type NDKSubscription, type NostrEvent, NDKRelay, NDKRelaySet, type NDKFilter, NDKWiki } from '@nostr-dev-kit/ndk';
	import { wotEnabled, wotSize } from '@/stores/wot';
	import { Switch } from "$lib/components/ui/switch";
	import EntriesList from '@/components/EntriesList.svelte';
	import Input from '@/components/ui/input/input.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '@/components/ui/button';
	import { ArrowLeft } from 'radix-icons-svelte';
	import CategoryList from '@/components/CategoryList.svelte';
	import ProlificWikifreaks from '@/components/ProlificWikifreaks.svelte';

	let entriesVisible = $state(0);
	let entriesNotVisible = $state(0);

	let newQuery = $state($page.url.searchParams.get('q') || '');
	let query = $state($page.url.searchParams.get('q') || '');
	let category = $state<string | undefined | null>($page.url.searchParams.get('c'));
	let mounted = $state(true);

	const entries = ndk.$subscribe(() => {
		if (!mounted) return { filters: [] };

		const searchQuery = $page.url.searchParams.get('q') || '';
		const searchCategory = $page.url.searchParams.get('c');

		if (searchQuery) {
			const filters: NDKFilter[] = [{ kinds: [30818 as number], search: searchQuery }];
			filters.push({ kinds: [30818 as number], "#d": [searchQuery] });
			const relaySet = NDKRelaySet.fromRelayUrls(["wss://relay.wikifreedia.xyz"], ndk);
			return { filters, subId: 'entries', relaySet };
		} else if (searchCategory) {
			return { filters: [{ kinds: [30818 as number], "#c": [searchCategory] }], subId: 'entries' };
		} else {
			return { filters: [{ kinds: NDKWiki.kinds }], subId: 'entries' };
		}
	})

	function keyup(event: KeyboardEvent) {
		if (event.key === 'Enter') search();
	}

	function search() {
		const url = new URL($page.url);
		url.searchParams.set('q', newQuery);
		goto(url.toString());
	}
</script>

<div class="max-w-[1600px] mx-auto px-6 pt-6">
	{#if category}
		<div class="mb-6">
			<h1 class="text-2xl font-bold mb-2">{category}</h1>
			<a class="text-orange-500 hover:text-orange-600 inline-flex items-center gap-1" href="/">
				<ArrowLeft class="h-4 w-4" />
				All Entries
			</a>
		</div>
	{/if}

	<!-- Categories -->
	<div class="mb-8">
		<CategoryList {entries} />
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
	<!-- Main Content -->
	<div class="min-w-0">
		<div class="flex flex-row justify-between items-center mb-4">
			<h3 class="text-xl font-semibold">Recently Modified Wikis</h3>

			{#key query + category}
				{#if entries.events}
					<div class="text-sm text-neutral-600 dark:text-neutral-400">
						{entriesVisible} {entriesVisible === 1 ? 'entry' : 'entries'}
						{#if entriesNotVisible > 0}
							<span class="text-neutral-500">
								({entriesNotVisible} filtered)
							</span>
						{/if}
					</div>
				{/if}
			{/key}
		</div>

		{#if $wotSize > 1000}
			<div class="mb-4">
				<label class="flex items-center gap-2 cursor-pointer text-sm">
					<Switch bind:checked={$wotEnabled} />
					<span>Web-of-trust filter</span>
				</label>
			</div>
		{/if}

		{#key query + category}
			{#if entries.events}
				<EntriesList {entries} bind:entriesVisible bind:entriesNotVisible />
			{/if}
		{/key}
	</div>

	<!-- Sidebar -->
	<aside class="min-w-0">
		<div class="lg:sticky lg:top-6">
			<ProlificWikifreaks />
		</div>
	</aside>
	</div>
</div>