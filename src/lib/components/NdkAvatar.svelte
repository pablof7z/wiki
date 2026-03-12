<script lang="ts">
	import { NDKSubscriptionCacheUsage, type NDKUser, type NDKUserProfile } from '@nostr-dev-kit/ndk';
	import { cn } from '$lib/utils';

	type FetchingNdk = {
		fetchUser(input: string): Promise<NDKUser | undefined>;
	};

	let {
		ndk,
		user,
		pubkey,
		npub,
		userProfile,
		class: className = '',
		alt = 'User avatar'
	}: {
		ndk?: FetchingNdk;
		user?: NDKUser;
		pubkey?: string;
		npub?: string;
		userProfile?: NDKUserProfile;
		class?: string;
		alt?: string;
	} = $props();

	let profile = $state<NDKUserProfile | undefined>(undefined);
	let imageErrored = $state(false);

	function hash(value: string): number {
		let result = 0;
		for (let i = 0; i < value.length; i += 1) {
			result = (result << 5) - result + value.charCodeAt(i);
			result |= 0;
		}
		return Math.abs(result);
	}

	function initialsFor(value: string | undefined): string {
		if (!value) return '?';
		return (
			value
				.split(/\s+/)
				.filter(Boolean)
				.slice(0, 2)
				.map((part) => part[0]?.toUpperCase() ?? '')
				.join('') || value.slice(0, 2).toUpperCase()
		);
	}

	const identifier = $derived(user?.pubkey ?? pubkey ?? npub);
	const image = $derived(profile?.image ?? profile?.picture);
	const label = $derived(profile?.displayName ?? profile?.name ?? user?.npub ?? identifier ?? alt);
	const fallbackText = $derived(initialsFor(label));
	const gradient = $derived.by(() => {
		const value = identifier ?? label ?? alt;
		const base = hash(value);
		const hueA = base % 360;
		const hueB = (hueA + 48) % 360;
		return `linear-gradient(135deg, hsl(${hueA} 55% 34%), hsl(${hueB} 60% 46%))`;
	});

	$effect(() => {
		imageErrored = false;
	});

	$effect(() => {
		const currentUser = user;
		const currentIdentifier = identifier;
		const currentNdk = ndk;
		const currentProfile = userProfile;

		if (!currentIdentifier || !currentNdk) {
			profile = currentProfile ?? currentUser?.profile;
			return;
		}

		let cancelled = false;

		Promise.resolve(
			currentUser?.pubkey === currentIdentifier
				? currentUser
				: currentNdk.fetchUser(currentIdentifier)
		).then((fetchedUser) => {
			if (cancelled) return;

			profile = currentProfile ?? fetchedUser?.profile ?? currentUser?.profile;

			if (!fetchedUser) return;

			return fetchedUser
				.fetchProfile({ cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY })
				.then((fetchedProfile) => {
					if (cancelled) return;
					profile = fetchedProfile ?? currentProfile ?? fetchedUser.profile;
				})
				.catch(() => {
					if (cancelled) return;
					profile = currentProfile ?? fetchedUser.profile ?? currentUser?.profile;
				});
		});

		return () => {
			cancelled = true;
		};
	});
</script>

<span
	class={cn(
		'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[0.72rem] font-semibold text-foreground',
		className
	)}
	style={`background:${image && !imageErrored ? 'transparent' : gradient};`}
	title={label}
>
	{#if image && !imageErrored}
		<img
			src={image}
			alt={label}
			class="h-full w-full object-cover"
			loading="lazy"
			onerror={() => {
				imageErrored = true;
			}}
		/>
	{:else}
		<span aria-hidden="true">{fallbackText}</span>
		<span class="sr-only">{label}</span>
	{/if}
</span>
