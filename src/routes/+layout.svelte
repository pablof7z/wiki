<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { page } from '$app/stores';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import { wot, wotLoading, wotDepth } from '$lib/stores/wot';
	import { NDKWoT } from '@nostr-dev-kit/wot';
	import { get } from 'svelte/store';

	let { children } = $props();

	let sessionStarted = $state(false);
	let userRelays = $derived(Array.from(ndk.$sessions?.relayList?.keys() ?? []));
	let connectedUserRelays = $state(0);
	let isLanding = $derived(
		$page.url.pathname === '/' && !$page.url.searchParams.get('q') && !$page.url.searchParams.get('c')
	);
	let showHeader = $derived(!isLanding);

	// Toggle the "landing" class on <body> so CSS pseudo-element backgrounds
	// (stars / grid) only render on the landing page.
	$effect(() => {
		document.body.classList.toggle('landing', isLanding);
	});

	// Build WoT graph when user session is ready
	$effect(() => {
		const activePubkey = ndk.$sessions?.currentUser?.pubkey;
		if (activePubkey && sessionStarted && !get(wot)) {
			buildWoT(activePubkey);
		}
	});

	async function buildWoT(pubkey: string) {
		wotLoading.set(true);
		try {
			const wotInstance = new NDKWoT(ndk, pubkey);
			await wotInstance.load({
				depth: get(wotDepth),
				maxFollows: 1000,
				timeout: 30000
			});
			wot.set(wotInstance);
			console.log(`WoT graph built with ${wotInstance.size} users`);
		} catch (error) {
			console.error('Failed to build WoT graph:', error);
		} finally {
			wotLoading.set(false);
		}
	}

	// Connect user relays to NDK pool
	$effect(() => {
		if (userRelays.length > 0 && connectedUserRelays !== userRelays.length) {
			connectedUserRelays = userRelays.length;

			for (const relay of userRelays) {
				if (!ndk.pool.relays.has(relay)) {
					ndk.addExplicitRelay(relay);
				}
			}
		}
	});

	// Initialize the signer session in the background once it is available.
	$effect(() => {
		if (!sessionStarted && ndk.signer) {
			ndk.signer
				.user()
				.then(() => {
					sessionStarted = true;
				})
				.catch((error) => {
					console.error('Failed to prepare signer session:', error);
				});
		}
	});
</script>

<ModeWatcher />

<div class="flex min-h-screen flex-col">
	{#if showHeader}
		<AppHeader />
	{/if}

	<main class="flex-1">
		{@render children()}
	</main>
</div>
