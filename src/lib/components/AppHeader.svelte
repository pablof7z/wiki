<script lang="ts">
	import { ndk } from "$lib/ndk.svelte";
	import Login from "@/routes/Login.svelte";
	import { Avatar } from "@nostr-dev-kit/svelte";
	import { Button } from "@/components/ui/button";
	import { Plus } from "radix-icons-svelte";
	import Sun from "svelte-radix/Sun.svelte";
	import Moon from "svelte-radix/Moon.svelte";
	import { toggleMode } from "mode-watcher";
	import { NDKEvent, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { goto } from "$app/navigation";
	import SettingsSheet from "./SettingsSheet.svelte";

	let currentUser = $derived(ndk.$sessions?.currentUser);

	async function newEntry() {
		const title = prompt('Name of the concept (e.g. second world war)');
		if (!title) return;
		const dTag = title?.toLowerCase().trim().replace(/ /g, '-')!;
		const event = new NDKEvent(ndk, {
			kind: 30818,
			tags: [["d", dTag]]
		} as NostrEvent);
		await event.publish();
		goto(`/a/${event.encode()}/edit`);
	}
</script>

<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="container flex h-16 items-center justify-between">
		<div class="flex items-center gap-6">
			<a href="/" class="flex items-center gap-2">
				<h2 class="text-xl font-bold text-orange-600">Wikifreedia</h2>
				<a href="/wikifreedia/npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft"
					class="text-xs text-muted-foreground hover:text-foreground transition-colors">
					v0.0.8
				</a>
			</a>
		</div>

		<nav class="flex items-center gap-2">
			<Button href="/" variant="ghost" class="hidden sm:flex">
				All Entries
			</Button>

			<Button on:click={newEntry} variant="default" size="default">
				<Plus class="h-4 w-4 sm:mr-2" />
				<span class="hidden sm:inline">New Entry</span>
			</Button>

			<Button on:click={toggleMode} variant="ghost" size="icon" class="hidden sm:flex">
				<Sun
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
				/>
				<Moon
					class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>

			<SettingsSheet />

			{#if currentUser}
				<Button href="/p/{currentUser.npub}" variant="ghost" size="icon" class="rounded-full">
					<Avatar ndk={ndk} pubkey={currentUser.pubkey} class="h-8 w-8 rounded-full object-cover" />
				</Button>
			{:else}
				<Login />
			{/if}
		</nav>
	</div>
</header>
