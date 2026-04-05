<script lang="ts">
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import { NDKEvent, type NostrEvent } from '@nostr-dev-kit/ndk';
	import EntryCard from '$lib/components/EntryCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function hydrateEvent(rawEvent: NostrEvent | undefined): NDKEvent | undefined {
		return rawEvent ? new NDKEvent(ndk, rawEvent) : undefined;
	}

	let event: NDKEvent | undefined = $state(undefined);
	let loading = $state(true);
	let loadError = $state<string | undefined>(undefined);

	const seededEvent = $derived(hydrateEvent(data.entryEvent));
	const displayEvent = $derived(event ?? seededEvent);
	const showLoadingPreview = $derived(loading && !displayEvent);

	$effect(() => {
		const currentNaddr = $page.params.naddr;
		if (!currentNaddr) return;

		loadError = undefined;
		loading = !seededEvent;

		let cancelled = false;

		ndk
			.fetchEvent(currentNaddr)
			.then((fetchedEvent) => {
				if (cancelled) return;
				if (fetchedEvent) {
					event = fetchedEvent;
					return;
				}

				if (!seededEvent) {
					event = undefined;
					loadError = 'Entry not found.';
				}
			})
			.catch((error) => {
				if (cancelled) return;
				if (!seededEvent) {
					event = undefined;
					loadError = String(error);
				}
			})
			.finally(() => {
				if (cancelled) return;
				loading = false;
			});

		return () => {
			cancelled = true;
		};
	});
</script>

<div class="w-full px-4 sm:px-6 lg:px-10 pt-6 pb-16 bg-background min-h-screen">
	{#if showLoadingPreview}
		{#if data.preview}
			<article class="surface-inset rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
				<p class="eyebrow mb-4">{data.preview.eyebrow}</p>
				<h1 class="max-w-[12ch] break-words text-[clamp(2.7rem,6vw,4.7rem)] leading-[0.92]">
					{data.preview.title}
				</h1>
				<p class="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-[1.02rem]">
					{data.preview.description}
				</p>
				{#if data.preview.authorName || data.preview.publishedLabel}
					<div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
						{#if data.preview.authorName}
							<span>{data.preview.authorName}</span>
						{/if}
						{#if data.preview.authorName && data.preview.publishedLabel}
							<span class="opacity-40">&middot;</span>
						{/if}
						{#if data.preview.publishedLabel}
							<span>{data.preview.publishedLabel}</span>
						{/if}
					</div>
				{/if}
			</article>
		{:else}
			<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">Loading entry...</div>
		{/if}
	{:else if displayEvent}
		{#key displayEvent.id}
			<EntryCard
				event={displayEvent}
				authorProfile={data.authorProfile}
				authorLabel={data.authorLabel}
				authorRouteId={data.authorRouteId}
			/>
		{/key}
	{:else}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">
			{loadError || 'Entry not found.'}
		</div>
	{/if}
</div>
