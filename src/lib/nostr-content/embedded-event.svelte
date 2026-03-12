<script lang="ts">
	import { filterAndRelaySetFromBech32, type NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { ndk as defaultNdk } from '$lib/ndk.svelte';
	import type { ContentRenderer } from './content-renderer';
	import { defaultContentRenderer } from './default-renderer';

	let {
		ndk = defaultNdk,
		bech32,
		renderer = defaultContentRenderer,
		class: className = ''
	}: {
		ndk?: NDKSvelte;
		bech32: string;
		renderer?: ContentRenderer;
		class?: string;
	} = $props();

	let fetchedEvent = $state<NDKEvent | undefined>(undefined);

	$effect(() => {
		const currentNdk = ndk;
		const currentBech32 = bech32;
		let cancelled = false;
		let subscription: { stop?: () => void } | undefined;

		fetchedEvent = undefined;

		try {
			const { filter, relaySet } = filterAndRelaySetFromBech32(currentBech32, currentNdk);

			subscription = currentNdk.subscribe(
				filter,
				{
					relaySet,
					closeOnEose: true,
					wrap: true
				},
				{
					onEvent: (event) => {
						if (cancelled) {
							return;
						}

						if (
							fetchedEvent?.created_at &&
							event.created_at &&
							fetchedEvent.created_at > event.created_at
						) {
							return;
						}

						if (fetchedEvent?.id && event.id && fetchedEvent.id === event.id) {
							return;
						}

						fetchedEvent = event;
					}
				}
			);
		} catch {
			fetchedEvent = undefined;
		}

		return () => {
			cancelled = true;
			subscription?.stop?.();
		};
	});

	const handlerInfo = $derived(renderer.getKindHandler(fetchedEvent?.kind));
	const EventComponent = $derived(handlerInfo?.component ?? renderer.fallbackComponent);
	const event = $derived(
		fetchedEvent && handlerInfo?.wrapper?.from
			? handlerInfo.wrapper.from(fetchedEvent)
			: fetchedEvent
	);
</script>

{#if EventComponent && event}
	<EventComponent {ndk} {event} class={className} />
{:else}
	<span class={className}>nostr:{bech32}</span>
{/if}
