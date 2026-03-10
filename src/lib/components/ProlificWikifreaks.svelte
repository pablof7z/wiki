<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import Name from '$lib/components/Name.svelte';

	const WIKI_KIND = 30818;
	const LIKE_KIND = 7;

	// Subscribe to wiki entries
	const entries = ndk.$subscribe(() => ({
		filters: [{ kinds: [WIKI_KIND] }],
		subId: 'prolific-entries'
	}));

	// Subscribe to likes on wiki entries
	const likes = ndk.$subscribe(() => ({
		filters: [{ kinds: [LIKE_KIND], '#k': [WIKI_KIND.toString()], limit: 5000 }],
		subId: 'prolific-likes'
	}));

	// Calculate activity scores per user
	const topUsers = $derived.by(() => {
		const activityByUser = new Map<
			string,
			{
				pubkey: string;
				entries: number;
				likes: number;
				totalScore: number;
			}
		>();

		// Count entries per user
		if (entries.events) {
			entries.events.forEach((event: NDKEvent) => {
				const pubkey = event.pubkey;
				const current = activityByUser.get(pubkey) || {
					pubkey,
					entries: 0,
					likes: 0,
					totalScore: 0
				};
				current.entries++;
				activityByUser.set(pubkey, current);
			});
		}

		// Count likes per user (the author of the liked content)
		if (likes.events) {
			likes.events.forEach((event: NDKEvent) => {
				// Get the 'a' tag which references the wiki entry
				const aTag = event.getMatchingTags('a')[0];
				if (aTag && aTag[1]) {
					// Extract pubkey from the 'a' tag (format: kind:pubkey:dtag)
					const parts = aTag[1].split(':');
					if (parts.length >= 2) {
						const pubkey = parts[1];
						const current = activityByUser.get(pubkey) || {
							pubkey,
							entries: 0,
							likes: 0,
							totalScore: 0
						};
						current.likes++;
						activityByUser.set(pubkey, current);
					}
				}
			});
		}

		// Calculate total score and sort
		const usersWithActivity = Array.from(activityByUser.values())
			.map((user) => ({
				...user,
				totalScore: user.entries + user.likes
			}))
			.filter((user) => user.totalScore > 0)
			.sort((a, b) => b.totalScore - a.totalScore)
			.slice(0, 10);

		return usersWithActivity;
	});
</script>

<div class="glass-panel rounded-[2rem] p-5 sm:p-6">
	<p class="eyebrow mb-3">Community signal</p>
	<h3 class="text-xl">Prolific Wikifreaks</h3>
	<p class="mt-2 text-sm text-muted-foreground">
		People generating the most writing and support around the network.
	</p>

	{#if topUsers.length === 0}
		<div class="mt-6 text-sm text-muted-foreground">Loading activity...</div>
	{:else}
		<div class="mt-6 flex flex-col gap-3">
			{#each topUsers as user, i (user.pubkey)}
				<a
					href="/p/{user.pubkey}"
					class="glass-panel-soft flex flex-row items-center gap-3 rounded-[1.5rem] p-3 transition-colors hover:bg-white/[0.08]"
				>
					<div class="w-6 text-sm font-semibold text-muted-foreground">
						#{i + 1}
					</div>
					<Avatar
						{ndk}
						pubkey={user.pubkey}
						class="h-10 w-10 rounded-full object-cover ring-1 ring-white/10 flex-none"
					/>
					<div class="flex flex-col flex-1 min-w-0">
						<Name {ndk} pubkey={user.pubkey} class="font-medium truncate" />
						<div class="text-xs text-muted-foreground">
							{user.entries}
							{user.entries === 1 ? 'entry' : 'entries'} · {user.likes}
							{user.likes === 1 ? 'like' : 'likes'}
						</div>
					</div>
					<div class="display-wordmark text-2xl">
						{user.totalScore}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
