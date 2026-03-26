<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import { NDKEvent, NDKKind, type Hexpubkey, type NDKUserProfile } from '@nostr-dev-kit/ndk';
	import { NDKSubscriptionCacheUsage } from '@nostr-dev-kit/ndk';
	import NdkAvatar from '$lib/components/NdkAvatar.svelte';
	import MergeRequestItem from './MergeRequestItem.svelte';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import { buildProfileTopicSummaries, type ProfileTopicSummary } from '$lib/profile-topics';
	import {
		applyCachedNip05ToProfile,
		getCachedPubkeyForNip05,
		rememberUserProfileNip05
	} from '$lib/utils/nip05-cache';
	import { prettifyNip05 } from '$lib/utils/nip05';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const RECOMMENDED_AUTHOR_LIST_KIND = 10101;
	const userId = $derived($page.params.id || '');
	const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
	const compactNumber = new Intl.NumberFormat('en-US');

	let hydrated = $state(false);
	let fetchedUserPubkey = $state<string | undefined>(undefined);
	let fetchedResolvedNpub = $state<string | undefined>(undefined);
	let fetchedUserProfile = $state<NDKUserProfile | undefined>(undefined);
	let resolvingUserIdentity = $state(false);
	let followedPubkeys = $state<Set<Hexpubkey>>(new Set());
	let recommendedAuthorPubkeys = $state<Set<Hexpubkey>>(new Set());
	let loadingSocialLists = $state(false);
	let followPending = $state(false);
	let recommendPending = $state(false);
	let socialActionMessage = $state<string | undefined>(undefined);
	let socialActionError = $state<string | undefined>(undefined);

	let currentUser = $derived(ndk.$currentUser);
	let isReadOnlySession = $derived(Boolean(currentUser && ndk.$sessions?.isReadOnly()));
	const userPubkey = $derived(fetchedUserPubkey ?? data.seed?.userPubkey);
	const resolvedNpub = $derived(fetchedResolvedNpub ?? data.seed?.resolvedNpub);
	const userProfile = $derived(
		applyCachedNip05ToProfile(userPubkey, fetchedUserProfile ?? data.seed?.userProfile ?? undefined)
	);

	$effect(() => {
		hydrated = true;
	});

	$effect(() => {
		rememberUserProfileNip05(userPubkey, userProfile);
	});

	$effect(() => {
		const identifier = userId;
		const seed = data.seed;

		fetchedUserPubkey = undefined;
		fetchedResolvedNpub = undefined;
		fetchedUserProfile = undefined;
		resolvingUserIdentity = Boolean(identifier) && !seed?.userPubkey;
		if (!identifier) return;

		let cancelled = false;
		const cachedPubkey = getCachedPubkeyForNip05(identifier);
		const userPromise = cachedPubkey
			? Promise.resolve(ndk.getUser({ pubkey: cachedPubkey }))
			: ndk.fetchUser(identifier);

		userPromise
			.then((user) => {
				if (cancelled || !user) return;

				user.profile = applyCachedNip05ToProfile(user.pubkey, user.profile);
				fetchedUserPubkey = user.pubkey;
				fetchedResolvedNpub = user.npub;
				fetchedUserProfile = user.profile;
				rememberUserProfileNip05(user.pubkey, user.profile);

				return user
					.fetchProfile({ cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY })
					.then((fetchedProfile) => {
						if (cancelled) return;
						const nextProfile = applyCachedNip05ToProfile(user.pubkey, fetchedProfile ?? user.profile);
						fetchedUserProfile = nextProfile;
						rememberUserProfileNip05(user.pubkey, nextProfile);
					})
					.catch(() => {
						if (cancelled) return;
						fetchedUserProfile = user.profile;
						rememberUserProfileNip05(user.pubkey, user.profile);
					});
			})
			.catch(() => {
				if (cancelled) return;
				fetchedResolvedNpub = identifier.startsWith('npub1') ? identifier : undefined;
			})
			.finally(() => {
				if (cancelled) return;
				resolvingUserIdentity = false;
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		const activeUser = currentUser;

		if (!activeUser) {
			followedPubkeys = new Set();
			recommendedAuthorPubkeys = new Set();
			loadingSocialLists = false;
			return;
		}

		let cancelled = false;
		loadingSocialLists = true;

		Promise.all([
			activeUser.followSet(undefined, undefined, NDKKind.Contacts),
			activeUser.followSet(undefined, undefined, RECOMMENDED_AUTHOR_LIST_KIND)
		])
			.then(([follows, recommendedAuthors]) => {
				if (cancelled) return;
				followedPubkeys = new Set(follows);
				recommendedAuthorPubkeys = new Set(recommendedAuthors);
			})
			.catch((error) => {
				if (cancelled) return;
				console.error('Failed to load social lists:', error);
			})
			.finally(() => {
				if (cancelled) return;
				loadingSocialLists = false;
			});

		return () => {
			cancelled = true;
		};
	});

	const entriesSub = ndk.$subscribe(() => {
		if (!browser || !userPubkey) return undefined;

		return {
			filters: [{ kinds: [30818 as number], authors: [userPubkey] }],
			subId: 'profile-entries'
		};
	});

	const mergeRequestsSub = ndk.$subscribe(() => {
		if (!browser || !userPubkey) return undefined;

		return {
			filters: [{ kinds: [818 as number], '#p': [userPubkey] }],
			subId: 'profile-merge-requests'
		};
	});

	const seededEvents = $derived.by(() => {
		if (!hydrated) return [];

		return (data.seedEvents ?? []).map((event) => new NDKEvent(ndk, event));
	});

	const entries = $derived.by(() => {
		if (!hydrated) return [];

		const mergedEntries = new Map<string, NDKEvent>();

		for (const entry of seededEvents) {
			mergedEntries.set(entry.id, entry);
		}

		for (const entry of entriesSub.events ?? []) {
			mergedEntries.set(entry.id, entry);
		}

		return Array.from(mergedEntries.values());
	});
	const mergeRequests = $derived(Array.from(mergeRequestsSub.events ?? []));

	const authoredTopics = $derived.by(() => {
		if (!hydrated) {
			return (data.authoredTopics ?? []) as ProfileTopicSummary[];
		}

		return buildProfileTopicSummaries(
			entries.map((entry) => entry.rawEvent()),
			profileRouteId
		);
	});

	const publishedTopics = $derived(authoredTopics.filter((topic) => !topic.isDeferred));
	const deferredTopics = $derived(authoredTopics.filter((topic) => topic.isDeferred));
	const recentMergeRequests = $derived(
		[...mergeRequests].sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0)).slice(0, 4)
	);
	const loadingPublishedTopics = $derived(
		hydrated &&
			publishedTopics.length === 0 &&
			(resolvingUserIdentity || (Boolean(userPubkey) && !entriesSub.eosed))
	);
	const hasSidebarContent = $derived(
		deferredTopics.length > 0 || recentMergeRequests.length > 0
	);

	const profileRouteId = $derived(
		(userProfile?.nip05 ? prettifyNip05(userProfile.nip05) : undefined) ||
		resolvedNpub || userId || userPubkey || ''
	);
	const bannerUrl = $derived(normalizeProfileText(userProfile?.banner));
	const about = $derived(normalizeProfileText(userProfile?.about));
	const displayName = $derived(
		normalizeProfileText(userProfile?.display_name) ||
			normalizeProfileText(userProfile?.displayName) ||
			normalizeProfileText(userProfile?.name) ||
			(userProfile?.nip05 ? prettifyNip05(userProfile.nip05) : undefined) ||
			resolvedNpub ||
			userId
	);
	const handle = $derived.by(() => {
		const candidate = normalizeProfileText(userProfile?.name);
		if (!candidate) return undefined;
		return candidate === displayName ? undefined : candidate;
	});
	const nip05 = $derived(userProfile?.nip05 ? prettifyNip05(userProfile.nip05) : undefined);
	const websiteUrl = $derived(normalizeExternalUrl(normalizeProfileText(userProfile?.website)));
	const isOwnProfile = $derived(Boolean(currentUser?.pubkey && userPubkey && currentUser.pubkey === userPubkey));
	const showProfileActions = $derived(Boolean(userPubkey) && !isOwnProfile);
	const canPublishProfileActions = $derived(
		Boolean(currentUser && userPubkey && !isOwnProfile && !isReadOnlySession)
	);
	const isFollowingUser = $derived(Boolean(userPubkey && followedPubkeys.has(userPubkey)));
	const isRecommendingUser = $derived(
		Boolean(userPubkey && recommendedAuthorPubkeys.has(userPubkey))
	);
	const hasActionStatus = $derived(
		Boolean(socialActionError || socialActionMessage || (!currentUser && showProfileActions) || isReadOnlySession)
	);

	function formatDate(value?: number): string {
		if (!value) return 'Unknown date';
		return dateFormat.format(new Date(value * 1000));
	}

	function formatCount(value: number): string {
		return compactNumber.format(value);
	}

	function truncate(value: string, maxLength = 22): string {
		if (value.length <= maxLength) return value;
		return `${value.slice(0, maxLength)}...`;
	}

	function normalizeProfileText(value: unknown): string | undefined {
		if (value === undefined || value === null) return undefined;
		const text = String(value).trim();
		return text.length > 0 ? text : undefined;
	}

	function normalizeExternalUrl(value?: string): string | undefined {
		const trimmed = value?.trim();
		if (!trimmed) return undefined;
		if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
		return `https://${trimmed}`;
	}

	function socialStatusText(): string | undefined {
		if (socialActionError) return socialActionError;
		if (socialActionMessage) return socialActionMessage;
		if (!showProfileActions) return undefined;
		if (!currentUser) return 'Connect a signer to follow or recommend this author.';
		if (isReadOnlySession) return 'This session is read-only. Switch to a signer-enabled session to publish.';
		if (loadingSocialLists) return 'Checking your current follow and recommendation lists...';
		return undefined;
	}

	function withPubkey(set: Set<Hexpubkey>, pubkey: Hexpubkey): Set<Hexpubkey> {
		const next = new Set(set);
		next.add(pubkey);
		return next;
	}

	function formatActionError(error: unknown, fallback: string): string {
		if (error instanceof Error && error.message.trim()) return error.message;
		if (typeof error === 'string' && error.trim()) return error;
		return fallback;
	}

	async function followProfile() {
		if (!currentUser || !userPubkey || isFollowingUser || followPending) return;

		followPending = true;
		socialActionMessage = undefined;
		socialActionError = undefined;

		try {
			await currentUser.follow(userPubkey, undefined, NDKKind.Contacts);
			followedPubkeys = withPubkey(followedPubkeys, userPubkey);
			socialActionMessage = `Following ${displayName}.`;
		} catch (error) {
			socialActionError = formatActionError(error, 'Failed to update your contact list.');
		} finally {
			followPending = false;
		}
	}

	async function recommendProfile() {
		if (!currentUser || !userPubkey || isRecommendingUser || recommendPending) return;

		recommendPending = true;
		socialActionMessage = undefined;
		socialActionError = undefined;

		try {
			await currentUser.follow(userPubkey, undefined, RECOMMENDED_AUTHOR_LIST_KIND as NDKKind);
			recommendedAuthorPubkeys = withPubkey(recommendedAuthorPubkeys, userPubkey);
			socialActionMessage = `Recommended ${displayName} to your wiki-author list.`;
		} catch (error) {
			socialActionError = formatActionError(error, 'Failed to update your recommended authors list.');
		} finally {
			recommendPending = false;
		}
	}
</script>

<PageContainer class="space-y-6">
	<section class="glass-panel relative overflow-hidden rounded-2xl p-0">
		{#if bannerUrl}
			<img src={bannerUrl} alt="" class="absolute inset-0 h-full w-full object-cover opacity-35" />
		{/if}

		<div class="absolute inset-0 bg-black/70"></div>

		<div class="relative px-5 py-5 sm:px-7 sm:py-6 lg:px-8 lg:py-7">
			<div
				class="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(21rem,auto)] lg:items-center lg:gap-6"
			>
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center lg:items-start">
					<NdkAvatar
						{ndk}
						pubkey={userPubkey}
						npub={resolvedNpub ?? userId}
						{userProfile}
						class="h-20 w-20 rounded-full ring-2 ring-white/18 shadow-[0_16px_55px_rgba(0,0,0,0.4)] sm:h-24 sm:w-24"
						alt={displayName}
					/>

					<div class="min-w-0">
						<h1 class="text-[clamp(2.2rem,5.5vw,3.9rem)] leading-[0.92]">{displayName}</h1>

						{#if handle || nip05 || resolvedNpub}
							<div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
								{#if handle}
									<span>@{handle}</span>
								{/if}
								{#if nip05}
									<span>{nip05}</span>
								{/if}
								{#if resolvedNpub}
									<span class="font-mono text-xs text-white/58">{truncate(resolvedNpub, 26)}</span>
								{/if}
							</div>
						{/if}

						{#if about}
							<p class="mt-3 max-w-xl text-sm leading-6 text-white/78 sm:text-[0.98rem]">
								{about}
							</p>
						{/if}

						{#if websiteUrl}
							<div class="mt-4">
								<a
									href={websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="chrome-pill inline-flex rounded-full px-3.5 py-1.5 text-sm text-white/78 hover:text-white"
								>
									{truncate(websiteUrl.replace(/^https?:\/\//, ''), 38)}
								</a>
							</div>
						{/if}
					</div>
				</div>

				<div class="flex flex-col gap-4 lg:min-w-[21rem] lg:items-end">
					{#if showProfileActions}
						<div class="flex w-full flex-nowrap items-center gap-3 lg:justify-end">
							<button
								type="button"
								class={`inline-flex h-11 shrink-0 whitespace-nowrap items-center justify-center rounded-full px-4 text-sm font-semibold transition-all duration-200 ${
									isFollowingUser
										? 'bg-primary text-primary-foreground shadow-[0_14px_34px_rgba(255,255,255,0.08)]'
										: 'chrome-pill text-white/82 hover:bg-white/[0.09] hover:text-white'
								} ${canPublishProfileActions && !isFollowingUser && !followPending ? 'hover:-translate-y-0.5' : ''} ${!canPublishProfileActions || isFollowingUser || followPending ? 'cursor-not-allowed opacity-70' : ''}`}
								onclick={followProfile}
								disabled={!canPublishProfileActions || isFollowingUser || followPending}
								aria-busy={followPending}
							>
								{#if followPending}
									Updating...
								{:else if isFollowingUser}
									Following
								{:else}
									Follow
								{/if}
							</button>

							<button
								type="button"
								class={`group/recommend relative inline-flex h-11 shrink-0 items-center justify-center overflow-hidden rounded-full border whitespace-nowrap transition-[width,transform,background-color,color,border-color,box-shadow] duration-300 ${
									isRecommendingUser
										? 'w-[12.5rem] border-white/10 bg-[rgba(255,255,255,0.92)] px-4 text-black shadow-[0_16px_40px_rgba(255,255,255,0.12)]'
										: recommendPending
											? 'w-[12.5rem] border-white/10 bg-[rgba(255,255,255,0.03)] px-4 text-white/78'
											: 'chrome-pill w-11 text-white/82 hover:w-[12.5rem] hover:border-white/18 hover:bg-white/[0.08] hover:text-white'
								} ${canPublishProfileActions && !isRecommendingUser && !recommendPending ? 'hover:-translate-y-0.5' : ''} ${!canPublishProfileActions || isRecommendingUser || recommendPending ? 'cursor-not-allowed opacity-70' : ''}`}
								onclick={recommendProfile}
								disabled={!canPublishProfileActions || isRecommendingUser || recommendPending}
								aria-busy={recommendPending}
								aria-label={isRecommendingUser ? 'Recommended author' : 'Recommend author'}
							>
								<span class="relative flex items-center justify-center whitespace-nowrap text-sm font-semibold">
									{#if recommendPending}
										[ Saving ]
									{:else if isRecommendingUser}
										[ Recommended ]
									{:else}
										<span
											class="overflow-hidden max-w-0 opacity-0 transition-all duration-300 group-hover/recommend:mr-2 group-hover/recommend:max-w-4 group-hover/recommend:opacity-100"
										>
											[
										</span>
										<span class="font-mono text-base leading-none tracking-normal">
											+
										</span>
										<span
											class="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover/recommend:ml-2 group-hover/recommend:max-w-[8rem] group-hover/recommend:opacity-100"
										>
											Recommend
										</span>
										<span
											class="overflow-hidden max-w-0 opacity-0 transition-all duration-300 group-hover/recommend:ml-2 group-hover/recommend:max-w-4 group-hover/recommend:opacity-100"
										>
											]
										</span>
									{/if}
								</span>
							</button>
						</div>

						{#if hasActionStatus}
							<p
								class={`max-w-[20rem] text-xs leading-5 lg:text-right ${
									socialActionError ? 'text-red-200/90' : 'text-white/62'
								}`}
							>
								{socialStatusText()}
							</p>
						{/if}
					{/if}

					<div
						class="w-full max-w-[10rem] self-start border-t border-white/10 pt-4 lg:justify-self-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
					>
						<div class="eyebrow mb-1">Topics</div>
						<div class="text-[2.4rem] font-semibold leading-none">
							{formatCount(publishedTopics.length)}
						</div>
						<div class="mt-1 text-sm text-white/62">written</div>
					</div>
				</div>
			</div>
		</div>
	</section>

			<div class={hasSidebarContent ? 'grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_340px]' : 'grid gap-6'}>
			<section>
			{#if loadingPublishedTopics}
				<div class="surface-inset rounded-xl px-5 py-6 text-sm text-muted-foreground">
					Loading published entries...
				</div>
			{:else if publishedTopics.length === 0}
				<div class="surface-inset rounded-xl px-5 py-6 text-sm text-muted-foreground">
					No published entries from this author yet.
				</div>
				{:else}
					<div class="section-list">
						{#each publishedTopics as topic (topic.id)}
							<a href={topic.entryHref} class="section-row section-row-link block">
								<div class="flex items-baseline justify-between gap-4">
									<h3 class="display-wordmark text-[1.1rem] leading-tight sm:text-[1.2rem]">
										{topic.title}
									</h3>
									{#if topic.category}
										<span class="shrink-0 text-xs text-muted-foreground">{topic.category}</span>
									{/if}
								</div>
								<div class="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
									<span>{formatDate(topic.createdAt)}</span>
									<span class="opacity-40">&middot;</span>
									<span>{formatCount(topic.wordCount)} words</span>
									{#if topic.versionCount > 1}
									<span class="opacity-40">&middot;</span>
									<span>{topic.versionCount} versions</span>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</section>

			{#if hasSidebarContent}
				<section>
						<div class="section-list">
							{#if deferredTopics.length > 0}
								<div class="section-row">
									<p class="eyebrow mb-3">Deferred topics</p>
									<div class="section-list mt-4">
										{#each deferredTopics.slice(0, 5) as topic (topic.id)}
											<a href={topic.entryHref} class="section-row section-row-link block">
												<div class="font-medium text-foreground">{topic.title}</div>
												<div class="mt-2 text-sm text-muted-foreground">
													Updated {formatDate(topic.createdAt)}
												</div>
											</a>
										{/each}
								</div>
							</div>
						{/if}

						{#if recentMergeRequests.length > 0}
							<div class="section-row">
								<p class="eyebrow mb-3">Recent activity</p>
								<h3 class="text-lg">Merge requests</h3>
								<p class="mt-2 text-sm leading-7 text-muted-foreground">
									Showing {recentMergeRequests.length} of {mergeRequests.length} incoming merge requests.
								</p>

								<div class="section-list mt-5">
									{#each recentMergeRequests as mergeRequest (mergeRequest.id)}
										<div class="section-row section-row-link">
											<MergeRequestItem {mergeRequest} />
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</section>
			{/if}
		</div>
	</PageContainer>
