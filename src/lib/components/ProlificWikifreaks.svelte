<script lang="ts">
	import { ndk } from "@/ndk.svelte";
	import type { NDKEvent } from "@nostr-dev-kit/ndk";
	import { Avatar } from "@nostr-dev-kit/svelte";
	import Name from "@/components/Name.svelte";

	const WIKI_KIND = 30818;
	const LIKE_KIND = 7;

	// Subscribe to wiki entries
	const entries = ndk.$subscribe(() => ({
		filters: [{ kinds: [WIKI_KIND] }],
		subId: 'prolific-entries'
	}));

	// Subscribe to likes on wiki entries
	const likes = ndk.$subscribe(() => ({
		filters: [{ kinds: [LIKE_KIND], "#k": [WIKI_KIND.toString()], limit: 5000 }],
		subId: 'prolific-likes'
	}));

	// Calculate activity scores per user
	const topUsers = $derived.by(() => {
		const activityByUser = new Map<string, {
			pubkey: string;
			entries: number;
			likes: number;
			totalScore: number;
		}>();

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
				const aTag = event.getMatchingTags("a")[0];
				if (aTag && aTag[1]) {
					// Extract pubkey from the 'a' tag (format: kind:pubkey:dtag)
					const parts = aTag[1].split(":");
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
			.map(user => ({
				...user,
				totalScore: user.entries + user.likes
			}))
			.filter(user => user.totalScore > 0)
			.sort((a, b) => b.totalScore - a.totalScore)
			.slice(0, 10);

		return usersWithActivity;
	});
</script>

<div class="bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800">
	<h3 class="text-lg font-semibold mb-4">Prolific Wikifreaks</h3>

	{#if topUsers.length === 0}
		<div class="text-sm text-neutral-500">Loading activity...</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each topUsers as user, i (user.pubkey)}
				<a
					href="/p/{user.pubkey}"
					class="flex flex-row items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors"
				>
					<div class="text-sm font-semibold text-neutral-500 w-6">
						#{i + 1}
					</div>
					<Avatar ndk={ndk} pubkey={user.pubkey} class="w-10 h-10 object-cover rounded-full flex-none" />
					<div class="flex flex-col flex-1 min-w-0">
						<Name ndk={ndk} pubkey={user.pubkey} class="font-medium truncate" />
						<div class="text-xs text-neutral-500">
							{user.entries} {user.entries === 1 ? 'entry' : 'entries'} · {user.likes} {user.likes === 1 ? 'like' : 'likes'}
						</div>
					</div>
					<div class="text-sm font-semibold text-orange-500">
						{user.totalScore}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
