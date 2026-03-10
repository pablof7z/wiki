<script lang="ts">
	import { page } from '$app/stores';
	import { ndk } from '@/ndk.svelte';
	import MergeRequestItem from './MergeRequestItem.svelte';
	import Name from '@/components/Name.svelte';
	import PageContainer from '@/components/PageContainer.svelte';
	import type { NDKUser } from '@nostr-dev-kit/ndk';

	const userId = $derived($page.params.id || '');
	const user = ndk.$fetchUser(() => userId) as NDKUser | undefined;

	const entriesSub = ndk.$subscribe(() => {
		if (!user?.pubkey) return undefined;

		return {
			filters: [{ kinds: [30818 as number], authors: [user.pubkey] }],
			subId: 'profile-entries'
		};
	});

	const mergeRequestsSub = ndk.$subscribe(() => {
		if (!user?.pubkey) return undefined;

		return {
			filters: [{ kinds: [818 as number], '#p': [user.pubkey] }],
			subId: 'profile-merge-requests'
		};
	});

	const entries = $derived(Array.from(entriesSub.events ?? []));
	const mergeRequests = $derived(Array.from(mergeRequestsSub.events ?? []));
</script>

<PageContainer class="space-y-6">
	<section class="glass-panel rounded-[2.5rem] px-6 py-6 sm:px-8 sm:py-8">
		<p class="eyebrow mb-3">Contributor profile</p>
		<h1>
			<Name {ndk} pubkey={user?.pubkey} npub={userId} />
		</h1>
	</section>

	{#if mergeRequests.length > 0}
		<section class="glass-panel-soft rounded-[2rem] px-6 py-5 sm:px-8">
			<p class="eyebrow mb-3">Collaboration</p>
			<h3 class="text-xl">Merge requests</h3>

			<div class="mt-5 space-y-3">
				{#each mergeRequests as mergeRequest (mergeRequest.id)}
					<div class="glass-panel-soft rounded-[1.4rem] p-3">
						<MergeRequestItem {mergeRequest} />
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if entries.length > 0}
		<section class="glass-panel-soft rounded-[2rem] px-6 py-5 sm:px-8">
			<p class="eyebrow mb-3">Published entries</p>
			<h3 class="text-xl">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</h3>

			<div class="mt-5 space-y-3">
				{#each entries as entry (entry.id)}
					<div
						class="glass-panel-soft flex flex-col gap-3 rounded-[1.4rem] p-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<a href="/{entry.dTag}/{entry.author.npub}" class="grow flex flex-col items-start">
							<span class="display-wordmark text-2xl">{entry.dTag}</span>
							<div class="text-xs text-muted-foreground">
								{entry.onRelays?.map((relay) => relay.url).join(', ')}
							</div>
						</a>

						{#if entry.getMatchingTags('a').find((tag) => tag[3] === 'defer')}
							<div class="text-xs uppercase tracking-[0.25em] text-muted-foreground">Deferred</div>
						{:else}
							<div class="flex flex-col justify-end text-right text-sm text-muted-foreground">
								<span>{entry.created_at}</span>
								<span>{entry.content.split(' ').length} words</span>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}
</PageContainer>
