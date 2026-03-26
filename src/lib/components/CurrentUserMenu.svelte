<script lang="ts">
	import { goto } from '$app/navigation';
	import { ndk } from '$lib/ndk.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import { Gear } from 'radix-icons-svelte';
	import Moon from 'svelte-radix/Moon.svelte';
	import { toggleMode } from 'mode-watcher';
	import SettingsSheet from './SettingsSheet.svelte';

	let {
		class: className = '',
		avatarClass = 'h-7 w-7 rounded-full object-cover',
		contentClass = '',
		align = 'end',
		settingsOpen = $bindable(false),
		includeSettingsSheet = false
	}: {
		class?: string;
		avatarClass?: string;
		contentClass?: string;
		align?: 'start' | 'center' | 'end';
		settingsOpen?: boolean;
		includeSettingsSheet?: boolean;
	} = $props();

	let currentUser = $derived(ndk.$sessions?.currentUser);

	function navigateTo(path: string) {
		void goto(path);
	}
</script>

{#if currentUser}
	{#if includeSettingsSheet}
		<SettingsSheet bind:open={settingsOpen} showTrigger={false} />
	{/if}

	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class={cn(
				'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/6 bg-transparent transition-colors hover:bg-accent hover:text-accent-foreground',
				className
			)}
			aria-label="Open account menu"
		>
			<Avatar {ndk} pubkey={currentUser.pubkey} class={avatarClass} />
		</DropdownMenu.Trigger>

		<DropdownMenu.Content
			{align}
			class={cn(
				'w-52 rounded-2xl border-white/10 bg-[rgba(14,14,12,0.96)] p-1.5 text-foreground shadow-[0_20px_45px_rgba(0,0,0,0.35)]',
				contentClass
			)}
		>
			<DropdownMenu.Item
				class="rounded-xl px-3 py-2 text-sm"
				onSelect={() => navigateTo(`/p/${currentUser.npub}`)}
			>
				Profile
			</DropdownMenu.Item>
			<DropdownMenu.Item class="rounded-xl px-3 py-2 text-sm" onSelect={() => navigateTo('/drafts')}>
				Drafts
			</DropdownMenu.Item>
			<DropdownMenu.Separator class="bg-white/10" />
			<DropdownMenu.Item class="rounded-xl px-3 py-2 text-sm" onSelect={toggleMode}>
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
{/if}
