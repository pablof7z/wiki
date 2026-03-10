<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { Button } from '@/components/ui/button';
	import { NDKNip07Signer } from '@nostr-dev-kit/ndk';
	import { Person } from 'radix-icons-svelte';

	let isLoading = $state(false);
	let error = $state('');

	async function signIn() {
		if (!ndk.$sessions || isLoading) return;

		try {
			isLoading = true;
			error = '';
			await ndk.$sessions.login(new NDKNip07Signer());
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to sign in';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex flex-col items-end gap-2">
	<Button on:click={signIn} disabled={isLoading} aria-busy={isLoading}>
		<Person class="w-4 h-4 sm:hidden" />
		<span class="hidden sm:block">{isLoading ? 'Connecting...' : 'Sign in'}</span>
	</Button>

	{#if error}
		<p class="max-w-56 text-right text-xs text-destructive" role="status" aria-live="polite">
			{error}
		</p>
	{/if}
</div>
