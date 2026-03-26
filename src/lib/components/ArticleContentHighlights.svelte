<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { ndk } from '$lib/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import Button from '$lib/components/ui/button/button.svelte';
	import EventContent from '$lib/components/EventContent.svelte';
	import {
		buildDomTextIndex,
		findRangeByQuoteContext,
		getSelectionWithinRoot
	} from '$lib/highlights/dom';
	import {
		buildWikiHighlight,
		getHighlightContext,
		mergeUniqueEvents
	} from '$lib/highlights/nostr';

	type SelectionState = {
		text: string;
		context?: string;
		left: number;
		top: number;
	};

	const HIGHLIGHT_REGISTRY_NAME = 'wikifreedia-highlight';

	let { event, highlights }: { event: NDKEvent; highlights: NDKEvent[] } = $props();

	let currentUser = $derived(ndk.$currentUser);
	let contentRoot = $state<HTMLDivElement | undefined>(undefined);
	let selectionState = $state<SelectionState | undefined>(undefined);
	let publishing = $state(false);
	let publishError = $state<string | undefined>(undefined);
	let optimisticHighlights = $state<NDKEvent[]>([]);

	const visibleHighlights = $derived(mergeUniqueEvents(highlights, optimisticHighlights));

	$effect(() => {
		const syncedHighlightIds = new Set(highlights.map((highlight) => highlight.id));
		optimisticHighlights = optimisticHighlights.filter((highlight) => !syncedHighlightIds.has(highlight.id));
	});

	function clearInlineHighlights() {
		const highlightsRegistry = (globalThis as typeof globalThis & {
			CSS?: { highlights?: { delete: (name: string) => void } };
		}).CSS?.highlights;

		highlightsRegistry?.delete(HIGHLIGHT_REGISTRY_NAME);
	}

	function paintInlineHighlights() {
		if (!contentRoot) {
			clearInlineHighlights();
			return;
		}

		const HighlightCtor = (globalThis as typeof globalThis & {
			Highlight?: new (...ranges: Range[]) => unknown;
		}).Highlight;
		const highlightsRegistry = (globalThis as typeof globalThis & {
			CSS?: { highlights?: { delete: (name: string) => void; set: (name: string, value: unknown) => void } };
		}).CSS?.highlights;

		if (!HighlightCtor || !highlightsRegistry) return;

		const index = buildDomTextIndex(contentRoot);
		const ranges = visibleHighlights.flatMap((highlight) => {
			const range = findRangeByQuoteContext(index, highlight.content, getHighlightContext(highlight));
			return range ? [range] : [];
		});

		highlightsRegistry.delete(HIGHLIGHT_REGISTRY_NAME);

		if (ranges.length > 0) {
			highlightsRegistry.set(HIGHLIGHT_REGISTRY_NAME, new HighlightCtor(...ranges));
		}
	}

	function clearSelection() {
		window.getSelection()?.removeAllRanges();
		selectionState = undefined;
	}

	function updateSelectionState() {
		if (!contentRoot) {
			selectionState = undefined;
			return;
		}

		const nextSelection = getSelectionWithinRoot(contentRoot);
		if (!nextSelection) {
			selectionState = undefined;
			return;
		}

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) {
			selectionState = undefined;
			return;
		}

		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();
		if (rect.width === 0 && rect.height === 0) {
			selectionState = undefined;
			return;
		}

		selectionState = {
			...nextSelection,
			left: Math.max(12, rect.left + rect.width / 2 - 48),
			top: Math.max(12, rect.top - 44)
		};
	}

	async function publishHighlight() {
		if (!currentUser || !selectionState) return;

		publishing = true;
		publishError = undefined;

		try {
			const highlight = buildWikiHighlight(ndk, {
				article: event,
				text: selectionState.text,
				context: selectionState.context
			});
			highlight.author = currentUser;

			await highlight.publish();
			optimisticHighlights = [...optimisticHighlights, highlight];
			clearSelection();
		} catch (error) {
			console.error('Failed to publish highlight', error);
			publishError = 'Could not publish highlight.';
		} finally {
			publishing = false;
		}
	}

	onMount(() => {
		const handleSelectionChange = () => updateSelectionState();
		const handleScroll = () => {
			selectionState = undefined;
		};

		document.addEventListener('selectionchange', handleSelectionChange);
		window.addEventListener('scroll', handleScroll, true);
		window.addEventListener('resize', handleScroll);

		return () => {
			document.removeEventListener('selectionchange', handleSelectionChange);
			window.removeEventListener('scroll', handleScroll, true);
			window.removeEventListener('resize', handleScroll);
		};
	});

	onDestroy(() => {
		clearInlineHighlights();
	});

	$effect(() => {
		contentRoot;
		visibleHighlights;
		paintInlineHighlights();
	});
</script>

{#if currentUser && selectionState}
	<div
		class="fixed z-50"
		style={`left: ${selectionState.left}px; top: ${selectionState.top}px;`}
	>
		<Button
			size="sm"
			class="rounded-full px-4 shadow-[0_18px_45px_rgba(0,0,0,0.32)]"
			disabled={publishing}
			onmousedown={(domEvent) => domEvent.preventDefault()}
			onclick={publishHighlight}
		>
			{publishing ? 'Saving...' : 'Highlight'}
		</Button>
	</div>
{/if}

{#if publishError}
	<p class="mb-4 text-sm text-amber-300">{publishError}</p>
{/if}

<EventContent
	{event}
	class="article-document"
	onRootChange={(rootElement) => {
		contentRoot = rootElement;
		updateSelectionState();
	}}
/>
