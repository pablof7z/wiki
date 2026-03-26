<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import HighlightDiscussionSummary from '$lib/components/HighlightDiscussionSummary.svelte';
	import Name from '$lib/components/Name.svelte';
	import { extractMarkupTitle } from '$lib/utils/markup';
	import { groupHighlightsBySource } from '$lib/highlights/nostr';
	import {
		buildFallbackHighlightSourceMeta,
		type HighlightSourceMeta,
		resolveHighlightSourceMeta
	} from '$lib/highlights/source';

	let { event, highlights }: { event: NDKEvent; highlights: NDKEvent[] } = $props();

	let sourceMeta = $state<Record<string, HighlightSourceMeta>>({});

	const groupedHighlights = $derived(groupHighlightsBySource(highlights, event));

	$effect(() => {
		let cancelled = false;

		for (const group of groupedHighlights) {
			if (group.current || sourceMeta[group.key]) continue;

			const fallbackMeta = buildFallbackHighlightSourceMeta({
				key: group.key,
				sourceEventId: group.sourceEventId,
				sourceAddress: group.sourceAddress,
				sourceUrl: group.sourceUrl
			});
			sourceMeta = {
				...sourceMeta,
				[group.key]: fallbackMeta
			};

			void resolveHighlightSourceMeta(ndk, {
				key: group.key,
				sourceEventId: group.sourceEventId,
				sourceAddress: group.sourceAddress,
				sourceUrl: group.sourceUrl
			})
				.then((resolved) => {
					if (cancelled || !resolved) return;

					sourceMeta = {
						...sourceMeta,
						[group.key]: resolved
					};
				})
				.catch(() => {
					if (cancelled) return;

					sourceMeta = {
						...sourceMeta,
						[group.key]: {
							...fallbackMeta,
							loading: false
						}
					};
				});
		}

		return () => {
			cancelled = true;
		};
	});

	function formatDate(createdAt?: number) {
		if (!createdAt) return 'Unknown date';
		return new Date(createdAt * 1000).toLocaleString();
	}

	function displayQuote(content: string) {
		return content.trim() || content;
	}
</script>

<section class="space-y-8">
	<div>
		<h3 class="text-lg">Highlights</h3>
		<p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
			Passages readers have marked in this entry and other versions of the same topic.
		</p>
	</div>

	{#if groupedHighlights.length === 0}
		<p class="text-sm text-muted-foreground">No highlights yet.</p>
	{:else}
		<div class="space-y-8">
			{#each groupedHighlights as group (group.key)}
				{@const meta = group.current ? undefined : sourceMeta[group.key]}
				<section class="space-y-4">
					<div class="flex flex-col gap-2 border-b border-white/8 pb-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p class="eyebrow mb-2">{group.current ? 'Current entry' : 'Same-topic source'}</p>
							{#if group.current}
								<h4 class="text-xl">{event.tagValue('title') || extractMarkupTitle(event.content) || event.dTag}</h4>
							{:else if meta?.href}
								<a href={meta.href} class="subtle-link text-xl text-foreground">
									{meta.title}
								</a>
							{:else}
								<h4 class="text-xl text-foreground">{meta?.title || 'Unknown source'}</h4>
							{/if}
						</div>

						<div class="text-sm text-muted-foreground">
							{group.highlights.length} {group.highlights.length === 1 ? 'highlight' : 'highlights'}
						</div>
					</div>

					<div class="section-list">
						{#each group.highlights as highlight (highlight.id)}
							<article class="section-row">
								<div class="flex items-start gap-3">
									<Avatar
										{ndk}
										pubkey={highlight.pubkey}
										class="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
									/>

									<div class="min-w-0 flex-1">
										<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
											<div class="font-medium text-foreground">
												<Name {ndk} pubkey={highlight.pubkey} />
											</div>
											<div class="text-xs text-muted-foreground">
												{formatDate(highlight.created_at)}
											</div>
										</div>

										<blockquote class="mt-4 border-l border-[rgba(252,208,87,0.45)] pl-4 text-base leading-7 text-foreground">
											“{displayQuote(highlight.content)}”
										</blockquote>

										{#if !group.current}
											<div class="mt-4 text-sm text-muted-foreground">
												{#if meta?.href}
													Source:
													<a href={meta.href} class="subtle-link text-foreground">
														{meta.title}
													</a>
												{:else}
													Source: {meta?.title || 'Unknown source'}
												{/if}
												{#if meta?.authorPubkey}
													<span class="mx-2 opacity-40">&middot;</span>
													<Name {ndk} pubkey={meta.authorPubkey} class="inline text-foreground" />
												{/if}
											</div>
										{/if}

										<HighlightDiscussionSummary event={highlight} />
									</div>
								</div>
							</article>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}
</section>
