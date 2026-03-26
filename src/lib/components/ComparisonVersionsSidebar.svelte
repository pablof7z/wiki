<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import Name from '$lib/components/Name.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ndk } from '$lib/ndk.svelte';
	import {
		formatEventDate,
		MAX_COMPARISON_ENTRIES
	} from '$lib/utils/article-comparison';

	let {
		entries = [],
		selectedEntryIds = [],
		onToggleEntry
	}: {
		entries?: NDKEvent[];
		selectedEntryIds?: string[];
		onToggleEntry: (eventId: string) => void;
	} = $props();

	function isSelected(eventId: string) {
		return selectedEntryIds.includes(eventId);
	}

	function actionLabel(eventId: string) {
		if (isSelected(eventId)) {
			return selectedEntryIds.length > 1 ? 'Remove' : 'Selected';
		}

		return selectedEntryIds.length >= MAX_COMPARISON_ENTRIES ? 'Full' : 'Add';
	}

	function actionDisabled(eventId: string) {
		if (isSelected(eventId)) {
			return selectedEntryIds.length === 1;
		}

		return selectedEntryIds.length >= MAX_COMPARISON_ENTRIES;
	}
</script>

<section class="glass-panel rounded-2xl px-5 py-5">
	<p class="eyebrow mb-3">Alternative versions</p>
	<h3 class="text-lg">Authors in this comparison</h3>
	<p class="mt-3 text-sm leading-6 text-muted-foreground">
		Add or remove authors to compare different versions of this topic. You can compare up to
		three entries at a time.
	</p>

	{#if entries.length === 0}
		<p class="mt-4 text-sm leading-6 text-muted-foreground">
			No alternate authors have published this topic yet.
		</p>
	{:else}
		<div class="section-list mt-4">
			{#each entries as entry (entry.id)}
				<div class="section-row flex items-center gap-3">
					<a href={'/a/' + entry.encode()} class="flex min-w-0 flex-1 items-center gap-3">
						<Avatar
							{ndk}
							pubkey={entry.pubkey}
							class="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
						/>

						<div class="min-w-0 flex-1">
							<div class="truncate font-medium">
								<Name {ndk} pubkey={entry.pubkey} />
							</div>
							<div class="text-xs text-muted-foreground">
								Published {formatEventDate(entry.created_at)}
							</div>
						</div>
					</a>

					<Button
						variant={isSelected(entry.id) ? 'outline' : 'ghost'}
						size="sm"
						disabled={actionDisabled(entry.id)}
						onclick={() => onToggleEntry(entry.id)}
					>
						{actionLabel(entry.id)}
					</Button>
				</div>
			{/each}
		</div>
	{/if}
</section>
