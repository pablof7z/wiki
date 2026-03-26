<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import UserName from './UserName.svelte';
	import { ndk } from '$lib/ndk.svelte';
	import { useNip05RouteId } from '$lib/utils/user-route.svelte';

	let {
		entry,
		compareHref = undefined
	}: {
		entry: NDKEvent;
		compareHref?: string;
	} = $props();

	const topic = $derived(entry.dTag ?? '');
	const authorRoute = useNip05RouteId(() => entry.pubkey);

	const taggedByEvents = ndk.$subscribe(() => ({
		filters: [
			{
				kinds: [30818 as number],
				...entry.filter()
			}
		]
	}));

	const deferedToBy = $derived.by(() => {
		return Array.from(taggedByEvents.events ?? []).filter((taggedEvent) =>
			taggedEvent.getMatchingTags('a').find((tag) => tag[3] === 'defer')
		);
	});
</script>

<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
	<a href="/{encodeURIComponent(topic)}/{authorRoute.id || entry.author.npub}" class="min-w-0 grow">
		<UserName pubkey={entry.pubkey} />
	</a>

	<div class="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
		{#if deferedToBy.length > 0}
			<span class="text-sm text-muted-foreground">
				Supported by {deferedToBy.length} defer{deferedToBy.length === 1 ? '' : 's'}
			</span>
		{/if}

		{#if compareHref}
			<a
				href={compareHref}
				class="subtle-link shrink text-xs uppercase tracking-[0.24em]"
			>
				Compare
			</a>
		{/if}

		<a href="/a/{entry.encode()}" class="subtle-link shrink text-xs uppercase tracking-[0.24em]">
			Perma-link
		</a>
	</div>
</div>
