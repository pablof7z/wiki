<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import DjotRenderer from './DjotRenderer.svelte';

	let { event, class: className = '' }: { event: NDKEvent; class?: string } = $props();

	const content = $derived(event.content || '');
</script>

<div class="font-sans text-foreground/86 {className}">
	<DjotRenderer {content} />
</div>
