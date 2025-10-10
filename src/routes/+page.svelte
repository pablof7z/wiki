<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import { NDKEvent, type Hexpubkey, type NDKSubscription, type NostrEvent, NDKRelay, NDKRelaySet, type NDKFilter } from '@nostr-dev-kit/ndk';
	import { onDestroy, onMount } from 'svelte';
	import { minimumScore, wot, wotFilter, networkFollows } from '@/stores/wot';
	import { Switch } from "$lib/components/ui/switch";
	import EntriesList from '@/components/EntriesList.svelte';
	import Input from '@/components/ui/input/input.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '@/components/ui/button';
	import { ArrowLeft } from 'radix-icons-svelte';
	import CategoryList from '@/components/CategoryList.svelte';

	let entriesVisible = 0;
	let entriesNotVisible = 0;

	let newQuery: string = '';
	let query: string = '';
	let category: string | undefined | null;
	let mounted = false;

	onMount(() => {
		query = $page.url.searchParams.get('q') || '';
		newQuery = query;
		category = $page.url.searchParams.get('c');
		mounted = true;
	})

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
			return { filters: [{ kinds: [30818 as number] }], subId: 'entries' };
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

<div class="my-10 flex flex-row">
	<Input
		bind:value={newQuery}
		on:keyup={keyup}
		placeholder="Search"
		class="text-lg md:text-2xl sm:!p-8 grow"
	/>
	<Button
		class="md:!p-8"
		variant="outline"
		on:click={search}
	>Go</Button>
</div>

{#if category}
	<div class="flex flex-col mb-6">
		<h1>{category}</h1>
		<a class="text-orange-500" href="/">
			<ArrowLeft class="h-4 w-4 inline" />
			All Entries
		</a>
	</div>
{/if}

<CategoryList {entries} />

<h3 class="mb-2">Recently Modified Wikis</h3>

{#key query + category}
	{#if entries.events}
		<div class="flex flex-row justify-between">
			{#if $networkFollows.size > 1000}
				<label>
					<Switch bind:checked={$wotFilter} />
					Web-of-trust filter
				</label>
			{/if}

			<div>
				{entriesVisible} entries
				{#if entriesNotVisible > 0}
					({entriesNotVisible} not visible)
				{/if}
			</div>
		</div>

		<EntriesList {entries} bind:entriesVisible bind:entriesNotVisible />
	{/if}
{/key}