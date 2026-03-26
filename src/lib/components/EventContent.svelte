<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { ContentRenderer } from '$lib/nostr-content/content-renderer';
	import DjotRenderer from './DjotRenderer.svelte';

	let {
		event,
		renderer,
		class: className = '',
		onRootChange = undefined
	}: {
		event: NDKEvent;
		renderer?: ContentRenderer;
		class?: string;
		onRootChange?: (rootElement: HTMLDivElement | undefined) => void;
	} = $props();

	const content = $derived(event.content || '');
</script>

<div class="font-sans text-foreground/86 {className}">
	<DjotRenderer {content} {renderer} {onRootChange} />
</div>
