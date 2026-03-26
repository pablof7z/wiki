<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Login from '../../routes/Login.svelte';
	import SettingsSheet from './SettingsSheet.svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import { Search, ArrowUpRight, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Gear } from 'radix-icons-svelte';
	import Sun from 'svelte-radix/Sun.svelte';
	import Moon from 'svelte-radix/Moon.svelte';
	import { toggleMode } from 'mode-watcher';
	import { useNip05RouteId } from '$lib/utils/user-route.svelte';

	let currentUser = $derived(ndk.$sessions?.currentUser);
	const currentUserRoute = useNip05RouteId(() => currentUser?.pubkey ?? '');
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

	function navigateTo(path: string) {
		void goto(path);
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

				{#if currentUser}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/6 bg-transparent transition-colors hover:bg-accent hover:text-accent-foreground"
							aria-label="Open account menu"
						>
							<Avatar {ndk} pubkey={currentUser.pubkey} class="h-7 w-7 rounded-full object-cover" />
						</DropdownMenu.Trigger>

						<DropdownMenu.Content
							align="end"
							class="w-52 rounded-2xl border-white/10 bg-[rgba(14,14,12,0.96)] p-1.5 text-foreground shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
						>
							<DropdownMenu.Item
								class="rounded-xl px-3 py-2 text-sm"
								onSelect={() => navigateTo(`/p/${currentUserRoute.id || currentUser.npub}`)}
							>
								Profile
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="rounded-xl px-3 py-2 text-sm"
								onSelect={() => navigateTo('/drafts')}
							>
								Drafts
							</DropdownMenu.Item>
							<DropdownMenu.Separator class="bg-white/10" />
							<DropdownMenu.Item
								class="rounded-xl px-3 py-2 text-sm"
								onSelect={toggleMode}
							>
								<Moon class="h-4 w-4" />
								Toggle theme
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class="rounded-xl px-3 py-2 text-sm"
								onSelect={() => {
									settingsOpen = true;
								}}
							>
								<Gear class="h-4 w-4" />
								Settings
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<Login />
				{/if}
			</nav>
		</div>
	</div>
</header>
