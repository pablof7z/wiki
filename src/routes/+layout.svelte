<script lang="ts">
	import { ndk } from "$lib/ndk.svelte";
	import "../app.css";
	import { ModeWatcher } from "mode-watcher";
	import { maxBodyWidth } from "@/stores/layout";
	import AppHeader from "@/components/AppHeader.svelte";

	let connected = $state(false);
	let sessionStarted = $state(false);
	let userRelays = $derived(Array.from(ndk.$sessions?.relayList?.keys() ?? []));
	let connectedUserRelays = $state(0);

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

	// Initialize connection
	ndk.connect(5000).then(() => {
		connected = true;
	});

	// Set user when signer is available - NDK handles session automatically
	$effect(() => {
		if (connected && !sessionStarted && ndk.signer) {
			ndk.signer.user().then(() => {
				sessionStarted = true;
			});
		}
	});
</script>

<ModeWatcher />

<div class="flex min-h-screen flex-col">
	<AppHeader />

	<main class="flex-1">
		{#if !connected}
			<div class="container flex items-center justify-center py-8">
				<p class="text-muted-foreground">Connecting to relays...</p>
			</div>
		{:else if ndk.signer && !sessionStarted}
			<div class="container flex items-center justify-center py-8">
				<p class="text-muted-foreground">Preparing session...</p>
			</div>
		{:else}
			<div class="container py-6 {$maxBodyWidth}">
				<slot />
			</div>
		{/if}
	</main>
</div>