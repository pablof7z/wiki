<script lang="ts">
	import { NDKEvent } from '@nostr-dev-kit/ndk';
	import { derived, type Readable, type Writable } from "svelte/store";
    import { Button } from '@/components/ui/button';
	import throttleStore from '@/utils/throttle-store';

    export let entries: Writable<NDKEvent[]> | undefined = undefined;
    
    let categories: Readable<string[]> | undefined;
    let renderCategories: Readable<string[]> | undefined;

    $: if (entries) {
        categories = derived(entries, ($entries) => {
            if (!$entries) return [];
            const cats = new Map<string, number>();
            for (const event of $entries) {
                const cat = event.tagValue('c');
                if (cat) {
                    const count = cats.get(cat) || 0;
                    cats.set(cat, count + 1);
                }
            }

            return Array.from(cats.entries())
                .sort((a, b) => b[1] - a[1]) // sorted by count
                .map(([cat]) => cat); // only return the category
        });

        renderCategories = throttleStore(categories, 1000);
    }
</script>

{#if renderCategories && $renderCategories && $renderCategories.length > 0}
    <h3 class="mb-2">Categories</h3>
    <div class="flex flex-row gap-4 mb-6 flex-wrap w-full justify-center items-center h-64 overflow-y-auto">

        {#each $renderCategories as cat}
            <Button class="whitespace-nowrap max-w-[10rem] truncate" variant="outline">
                <a href="/?c={cat}">{cat}</a>
            </Button>
        {/each}
    </div>
{/if}