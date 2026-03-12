<script lang="ts">
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import EntryCard from '$lib/components/EntryCard.svelte';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import { nip19 } from 'nostr-tools';

	const topic = $derived($page.params.topic ?? '');
	const userId = $derived($page.params.pubkey ?? '');

	let error = $state<string | undefined>(undefined);

	let event = $state<NDKEvent | undefined>(undefined);
	let otherVersions = $state<Subscription<NDKEvent> | undefined>(undefined);
	let userPubkey = $state<string | undefined>(undefined);

	$effect(() => {
		const identifier = userId;

		userPubkey = undefined;
		if (!identifier) return;

		let cancelled = false;

		ndk
			.fetchUser(identifier)
			.then((user) => {
				if (cancelled) return;
				userPubkey = user?.pubkey;
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
		event = undefined;
		otherVersions = undefined;
		error = undefined;

		if (!userPubkey || !topic) return;

		try {
			const naddr = nip19.naddrEncode({
				kind: 30818,
				pubkey: userPubkey,
				identifier: topic
			});

			ndk
				.fetchEvent(naddr)
				.then((fetchedEvent) => {
					if (!fetchedEvent) {
						error = 'Entry not found';
						return;
					}

					event = fetchedEvent;

					otherVersions = ndk.$subscribe(() => ({
						filters: [
							{
								kinds: [30818 as number],
								'#d': [topic]
							}
						]
					}));
				})
				.catch((e) => {
					error = String(e);
				});
		} catch (e) {
			error = String(e);
		}
	});
</script>

{#if event}
	{#key event.id}
		<EntryCard {event} {otherVersions} />
	{/key}
{:else if error}
	<div>{error}</div>
{:else}
	<div>Loading...</div>
{/if}
