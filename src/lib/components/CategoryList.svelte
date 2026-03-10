<script lang="ts">
	import { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import { Button } from '$lib/components/ui/button';
	import { SvelteMap } from 'svelte/reactivity';

	let { entries = undefined }: { entries?: Subscription<NDKEvent> } = $props();

	function computeCategories(events: NDKEvent[]): string[] {
		const cats = new SvelteMap<string, number>();

		for (const event of events) {
			const cat = event.tagValue('c');
			if (cat) {
				const count = cats.get(cat) || 0;
				cats.set(cat, count + 1);
			}
		}

		return Array.from(cats.entries())
			.sort((a: [string, number], b: [string, number]) => b[1] - a[1])
			.map(([cat]) => cat);
	}

	const categories = $derived(entries?.events ? computeCategories(entries.events) : []);
</script>

{#if categories && categories.length > 0}
	<section class="glass-panel rounded-[2.25rem] p-5 sm:p-7">
		<p class="eyebrow mb-3">Explore the map</p>
		<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h3 class="text-xl">Browse by category</h3>
				<p class="mt-2 text-sm text-muted-foreground">
					Follow clusters of related knowledge and jump directly into active topic areas.
				</p>
			</div>

			{#if categories.length > 24}
				<span class="text-sm text-muted-foreground">
					+{categories.length - 24} more categories
				</span>
			{/if}
		</div>

		<div class="mt-6 flex flex-wrap gap-3">
			{#each categories.slice(0, 24) as cat (cat)}
				<a href="/?c={cat}">
					<Button
						variant="outline"
						size="default"
						class="border-white/10 bg-white/[0.04] text-foreground hover:bg-white/[0.08]"
					>
						{cat}
					</Button>
				</a>
			{/each}
		</div>
	</section>
{/if}
