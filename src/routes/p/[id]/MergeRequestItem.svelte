<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import Name from '$lib/components/Name.svelte';
	import RequestAccepted from '../../pr/[naddr]/[pr]/RequestAccepted.svelte';
	import { Button } from '$lib/components/ui/button';
	import { nip19 } from 'nostr-tools';
	import { useNip05RouteId } from '$lib/utils/user-route.svelte';

	let { mergeRequest }: { mergeRequest: NDKEvent } = $props();

	const mergeTarget = $derived.by(() => {
		const aTag = mergeRequest.tagValue('a') ?? '';
		const [kind = '30818', pubkey = '', topic = mergeRequest.dTag || 'unknown'] = aTag.split(':');

		return {
			pubkey,
			kind: Number.parseInt(kind, 10) || 30818,
			topic
		};
	});

	const mergeAuthorRoute = useNip05RouteId(() => mergeRequest.pubkey);
	const mergeTargetRoute = useNip05RouteId(() => mergeTarget.pubkey);

	const naddr = $derived(
		nip19.naddrEncode({
			pubkey: mergeTarget.pubkey,
			kind: mergeTarget.kind,
			identifier: mergeTarget.topic
		})
	);

	const responsesSub = ndk.$subscribe(() => ({
		filters: [
			{
				kinds: [7, 819 as number],
				...mergeRequest.filter()
			}
		]
	}));

	const responses = $derived(Array.from(responsesSub.events ?? []));
</script>

<div class="space-y-3 text-sm">
	<p class="leading-7 text-muted-foreground">
		<a href="/p/{mergeAuthorRoute.id || mergeRequest.pubkey}" class="font-semibold text-foreground">
			<Name {ndk} pubkey={mergeRequest.pubkey} />
		</a>
		sent a merge request for
		<a href="/{mergeTarget.topic}/{mergeTargetRoute.id || mergeTarget.pubkey}" class="font-semibold text-foreground">
			{mergeTarget.topic}
		</a>
		by
		<span class="text-foreground"><Name {ndk} pubkey={mergeTarget.pubkey} /></span>.
	</p>

	<div class="flex items-center gap-3">
		<Button class="px-0 text-sm" variant="link" href={'/pr/' + naddr + '/' + mergeRequest.id}>
			View request
		</Button>
	</div>

	{#if mergeRequest.content.length > 0}
		<blockquote class="p-4 text-sm leading-7 text-muted-foreground">
			{mergeRequest.content}
		</blockquote>
	{/if}

	{#each responses as response, i (response.id)}
		{#if response.kind === 819}
			<RequestAccepted event={response} />
		{/if}
	{/each}
</div>
