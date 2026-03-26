<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import Login from '../../routes/Login.svelte';
	import SettingsSheet from './SettingsSheet.svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import { Search, ArrowUpRight } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import Sun from 'svelte-radix/Sun.svelte';
	import Moon from 'svelte-radix/Moon.svelte';
	import { toggleMode } from 'mode-watcher';
	import Logo from './Logo.svelte';

	let currentUser = $derived(ndk.$sessions?.currentUser);
	let searchQuery = $state('');
	let isLanding = $derived(
		$page.url.pathname === '/' &&
			!$page.url.searchParams.get('q') &&
			!$page.url.searchParams.get('c')
	);
	let isCommentsPage = $derived($page.url.pathname === '/comments');

	$effect(() => {
		searchQuery = $page.url.searchParams.get('q') || '';
	});

	function handleSearchKeyup(event: KeyboardEvent) {
		if (event.key === 'Enter') search();
	}

	function search() {
		const url = new URL($page.url);
		url.pathname = '/';

		if (searchQuery.trim()) {
			url.searchParams.set('q', searchQuery.trim());
		} else {
			url.searchParams.delete('q');
		}

		url.searchParams.delete('c');
		goto(url.toString());
	}
</script>

<header class="sticky top-0 z-50 border-b border-white/8 bg-[rgba(6,6,6,0.78)] backdrop-blur-2xl">
	<div class="page-shell">
		<div class="flex min-h-[5.2rem] items-center gap-3 py-3 sm:py-4">
			<a href="/" class="mr-2 flex min-w-0 items-center gap-3">
				<Logo size={36} />
				<div class="min-w-0">
					<div class="display-wordmark text-[1.9rem] leading-none sm:text-[2.2rem]">
						Wikifreedia
					</div>
					<p class="eyebrow mt-1 hidden sm:block">Open knowledge on Nostr</p>
				</div>
			</a>

			{#if !isLanding}
				<div class="hidden flex-1 px-2 lg:flex">
					<div
						class="flex w-full max-w-2xl items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2"
					>
						<Search class="h-4 w-4 text-muted-foreground" />
						<Input
							bind:value={searchQuery}
							onkeyup={handleSearchKeyup}
							placeholder="Search living entries"
							class="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
						/>
						<button
							type="button"
							onclick={search}
							class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:-translate-y-px"
							aria-label="Search"
						>
							<ArrowUpRight class="h-4 w-4" />
						</button>
					</div>
				</div>
			{:else}
				<div class="hidden flex-1 xl:block">
					<p class="text-center text-sm text-muted-foreground">
						Parallel articles, public authorship, visible provenance.
					</p>
				</div>
			{/if}

			<nav class="ml-auto flex items-center gap-2">
				{#if !isLanding}
					<Button href="/" variant={isCommentsPage ? 'ghost' : 'secondary'} class="hidden md:inline-flex">
						Explore
					</Button>
					<Button
						href="/comments"
						variant={isCommentsPage ? 'secondary' : 'ghost'}
						class="hidden md:inline-flex"
					>
						Comments
					</Button>
				{/if}

				<Button
					onclick={toggleMode}
					variant="ghost"
					size="icon"
					class="relative rounded-full border border-white/10 bg-transparent"
				>
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
					<Button
						href="/p/{currentUser.npub}"
						variant="ghost"
						size="icon"
						class="rounded-full border border-white/10 bg-transparent"
					>
						<Avatar {ndk} pubkey={currentUser.pubkey} class="h-8 w-8 rounded-full object-cover" />
					</Button>
				{:else}
					<Login />
				{/if}
			</nav>
		</div>
	</div>
</header>
