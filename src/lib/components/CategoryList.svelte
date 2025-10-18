<script lang="ts">
	import { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { Subscription } from '@nostr-dev-kit/svelte';
    import { Button } from '@/components/ui/button';
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
    <div class="mb-10">
        <h3 class="mb-5 text-xl font-semibold">Browse by Category</h3>
        <div class="flex flex-row gap-3 flex-wrap">
            {#each categories.slice(0, 24) as cat (cat)}
                <a href="/?c={cat}">
                    <Button variant="outline" size="default" class="hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        {cat}
                    </Button>
                </a>
            {/each}
            {#if categories.length > 24}
                <span class="text-sm text-neutral-500 self-center px-2">
                    +{categories.length - 24} more categories
                </span>
            {/if}
        </div>
    </div>
{/if}