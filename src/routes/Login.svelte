<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
	import { Person } from 'radix-icons-svelte';

	let showModal = $state(false);
	let loginMode = $state<'nip07' | 'nsec'>('nip07');
	let privateKey = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let hasExtension = $state(false);

	/**
	 * Portal action: moves the element to document.body so that
	 * `position: fixed` is relative to the viewport, not a parent
	 * with `backdrop-filter` (which creates a new containing block).
	 */
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	$effect(() => {
		if (typeof window !== 'undefined') {
			hasExtension = !!window.nostr;
		}
	});

	function openModal() {
		showModal = true;
		error = '';
	}

	function closeModal() {
		showModal = false;
		error = '';
		if (!isLoading) privateKey = '';
	}

	async function handleNip07Login() {
		if (!ndk.$sessions || isLoading) return;

		try {
			isLoading = true;
			error = '';
			await ndk.$sessions.login(new NDKNip07Signer());
			closeModal();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to login with browser extension';
		} finally {
			isLoading = false;
		}
	}

	async function handlePrivateKeyLogin() {
		if (!ndk.$sessions || isLoading || !privateKey.trim()) return;

		try {
			isLoading = true;
			error = '';
			await ndk.$sessions.login(new NDKPrivateKeySigner(privateKey.trim()));
			privateKey = '';
			closeModal();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to login with private key';
		} finally {
			isLoading = false;
		}
	}
</script>

<button
	type="button"
	class="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold tracking-[-0.02em] text-primary-foreground shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition-all duration-200 hover:-translate-y-px hover:bg-primary/92 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
	onclick={openModal}
>
	<Person class="h-4 w-4 sm:hidden" />
	<span class="hidden sm:block">Sign in</span>
</button>

{#if showModal}
	<div use:portal>
	<div
		class="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
		onclick={closeModal}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
				e.preventDefault();
				closeModal();
			}
		}}
		role="button"
		tabindex="0"
		aria-label="Close sign in dialog"
	></div>

	<div
		class="fixed left-1/2 top-1/2 z-[71] w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-white/10 bg-[rgba(10,10,10,0.96)] shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		role="presentation"
	>
		<div class="flex items-start justify-between border-b border-white/10 px-6 py-5">
			<div>
				<h2 class="m-0 text-xl font-semibold text-foreground">Connect to Nostr</h2>
				<p class="mt-1 text-sm text-muted-foreground">
					Choose a sign-in method for this device.
				</p>
			</div>
			<button
				type="button"
				class="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/6 hover:text-foreground"
				onclick={closeModal}
				aria-label="Close sign in dialog"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div class="flex flex-col gap-4 px-6 py-6">
			<div class="grid grid-cols-2 gap-2 rounded-full bg-white/[0.04] p-1">
				<button
					type="button"
					class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
						loginMode === 'nip07'
							? 'bg-white text-black shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					}`}
					onclick={() => {
						loginMode = 'nip07';
						error = '';
					}}
				>
					Extension
				</button>
				<button
					type="button"
					class={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
						loginMode === 'nsec'
							? 'bg-white text-black shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					}`}
					onclick={() => {
						loginMode = 'nsec';
						error = '';
					}}
				>
					Private key
				</button>
			</div>

			{#if loginMode === 'nip07'}
				<div class="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
					<p class="m-0 text-sm text-foreground">
						Use a NIP-07 browser extension like Alby, nos2x, or Flamingo.
					</p>
					<p class="mt-2 text-xs text-muted-foreground">
						{hasExtension
							? 'Extension detected in this browser.'
							: 'No browser extension detected. Install one or use a private key below.'}
					</p>
				</div>

				<button
					type="button"
					class="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold tracking-[-0.02em] text-primary-foreground transition-all duration-200 hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={handleNip07Login}
					disabled={isLoading}
				>
					{isLoading ? 'Connecting...' : 'Connect extension'}
				</button>
			{:else}
				<div class="rounded-[1.25rem] border border-[hsl(40_100%_50%_/_0.2)] bg-[hsl(40_100%_50%_/_0.08)] p-4">
					<p class="m-0 text-sm text-foreground">
						Only enter an `nsec1...` or 64-character hex private key if you trust this
						device.
					</p>
				</div>

				<input
					type="password"
					class="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-white/20"
					placeholder="nsec1... or hex private key"
					bind:value={privateKey}
					disabled={isLoading}
				/>

				<button
					type="button"
					class="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold tracking-[-0.02em] text-primary-foreground transition-all duration-200 hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={handlePrivateKeyLogin}
					disabled={isLoading || !privateKey.trim()}
				>
					{isLoading ? 'Signing in...' : 'Login with private key'}
				</button>
			{/if}

			{#if error}
				<div class="rounded-[1rem] border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{error}
				</div>
			{/if}
		</div>
	</div>
	</div>
{/if}
