<script lang="ts">
	import { page } from '$app/stores';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import HighlightComments from '$lib/components/HighlightComments.svelte';
	import { ndk } from '$lib/ndk.svelte';
	import { NDKKind, type NDKEvent } from '@nostr-dev-kit/ndk';

	let event: NDKEvent | undefined = $state(undefined);
	let loading = $state(true);
	let loadError = $state<string | undefined>(undefined);

	const pageTitle = $derived.by(() => {
		if (!event) return 'Highlight discussion • Wikifreedia';
		const excerpt = event.content.replace(/\s+/g, ' ').trim();
		const label = excerpt.length > 72 ? `${excerpt.slice(0, 72)}...` : excerpt;
		return `${label || 'Highlight discussion'} • Wikifreedia`;
	});

	const pageDescription = $derived.by(() => {
		if (!event) return 'Threaded discussion around a highlighted passage on Wikifreedia.';
		const excerpt = event.content.replace(/\s+/g, ' ').trim();
		const label = excerpt.length > 150 ? `${excerpt.slice(0, 150)}...` : excerpt;
		return label || 'Threaded discussion around a highlighted passage on Wikifreedia.';
	});

	$effect(() => {
		const currentEvent = $page.params.event;
		if (!currentEvent) return;

		loading = true;
		loadError = undefined;
		event = undefined;

		ndk
			.fetchEvent(currentEvent)
			.then((fetchedEvent) => {
				if (!fetchedEvent) {
					loadError = 'Highlight not found.';
					return;
				}

				if (fetchedEvent.kind !== NDKKind.Highlight) {
					loadError = 'This discussion page only supports highlight events.';
					return;
				}

				event = fetchedEvent;
			})
			.catch((error) => {
				loadError = String(error);
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
</svelte:head>

<PageContainer class="py-6">
	{#if loading}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">
			Loading discussion...
		</div>
	{:else if event}
		{#key event.id}
			<HighlightComments {event} />
		{/key}
	{:else}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">
			{loadError || 'Highlight not found.'}
		</div>
	{/if}
</PageContainer>
