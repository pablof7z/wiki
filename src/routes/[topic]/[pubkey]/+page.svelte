<script lang="ts">
	import { page } from '$app/stores';
	import { DEFAULT_RELAYS } from '$lib/config/nostr-relays';
	import { ndk } from '$lib/ndk.svelte';
	import { NDKEvent, type NostrEvent } from '@nostr-dev-kit/ndk';
	import EntryCard from '$lib/components/EntryCard.svelte';
	import { getCachedPubkeyForNip05, rememberUserProfileNip05 } from '$lib/utils/nip05-cache';
	import { nip19 } from 'nostr-tools';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const topic = $derived($page.params.topic ?? '');
	const userId = $derived($page.params.pubkey ?? '');
	const seededUserPubkey = $derived(data.userPubkey);

	function hydrateEvent(rawEvent: NostrEvent | undefined): NDKEvent | undefined {
		return rawEvent ? new NDKEvent(ndk, rawEvent) : undefined;
	}

	let error = $state<string | undefined>(undefined);

	let event = $state<NDKEvent | undefined>(undefined);
	let userPubkey = $state<string | undefined>(undefined);

	const otherVersions = ndk.$subscribe(() => {
		if (!topic) return undefined;
		return {
			filters: [{ kinds: [30818 as number], '#d': [topic] }]
		};
	});

	const seededEvent = $derived(hydrateEvent(data.entryEvent));
	const displayEvent = $derived(event ?? seededEvent);

	$effect(() => {
		const identifier = userId;
		const initialPubkey = seededUserPubkey;

		userPubkey = initialPubkey;
		error = undefined;
		if (!identifier) return;

		let cancelled = false;
		const cachedPubkey = getCachedPubkeyForNip05(identifier) ?? initialPubkey;

		if (cachedPubkey) {
			userPubkey = cachedPubkey;
			return;
		}

		ndk
			.fetchUser(identifier)
			.then((user) => {
				if (cancelled) return;
				userPubkey = user?.pubkey;
				rememberUserProfileNip05(user?.pubkey, user?.profile);
			})
			.catch((e) => {
				if (cancelled) return;
				error = String(e);
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		error = undefined;
		event = undefined;

		if (!userPubkey || !topic) return;

		let cancelled = false;

		try {
			const naddr = nip19.naddrEncode({
				kind: 30818,
				pubkey: userPubkey,
				identifier: topic,
				relays: [...DEFAULT_RELAYS]
			});

			ndk
				.fetchEvent(naddr)
				.then((fetchedEvent) => {
					if (cancelled) return;

					if (!fetchedEvent) {
						if (!seededEvent) {
							event = undefined;
							error = 'Entry not found';
						}
						return;
					}

					event = fetchedEvent;
				})
				.catch((e) => {
					if (cancelled) return;
					if (!seededEvent) {
						event = undefined;
						error = String(e);
					}
				});
		} catch (e) {
			error = String(e);
		}

		return () => {
			cancelled = true;
		};
	});
</script>

<div class="page-shell-wide pt-6 pb-16">
	{#if displayEvent}
		{#key displayEvent.id}
			<EntryCard
				event={displayEvent}
				{otherVersions}
				authorProfile={data.authorProfile}
				authorLabel={data.authorLabel}
				authorRouteId={data.authorRouteId}
			/>
		{/key}
	{:else if error}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">{error}</div>
	{:else if data.preview}
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
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">Loading...</div>
	{/if}
</div>
