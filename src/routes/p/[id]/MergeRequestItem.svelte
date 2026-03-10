<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import Name from '$lib/components/Name.svelte';
	import RequestAccepted from '../../pr/[naddr]/[pr]/RequestAccepted.svelte';
	import { Button } from '$lib/components/ui/button';
	import { nip19 } from 'nostr-tools';

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

<div class="space-y-3">
	<a href="/p/{mergeRequest.pubkey}" class="font-bold">
		<Name {ndk} pubkey={mergeRequest.pubkey} />
	</a>
	sent a merge request of <Name {ndk} pubkey={mergeTarget.pubkey} />'s
	<a href="/{mergeTarget.topic}/{mergeTarget.pubkey}"><b>{mergeTarget.topic}</b></a>

	<Button class="link" href={'/pr/' + naddr + '/' + mergeRequest.id}>View</Button>

	{#if mergeRequest.content.length > 0}
		<blockquote class="text-xl p-6">{mergeRequest.content}</blockquote>
	{/if}

	{#each responses as response, i (response.id)}
		{#if response.kind === 819}
			<RequestAccepted event={response} />
		{/if}
	{/each}
</div>
