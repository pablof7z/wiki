<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import Login from '../../routes/Login.svelte';
	import SettingsSheet from './SettingsSheet.svelte';
	import { Search, ArrowUpRight, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import Sun from 'svelte-radix/Sun.svelte';
	import Moon from 'svelte-radix/Moon.svelte';
	import { toggleMode } from 'mode-watcher';
	import Logo from './Logo.svelte';
	import CurrentUserMenu from './CurrentUserMenu.svelte';

	let currentUser = $derived(ndk.$sessions?.currentUser);
	let searchQuery = $state('');
	let scrolled = $state(false);
	let settingsOpen = $state(false);
	let isLanding = $derived($page.url.pathname === '/');
	$effect(() => {
		searchQuery = $page.url.searchParams.get('q') || '';
	});

	$effect(() => {
		function onScroll() {
			scrolled = window.scrollY > 10;
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});

	function handleSearchKeyup(event: KeyboardEvent) {
		if (event.key === 'Enter') search();
	}

	function search() {
		const url = new URL('/explore', $page.url.origin);

		if (searchQuery.trim()) {
			url.searchParams.set('q', searchQuery.trim());
		}

		goto(url.toString());
	}
</script>

<header
	class="sticky top-0 z-50 border-b transition-all duration-300 {scrolled
		? 'border-white/6 bg-[rgba(14,14,12,0.92)] backdrop-blur-xl'
		: 'border-transparent bg-transparent'}"
>
	<div class="page-shell">
		<div class="flex min-h-[3.5rem] items-center gap-3 py-2">
			<a href="/" class="mr-2 flex min-w-0 items-center gap-2.5">
				<Logo size={28} />
				<div class="min-w-0">
					<div class="display-wordmark text-[1.5rem] leading-none sm:text-[1.7rem]">
						Wikifreedia
					</div>
				</div>
			</a>

			{#if !isLanding}
				<div class="hidden flex-1 px-2 lg:flex">
					<div
						class="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.025] px-4 py-1.5"
					>
						<Search class="h-4 w-4 text-muted-foreground" />
						<Input
							bind:value={searchQuery}
							onkeyup={handleSearchKeyup}
							placeholder="Search living entries"
							class="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
						/>
						<button
							type="button"
							onclick={search}
							class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:-translate-y-px"
							aria-label="Search"
						>
							<ArrowUpRight class="h-3.5 w-3.5" />
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

			<nav class="ml-auto flex items-center gap-1.5">
				{#if !isLanding}
					<Button href="/explore" variant={$page.url.pathname === '/explore' ? 'secondary' : 'ghost'} class="hidden md:inline-flex text-sm">
						Explore
					</Button>
					<Button
						href="/comments"
						variant={$page.url.pathname === '/comments' ? 'secondary' : 'ghost'}
						class="hidden md:inline-flex text-sm"
					>
						Comments
					</Button>
				{/if}

				{#if currentUser}
					<a
						href="/new"
						class="nav-cta hidden items-center gap-1.5 sm:inline-flex"
					>
						<Plus class="h-3.5 w-3.5" />
						<span class="hidden md:inline">New entry</span>
					</a>
				{/if}

				{#if currentUser}
					<SettingsSheet bind:open={settingsOpen} showTrigger={false} />
					<CurrentUserMenu bind:settingsOpen />
				{:else}
					<Button
						onclick={toggleMode}
						variant="ghost"
						size="icon"
						class="relative rounded-full border border-white/6 bg-transparent"
					>
						<Sun
							class="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
						/>
						<Moon
							class="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
						/>
						<span class="sr-only">Toggle theme</span>
					</Button>

					<SettingsSheet bind:open={settingsOpen} />
					<Login />
				{/if}
			</nav>
		</div>
	</div>
</header>
