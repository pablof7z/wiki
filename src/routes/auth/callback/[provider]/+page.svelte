<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Logo from '$lib/components/Logo.svelte';
	import {
		WELCOME_SOCIAL_PREFILL_STORAGE_KEY,
		getSocialAuthProvider,
		isSocialAuthProvider,
		type WelcomeProfilePrefill
	} from '$lib/auth/oauth';

	let isLoading = $state(true);
	let error = $state('');
	let providerLabel = $state('social account');
	let handled = false;

	$effect(() => {
		if (handled || typeof window === 'undefined') return;
		handled = true;
		void completeOAuth();
	});

	async function completeOAuth() {
		const provider = $page.params.provider;
		if (typeof provider !== 'string' || !isSocialAuthProvider(provider)) {
			error = 'Unsupported login provider.';
			isLoading = false;
			return;
		}

		providerLabel = getSocialAuthProvider(provider).label;

		const providerError = $page.url.searchParams.get('error');
		if (providerError) {
			const oauthError = providerError || 'oauth_error';
			await goto(`/welcome?oauth_error=${encodeURIComponent(oauthError)}&provider=${provider}`, {
				replaceState: true
			});
			return;
		}

		const code = $page.url.searchParams.get('code');
		const state = $page.url.searchParams.get('state');
		if (!code || !state) {
			error = `Missing ${providerLabel} authorization response.`;
			isLoading = false;
			return;
		}

		try {
			const response = await fetch(`/api/oauth/${provider}/exchange`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ code, state })
			});
			const payload = (await response.json().catch(() => ({}))) as {
				error?: string;
				profile?: WelcomeProfilePrefill;
			};

			if (!response.ok || !payload.profile) {
				throw new Error(payload.error || `Failed to import your ${providerLabel} profile.`);
			}

			window.sessionStorage.setItem(
				WELCOME_SOCIAL_PREFILL_STORAGE_KEY,
				JSON.stringify(payload.profile)
			);

			await goto(`/welcome?prefill=${provider}`, {
				replaceState: true
			});
		} catch (caughtError) {
			error =
				caughtError instanceof Error
					? caughtError.message
					: `Failed to import your ${providerLabel} profile.`;
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Connecting account</title>
</svelte:head>

<div class="page-shell flex min-h-screen items-center justify-center px-6 py-12">
	<div
		class="glass-panel-soft w-full max-w-md rounded-[1.5rem] border border-white/10 p-8 text-center"
	>
		<div
			class="mx-auto mb-5 flex w-fit items-center justify-center rounded-full border border-white/10 bg-white/[0.03] p-4"
		>
			<Logo size={40} />
		</div>

		{#if isLoading}
			<h1 class="display-wordmark text-[2rem] leading-none">Connecting {providerLabel}</h1>
			<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
				Importing your profile so the welcome form can be prefilled.
			</p>
		{:else}
			<h1 class="display-wordmark text-[2rem] leading-none">Connection failed</h1>
			<p class="mt-4 text-sm leading-relaxed text-destructive">
				{error}
			</p>
			<a
				href="/welcome"
				class="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-semibold text-foreground transition-colors hover:bg-white/[0.05]"
			>
				Back to welcome
			</a>
		{/if}
	</div>
</div>
