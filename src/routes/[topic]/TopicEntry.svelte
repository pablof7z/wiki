<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { NDKEvent } from '@nostr-dev-kit/ndk';
	import EventContent from '$lib/components/EventContent.svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import Name from '$lib/components/Name.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import { useNip05RouteId } from '$lib/utils/user-route.svelte';

	let { topic, entry }: { topic: string; entry: NDKEvent } = $props();
	const authorRoute = useNip05RouteId(() => entry.pubkey);

	const wordCount = $derived(entry.content.split(' ').length);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex flex-row items-center gap-2">
			<Avatar {ndk} pubkey={entry.pubkey} class="w-8 h-8 rounded-full object-cover" />
			<Name {ndk} pubkey={entry.pubkey} />
		</Card.Title>
		<Card.Description>
			{wordCount} words
		</Card.Description>
	</Card.Header>
	<Card.Content class="max-h-80 overflow-hidden">
		<EventContent event={entry} />
	</Card.Content>

	<Card.Footer class="gap-1 justify-between">
		<Button href="/{encodeURIComponent(topic)}/{authorRoute.id || entry.author.npub}">View</Button>

		<Button href="/a/{entry.encode()}/edit">Edit</Button>

		<Button onclick={() => entry.react('+')}>Like</Button>
	</Card.Footer>
</Card.Root>
