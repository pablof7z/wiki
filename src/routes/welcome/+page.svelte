<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		BLOSSOM_PROFILE_UPLOAD_SERVER,
		buildSuggestedPictureOptions,
		type SuggestedPictureOption
	} from '$lib/auth/profile-pictures';
	import {
		WELCOME_SOCIAL_PREFILL_STORAGE_KEY,
		getSocialAuthProvider,
		isSocialAuthProvider,
		socialAuthProviders,
		type WelcomeProfilePrefill
	} from '$lib/auth/oauth';
	import { ndk } from '$lib/ndk.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { Plus, Shuffle } from '@lucide/svelte';
	import { NDKBlossom, defaultSHA256Calculator } from '@nostr-dev-kit/blossom';
	import { NDKEvent, NDKPrivateKeySigner, type NostrEvent } from '@nostr-dev-kit/ndk';

	type PictureSelection = {
		kind: 'social' | 'suggested' | 'upload';
		label: string;
		description: string;
		href?: string;
	};

	let signer = $state<NDKPrivateKeySigner | null>(null);
	let pictureUploadInput = $state<HTMLInputElement | null>(null);

	// Profile fields
	let username = $state('');
	let displayName = $state('');
	let about = $state('');
	let picture = $state('');

	// UI state
	let isLoading = $state(false);
	let error = $state('');
	let socialAuthLoading = $state<string | null>(null);
	let socialAuthError = $state('');
	let importedProfile = $state<WelcomeProfilePrefill | null>(null);
	let usernameStatus = $state<'idle' | 'checking' | 'available' | 'taken' | 'error'>('idle');
	let usernameCheckTimeout: ReturnType<typeof setTimeout> | undefined;
	let handledPrefillSearch = false;
	let suggestedPicturesInitialized = false;
	let suggestedPictures = $state<SuggestedPictureOption[]>([]);
	let pictureSelection = $state<PictureSelection | null>(null);
	let isPictureUploading = $state(false);
	let pictureUploadProgress = $state(0);
	let pictureUploadError = $state('');

	// Generate key pair immediately on mount
	$effect(() => {
		if (!signer) {
			signer = NDKPrivateKeySigner.generate();
		}
	});

	// Debounced username availability check
	$effect(() => {
		const value = username.trim().toLowerCase();
		clearTimeout(usernameCheckTimeout);

		if (!value) {
			usernameStatus = 'idle';
			return;
		}

		if (!/^[a-z0-9_-]+$/.test(value)) {
			usernameStatus = 'idle';
			return;
		}

		usernameStatus = 'checking';
		usernameCheckTimeout = setTimeout(() => {
			checkUsername(value);
		}, 400);
	});

	$effect(() => {
		if (suggestedPicturesInitialized || typeof window === 'undefined') return;
		suggestedPicturesInitialized = true;
		refreshSuggestedPictures();
	});

	$effect(() => {
		if (handledPrefillSearch || typeof window === 'undefined') return;
		handledPrefillSearch = true;

		const prefillProvider = $page.url.searchParams.get('prefill');
		if (prefillProvider && isSocialAuthProvider(prefillProvider)) {
			const storedValue = window.sessionStorage.getItem(WELCOME_SOCIAL_PREFILL_STORAGE_KEY);
			if (storedValue) {
				try {
					const profile = JSON.parse(storedValue) as WelcomeProfilePrefill;
					applyImportedProfile(profile);
				} catch {
					socialAuthError = 'We imported your social profile, but could not apply it.';
				}

				window.sessionStorage.removeItem(WELCOME_SOCIAL_PREFILL_STORAGE_KEY);
			}
		}

		const oauthError = $page.url.searchParams.get('oauth_error');
		if (oauthError) {
			const provider = $page.url.searchParams.get('provider');
			socialAuthError = formatSocialAuthError(oauthError, provider);
		}

		if (prefillProvider || oauthError) {
			window.history.replaceState(window.history.state, '', $page.url.pathname);
		}
	});

	async function checkUsername(name: string) {
		try {
			const res = await fetch(`/api/nip05?name=${encodeURIComponent(name)}`);
			if (!res.ok) {
				usernameStatus = 'error';
				return;
			}
			const data = await res.json();
			usernameStatus = data.exists ? 'taken' : 'available';
		} catch {
			usernameStatus = 'error';
		}
	}

	let usernameValid = $derived(
		username.trim().length > 0 && /^[a-z0-9_-]+$/i.test(username.trim())
	);

	let canSubmit = $derived(
		usernameValid && usernameStatus === 'available' && !isLoading && !isPictureUploading
	);

	async function createProfile() {
		if (!signer || !ndk.$sessions || !canSubmit) return;

		isLoading = true;
		error = '';

		try {
			// Login so NDK has the signer
			await ndk.$sessions.login(signer);

			const user = await signer.user();
			const normalizedName = username.trim().toLowerCase();

			// Register the NIP-05 mapping on our server
			const regRes = await fetch('/api/nip05', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: normalizedName, pubkey: user.pubkey })
			});

			if (!regRes.ok) {
				const regData = await regRes.json();
				throw new Error(regData.error || 'Failed to register username.');
			}

			// Build and publish kind:0 profile
			const profile: Record<string, string> = {
				name: normalizedName,
				nip05: `${normalizedName}@wikifreedia.xyz`
			};
			if (displayName.trim()) profile.display_name = displayName.trim();
			if (about.trim()) profile.about = about.trim();
			if (picture.trim()) profile.picture = picture.trim();

			const event = new NDKEvent(ndk, {
				kind: 0,
				content: JSON.stringify(profile)
			} as NostrEvent);
			await event.publish();

			await goto('/explore');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Something went wrong';
		} finally {
			isLoading = false;
		}
	}

	function startSocialLogin(providerId: string) {
		socialAuthError = '';
		socialAuthLoading = providerId;
		window.location.assign(`/api/oauth/${providerId}/start`);
	}

	function applyImportedProfile(profile: WelcomeProfilePrefill) {
		importedProfile = profile;
		username = profile.username;
		displayName = profile.displayName;
		about = profile.about;

		if (profile.picture) {
			useImportedProfilePicture(profile);
		}

		socialAuthError = '';
	}

	function setPictureSelection(url: string, selection: PictureSelection | null) {
		picture = url;
		pictureSelection = selection;
		pictureUploadError = '';
	}

	function useImportedProfilePicture(profile = importedProfile) {
		if (!profile?.picture) return;

		setPictureSelection(profile.picture, {
			kind: 'social',
			label: `${profile.providerLabel} profile photo`,
			description: `Using the photo from your ${profile.providerLabel} profile by default.`,
			href: profile.profileUrl
		});
	}

	function refreshSuggestedPictures() {
		const nextSuggestions = buildSuggestedPictureOptions();
		const selectedSuggested =
			pictureSelection?.kind === 'suggested'
				? suggestedPictures.find((option) => option.url === picture)
				: undefined;

		if (selectedSuggested && !nextSuggestions.some((option) => option.id === selectedSuggested.id)) {
			suggestedPictures = [
				selectedSuggested,
				...nextSuggestions.filter((option) => option.id !== selectedSuggested.id)
			].slice(0, nextSuggestions.length);
			return;
		}

		suggestedPictures = nextSuggestions;
	}

	function selectSuggestedPicture(option: SuggestedPictureOption) {
		setPictureSelection(option.url, {
			kind: 'suggested',
			label: option.label,
			description: 'Suggested photo from the random profile image carousel.'
		});
	}

	function hideBrokenPreviewImage(event: Event) {
		const image = event.currentTarget;
		if (image instanceof HTMLImageElement) {
			image.style.display = 'none';
		}
	}

	function openPictureUploadPicker() {
		pictureUploadInput?.click();
	}

	async function handlePictureUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement | null;
		const file = input?.files?.[0];

		if (!file) return;

		await uploadPicture(file);

		if (input) {
			input.value = '';
		}
	}

	async function uploadPicture(file: File) {
		if (!file.type.startsWith('image/')) {
			pictureUploadError = 'Choose an image file to use as your profile picture.';
			return;
		}

		const activeSigner = signer ?? NDKPrivateKeySigner.generate();
		signer = activeSigner;
		isPictureUploading = true;
		pictureUploadProgress = 0;
		pictureUploadError = '';

		try {
			const blossom = new NDKBlossom(ndk, activeSigner);
			const uploaded = await blossom.upload(file, {
				server: BLOSSOM_PROFILE_UPLOAD_SERVER,
				sha256Calculator: defaultSHA256Calculator,
				signer: activeSigner,
				onProgress: ({ loaded, total }) => {
					pictureUploadProgress =
						total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
					return 'continue';
				}
			});

			if (!uploaded.url) {
				throw new Error('Blossom did not return an image URL.');
			}

			pictureUploadProgress = 100;
			setPictureSelection(uploaded.url, {
				kind: 'upload',
				label: 'Uploaded to Blossom',
				description: 'Stored on blossom.primal.net and ready to use as your avatar.'
			});
		} catch (caughtError) {
			pictureUploadError =
				caughtError instanceof Error ? caughtError.message : 'Could not upload your image.';
		} finally {
			isPictureUploading = false;
		}
	}

	function isSuggestedPictureSelected(option: SuggestedPictureOption) {
		return pictureSelection?.kind === 'suggested' && picture === option.url;
	}

	function isSocialPictureSelected() {
		return pictureSelection?.kind === 'social' && picture === importedProfile?.picture;
	}

	function formatSocialAuthError(code: string, providerValue: string | null) {
		const providerLabel =
			providerValue && isSocialAuthProvider(providerValue)
				? getSocialAuthProvider(providerValue).label
				: 'social';

		switch (code) {
			case 'access_denied':
				return `${providerLabel} login was cancelled.`;
			case 'missing_provider_config':
				return `${providerLabel} login is not configured on this deployment yet.`;
			default:
				return `Could not import your ${providerLabel} profile. Try again.`;
		}
	}
</script>

<svelte:head>
	<title>Welcome to Wikifreedia</title>
</svelte:head>

<div class="page-shell flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12">
	<div class="mb-10 flex flex-col items-center gap-4 text-center">
		<Logo size={56} />
		<h1 class="display-wordmark text-[2.4rem] leading-none sm:text-[3rem]">
			Welcome to Wikifreedia
		</h1>
		<p class="max-w-lg text-base leading-relaxed text-muted-foreground">
			Set up your profile to start contributing. Your identity lives on Nostr — no one can lock you
			out.
		</p>
	</div>

	<div class="w-full max-w-lg">
		<div class="mb-4 space-y-3">
			{#each socialAuthProviders as provider}
				<button
					type="button"
					class="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-foreground transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
					onclick={() => startSocialLogin(provider.id)}
					disabled={isLoading || socialAuthLoading !== null}
				>
					{socialAuthLoading === provider.id ? 'Redirecting...' : provider.buttonLabel}
				</button>
			{/each}

			{#if importedProfile}
				<p class="text-center text-xs text-muted-foreground">
					Prefilled from {importedProfile.providerLabel} as
					<a
						href={importedProfile.profileUrl}
						target="_blank"
						rel="noreferrer"
						class="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
					>
						@{importedProfile.username}
					</a>
				</p>
			{/if}

			{#if socialAuthError}
				<div
					class="rounded-[1rem] border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
				>
					{socialAuthError}
				</div>
			{/if}
		</div>

		<div class="space-y-5">
			<!-- Username -->
			<div>
				<label for="username" class="eyebrow mb-2 block">Username</label>
				<div class="relative">
					<input
						id="username"
						type="text"
						class="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 pr-[10.5rem] text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-white/20"
						placeholder="your-username"
						bind:value={username}
						disabled={isLoading}
						autocomplete="off"
						autocapitalize="off"
					/>
					<span
						class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
					>
						@wikifreedia.xyz
					</span>
				</div>
				{#if username.trim() && !/^[a-z0-9_-]+$/i.test(username.trim())}
					<p class="mt-1.5 text-xs text-destructive">
						Letters, numbers, hyphens, and underscores only.
					</p>
				{:else if usernameStatus === 'checking'}
					<p class="mt-1.5 text-xs text-muted-foreground">Checking availability...</p>
				{:else if usernameStatus === 'available'}
					<p class="mt-1.5 text-xs text-green-400">Available</p>
				{:else if usernameStatus === 'taken'}
					<p class="mt-1.5 text-xs text-destructive">That username is taken.</p>
				{:else if usernameStatus === 'error'}
					<p class="mt-1.5 text-xs text-destructive">Could not check availability. Try again.</p>
				{/if}
			</div>

			<!-- Display name -->
			<div>
				<label for="displayName" class="eyebrow mb-2 block">Display name</label>
				<input
					id="displayName"
					type="text"
					class="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-white/20"
					placeholder="Your Name"
					bind:value={displayName}
					disabled={isLoading}
				/>
			</div>

			<!-- About -->
			<div>
				<label for="about" class="eyebrow mb-2 block">About</label>
				<textarea
					id="about"
					class="min-h-[5rem] w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-white/20"
					placeholder="A short bio about yourself"
					bind:value={about}
					disabled={isLoading}
				></textarea>
			</div>

			<!-- Picture -->
			<div>
				<div class="mb-3 flex items-center justify-between gap-3">
					<p class="eyebrow block">Profile picture</p>
					<button
						type="button"
						class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
						onclick={refreshSuggestedPictures}
						disabled={isLoading || isPictureUploading}
						aria-label="Shuffle suggested profile pictures"
						title="Shuffle suggestions"
					>
						<Shuffle class="h-4 w-4" />
					</button>
				</div>

				<input
					bind:this={pictureUploadInput}
					type="file"
					accept="image/*"
					class="hidden"
					onchange={handlePictureUpload}
					disabled={isLoading || isPictureUploading}
				/>

				<div class="card-carousel">
					<div class="flex min-w-fit items-center gap-3 pb-1">
						<button
							type="button"
							class={`group relative inline-flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white/[0.02] text-muted-foreground transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
								pictureSelection?.kind === 'upload'
									? 'scale-[1.04] border-primary opacity-100 ring-2 ring-primary/35'
									: 'border-dashed border-white/16 opacity-55 hover:-translate-y-px hover:border-white/28 hover:opacity-100'
							}`}
							onclick={openPictureUploadPicker}
							disabled={isLoading || isPictureUploading}
							aria-label="Upload profile picture"
							title="Upload image"
						>
							{#if pictureSelection?.kind === 'upload' && picture.trim()}
								<img
									src={picture}
									alt="Uploaded avatar"
									class="h-full w-full object-cover"
									onerror={hideBrokenPreviewImage}
								/>
								<span
									class="absolute bottom-0.5 right-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 bg-black/70 text-white"
								>
									<Plus class="h-3 w-3" />
								</span>
							{:else if isPictureUploading}
								<span class="text-xs font-semibold text-foreground">{pictureUploadProgress}%</span>
							{:else}
								<Plus class="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
							{/if}
						</button>

						{#if importedProfile?.picture}
							<button
								type="button"
								class={`relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
									isSocialPictureSelected()
										? 'scale-[1.04] border-primary opacity-100 ring-2 ring-primary/35'
										: 'border-white/10 opacity-55 hover:-translate-y-px hover:border-white/24 hover:opacity-100'
								}`}
								onclick={() => useImportedProfilePicture()}
								disabled={isLoading || isPictureUploading}
								aria-label={`Use ${importedProfile.providerLabel} profile photo`}
								title={`Use ${importedProfile.providerLabel} photo`}
							>
								<img
									src={importedProfile.picture}
									alt={`${importedProfile.providerLabel} avatar`}
									class="h-full w-full object-cover"
									onerror={hideBrokenPreviewImage}
								/>
							</button>
						{/if}

						{#each suggestedPictures as option (option.id)}
							<button
								type="button"
								class={`relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
									isSuggestedPictureSelected(option)
										? 'scale-[1.04] border-primary opacity-100 ring-2 ring-primary/35'
										: 'border-white/10 opacity-55 hover:-translate-y-px hover:border-white/24 hover:opacity-100'
								}`}
								onclick={() => selectSuggestedPicture(option)}
								disabled={isLoading || isPictureUploading}
								aria-label={`Use ${option.label} as profile picture`}
								title={option.label}
							>
								<img
									src={option.url}
									alt={option.alt}
									class="h-full w-full object-cover"
									onerror={hideBrokenPreviewImage}
								/>
							</button>
						{/each}
					</div>
				</div>

				{#if pictureUploadError}
					<p class="mt-3 text-center text-xs text-destructive">{pictureUploadError}</p>
				{/if}
			</div>
		</div>

		<button
			type="button"
			class="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold tracking-[-0.02em] text-primary-foreground shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition-all duration-200 hover:-translate-y-px hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-50"
			onclick={createProfile}
			disabled={!canSubmit}
		>
			{isLoading ? 'Creating profile...' : 'Enter Wikifreedia'}
		</button>

		{#if error}
			<div
				class="mt-4 rounded-[1rem] border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
			>
				{error}
			</div>
		{/if}

		<p class="mt-6 text-center text-sm text-muted-foreground">
			Already have a Nostr account?
			<a
				href="/"
				class="text-foreground underline underline-offset-4 transition-colors hover:text-foreground/80"
			>
				Sign in
			</a>
		</p>
	</div>
</div>
