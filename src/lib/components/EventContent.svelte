<script lang="ts">
	import { goto } from '$app/navigation';
	import { ndk } from '@/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import DjotRenderer from './DjotRenderer.svelte';

    let { event }: { event: NDKEvent } = $props();

    // Get content from event
    const content = $derived(event.content || '');
</script>

<div class="prose items-start gap-4 text-zinc-600 dark:text-zinc-400 font-serif text-lg leading-9">
    <DjotRenderer {content} />
</div>
