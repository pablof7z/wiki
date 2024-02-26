<script lang="ts">
	import { ndk } from '$lib/ndk';
	import type { NDKEventStore } from '@nostr-dev-kit/ndk-svelte';
	import { NDKEvent, type Hexpubkey, type NDKSubscription, type NostrEvent } from '@nostr-dev-kit/ndk';
	import { onDestroy, onMount } from 'svelte';
	import { minimumScore, wot, wotFilter } from '@/stores/wot';
	import { Switch } from "$lib/components/ui/switch";
	import { networkFollows } from '@/stores/session';
	import EntriesList from '@/components/EntriesList.svelte';

	let entries: NDKEventStore<NDKEvent> | undefined;
	let entriesVisible = 0;
	let entriesNotVisible = 0;


	onDestroy(() => {
		entries?.unsubscribe();
	});

	onMount(() => {
		entries = $ndk.storeSubscribe([
			{ kinds: [ 30818 as number] }
		], { subId: 'entries' })
	})
</script>

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
