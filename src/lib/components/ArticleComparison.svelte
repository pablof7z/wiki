<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import * as Alert from '$lib/components/ui/alert';
	import DjotRenderer from '$lib/components/DjotRenderer.svelte';
	import Name from '$lib/components/Name.svelte';
	import { ndk } from '$lib/ndk.svelte';
	import {
		formatEventDate,
		type EventComparisonSuccessResponse
	} from '$lib/utils/article-comparison';

	let {
		topic,
		entries = [],
		entriesLoaded = true,
		availableEntryCount = 0,
		comparisonResult = undefined,
		comparisonError = undefined,
		isComparing = false,
		comparisonContent = ''
	}: {
		topic: string;
		entries?: NDKEvent[];
		entriesLoaded?: boolean;
		availableEntryCount?: number;
		comparisonResult?: EventComparisonSuccessResponse;
		comparisonError?: string;
		isComparing?: boolean;
		comparisonContent?: string;
	} = $props();
</script>

<div class="mt-7">
	<p class="eyebrow">Comparison</p>
	<h1 class="mt-3 max-w-[14ch] break-words text-[clamp(3rem,6.4vw,4.95rem)] leading-[0.92]">
		{topic}
	</h1>

	<div class="mt-7 flex flex-col gap-5">
		{#if entries.length > 0}
			<div class="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
				{#each entries as entry (entry.id)}
					<a href={'/a/' + entry.encode()} class="flex items-center gap-3">
						<Avatar
							{ndk}
							pubkey={entry.pubkey}
							class="h-11 w-11 rounded-full object-cover ring-1 ring-white/10"
						/>
						<div>
							<div class="font-medium text-foreground">
								<Name {ndk} pubkey={entry.pubkey} />
							</div>
							<div class="text-xs text-muted-foreground">
								Published {formatEventDate(entry.created_at)}
							</div>
						</div>
					</a>
				{/each}

				{#if comparisonResult}
					<div class="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
						{comparisonResult.cached ? 'Cached comparison' : 'Fresh comparison'}
					</div>
				{/if}
			</div>

			<p class="max-w-[72ch] text-sm leading-7 text-muted-foreground">
				This comparison tracks where the selected authors overlap, diverge, and leave things
				unsaid.
			</p>
		{/if}
	</div>
</div>

<div class="mt-10">
	{#if !entriesLoaded}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">
			Loading available versions...
		</div>
	{:else if availableEntryCount === 0}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">
			No entries were found for this topic.
		</div>
	{:else if entries.length < 2}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">
			Select at least two entries to generate a comparison.
		</div>
	{:else if isComparing}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">
			Generating comparison...
		</div>
	{:else if comparisonError}
		<Alert.Root variant="destructive" class="rounded-2xl px-6 py-5">
			<Alert.Title>Comparison failed</Alert.Title>
			<Alert.Description>{comparisonError}</Alert.Description>
		</Alert.Root>
	{:else if comparisonContent}
		<DjotRenderer content={comparisonContent} class="article-document" />
	{:else}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">
			Choose the versions you want to compare.
		</div>
	{/if}
</div>
