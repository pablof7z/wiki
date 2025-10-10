<script lang="ts">
	import { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { Subscription } from '@nostr-dev-kit/svelte';
    import { Button } from '@/components/ui/button';

    let { entries = undefined }: { entries?: Subscription<NDKEvent> } = $props();

    function computeCategories(events: NDKEvent[]): string[] {
        const cats = new Map();

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
    <h3 class="mb-2">Categories</h3>
    <div class="flex flex-row gap-4 mb-6 flex-wrap w-full justify-center items-center h-64 overflow-y-auto">
        {#each categories as cat}
            <Button class="whitespace-nowrap max-w-[10rem] truncate" variant="outline">
                <a href="/?c={cat}">{cat}</a>
            </Button>
        {/each}
    </div>
{/if}