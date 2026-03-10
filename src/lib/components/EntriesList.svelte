<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { Button } from '$lib/components/ui/button';
	import { wotEnabled, isInWoT } from '$lib/stores/wot';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';

	const TOPICS_PER_PAGE = 15;

	type TopicGroup = {
		topic: string;
		entries: NDKEvent[];
		authorCount: number;
		relayUrls: string[];
		latestCreatedAt: number;
	};

	let {
		entries,
		entriesVisible = $bindable(0),
		entriesNotVisible = $bindable(0),
		paginationKey = ''
	}: {
		entries: Subscription<NDKEvent>;
		entriesVisible?: number;
		entriesNotVisible?: number;
		paginationKey?: string;
	} = $props();

	let currentPage = $state(1);

	const topicGroups = $derived.by(() => {
		const byDtag = new Map<string, NDKEvent[]>();
		const events = entries.events;

		if (!events) return [] as TopicGroup[];

		events.forEach((entry) => {
			const dTag = entry.dTag;
			const pubkey = entry.pubkey;
			const deferred = entry.getMatchingTags('a').some((t) => t[3] === 'defer');

			if (!dTag) return;
			if (deferred) return;

			// if we are filtering by wot, we need to check if the pubkey is in the wot
			if ($wotEnabled && !isInWoT(pubkey)) {
				return;
			}

			if (!byDtag.has(dTag)) byDtag.set(dTag, []);

			byDtag.get(dTag)?.push(entry);
		});

		return Array.from(byDtag.entries())
			.map(([topic, topicEntries]) => {
				const sortedEntries = [...topicEntries].sort(
					(a, b) => (b.created_at ?? 0) - (a.created_at ?? 0)
				);

				return {
					topic,
					entries: sortedEntries,
					authorCount: new Set(sortedEntries.map((entry) => entry.pubkey)).size,
					relayUrls: Array.from(
						new Set(sortedEntries.map((entry) => entry.relay?.url).filter((relay) => relay))
					),
					latestCreatedAt: sortedEntries[0]?.created_at ?? 0
				};
			})
			.sort((a, b) => {
				if (b.latestCreatedAt !== a.latestCreatedAt) {
					return b.latestCreatedAt - a.latestCreatedAt;
				}

				if (b.entries.length !== a.entries.length) {
					return b.entries.length - a.entries.length;
				}

				return a.topic.localeCompare(b.topic);
			});
	});

	const totalPages = $derived(Math.max(1, Math.ceil(topicGroups.length / TOPICS_PER_PAGE)));
	const paginatedTopicGroups = $derived(
		topicGroups.slice((currentPage - 1) * TOPICS_PER_PAGE, currentPage * TOPICS_PER_PAGE)
	);
	const pageStart = $derived(
		topicGroups.length === 0 ? 0 : (currentPage - 1) * TOPICS_PER_PAGE + 1
	);
	const pageEnd = $derived(Math.min(currentPage * TOPICS_PER_PAGE, topicGroups.length));

	$effect(() => {
		paginationKey;
		currentPage = 1;
	});

	$effect(() => {
		if (currentPage > totalPages) {
			currentPage = totalPages;
		}
	});

	$effect(() => {
		let visible = 0;
		let notVisible = 0;
		const events = entries.events;

		if (events) {
			events.forEach((entry) => {
				const dTag = entry.dTag;
				const pubkey = entry.pubkey;
				const deferred = entry.getMatchingTags('a').some((t) => t[3] === 'defer');

				if (!dTag || deferred) return;

				if ($wotEnabled && !isInWoT(pubkey)) {
					notVisible++;
				} else {
					visible++;
				}
			});
		}

		entriesVisible = visible;
		entriesNotVisible = notVisible;
	});
</script>

{#if topicGroups.length === 0}
	<div class="glass-panel-soft rounded-[1.5rem] px-5 py-6 text-sm text-muted-foreground">
		No entries match this view yet.
	</div>
{:else}
	<div class="flex flex-col gap-5">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {pageStart}-{pageEnd} of {topicGroups.length} topics
			</p>

			{#if totalPages > 1}
				<p class="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
			{/if}
		</div>

		<div class="flex flex-col gap-3">
			{#each paginatedTopicGroups as topicGroup (topicGroup.topic)}
				<div
					class="glass-panel-soft group rounded-[1.75rem] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/12 hover:bg-white/[0.06] sm:p-5"
				>
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<a href="/{encodeURIComponent(topicGroup.topic)}" class="min-w-0 flex-1">
							<div class="eyebrow mb-2">Topic</div>
							<div class="display-wordmark text-[1.8rem] leading-none sm:text-[2rem]">
								{topicGroup.topic}
							</div>
							<div class="mt-3 truncate text-sm text-muted-foreground">
								{topicGroup.relayUrls.join(', ')}
							</div>
						</a>

						<div class="flex items-center justify-between gap-4 sm:justify-end">
							<div class="hidden text-right text-sm text-muted-foreground md:block">
								<div>
									{topicGroup.entries.length}
									{topicGroup.entries.length === 1 ? ' version' : ' versions'}
								</div>
								<div class="opacity-70">
									{topicGroup.authorCount}
									{topicGroup.authorCount === 1 ? ' author' : ' authors'}
								</div>
							</div>

							<div class="flex max-w-xs flex-row flex-wrap justify-end gap-1">
								{#each topicGroup.entries.slice(0, 10) as entry (entry.id)}
									<Avatar
										{ndk}
										pubkey={entry.pubkey}
										class="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
									/>
								{/each}
								{#if topicGroup.entries.length > 10}
									<div
										class="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-medium"
									>
										+{topicGroup.entries.length - 10}
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		{#if totalPages > 1}
			<div
				class="flex flex-col gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between"
			>
				<p class="text-sm text-muted-foreground">
					Use the pager to move through older topics without rendering the full feed at once.
				</p>

				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === 1}
						onclick={() => (currentPage = Math.max(1, currentPage - 1))}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === totalPages}
						onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
					>
						Next
					</Button>
				</div>
			</div>
		{/if}
	</div>
{/if}
