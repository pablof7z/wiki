<script lang="ts">
	import { ndk } from '$lib/ndk';
	import type { NDKEventStore } from '@nostr-dev-kit/ndk-svelte';
	import { NDKEvent, type Hexpubkey, type NDKSubscription, type NostrEvent, NDKRelay, NDKRelaySet, type NDKFilter } from '@nostr-dev-kit/ndk';
	import { onDestroy, onMount } from 'svelte';
	import { minimumScore, wot, wotFilter } from '@/stores/wot';
	import { Switch } from "$lib/components/ui/switch";
	import { networkFollows } from '@/stores/session';
	import EntriesList from '@/components/EntriesList.svelte';
	import Input from '@/components/ui/input/input.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '@/components/ui/button';
	import { ArrowLeft } from 'radix-icons-svelte';
	import CategoryList from '@/components/CategoryList.svelte';

	let entries: NDKEventStore<NDKEvent> | undefined;
	
	let entriesVisible = 0;
	let entriesNotVisible = 0;

	let newQuery: string = '';
	let query: string = '';
	let category: string | undefined | null;
	let mounted = false;

	onDestroy(() => {
		entries?.unsubscribe();
	});

	$: if (query !== $page.url.searchParams.get('q') && mounted) {
		query = $page.url.searchParams.get('q') || '';
		category = $page.url.searchParams.get('c');

		entries?.unsubscribe();

		if (query) {
			const filters: NDKFilter[] = [{ kinds: [30818 as number], search: query }];
			filters.push({ kinds: [30818 as number], "#d": [query] });
			const relaySet = NDKRelaySet.fromRelayUrls(["wss://relay.wikifreedia.xyz"], $ndk);
			entries = $ndk.storeSubscribe(filters, { subId: 'entries', relaySet });
		} else if (category) {
			const filters: NDKFilter[] = [{ kinds: [30818 as number], "#c": [category] }];
			entries = $ndk.storeSubscribe(filters, { subId: 'entries' });
		} else {
			entries = $ndk.storeSubscribe([{ kinds: [30818 as number] }], { subId: 'entries' });
		}

		
	}

	onMount(() => {
		const filters: NDKFilter[] = [{ kinds: [30818 as number] }];

		query = $page.url.searchParams.get('q') || '';
		newQuery = query;

		if (query) {
			filters[0].search = query;
			filters.push({ kinds: [30818 as number], "#d": [query] });
		}

		entries = $ndk.storeSubscribe(filters, { subId: 'entries' });
		mounted = true;
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
	{#if entries && $entries}
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