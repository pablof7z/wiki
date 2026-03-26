<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { calculateAuthorActivityScore } from '$lib/utils/author-activity';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import Name from '$lib/components/Name.svelte';
	import UserProfileLink from '$lib/components/UserProfileLink.svelte';

	const WIKI_KIND = 30818;

	const entries = ndk.$subscribe(() => ({
		filters: [{ kinds: [WIKI_KIND] }],
		subId: 'author-grid-entries'
	}));

	type AuthorData = {
		pubkey: string;
		entries: number;
		activityScore: number;
		topicCount: number;
		recentTopics: string[];
		latestActivity: number;
	};

	const topAuthors = $derived.by(() => {
		const byUser = new Map<
			string,
			{ pubkey: string; entries: number; dTags: Map<string, number> }
		>();

		if (entries.events) {
			entries.events.forEach((event: NDKEvent) => {
				const pubkey = event.pubkey;
				const current = byUser.get(pubkey) || { pubkey, entries: 0, dTags: new Map() };
				current.entries++;

				const ts = event.created_at ?? 0;
				const topicKey = event.dTag || event.id || `${pubkey}:${ts}:${current.entries}`;
				const existing = current.dTags.get(topicKey) ?? 0;
				if (ts > existing) current.dTags.set(topicKey, ts);

				byUser.set(pubkey, current);
			});
		}

		return Array.from(byUser.values())
			.map((user): AuthorData => {
				const sortedTopics = Array.from(user.dTags.entries()).sort((a, b) => b[1] - a[1]);
				const topicTimestamps = sortedTopics.map(([, ts]) => ts);

				return {
					pubkey: user.pubkey,
					entries: user.entries,
					activityScore: calculateAuthorActivityScore(topicTimestamps),
					topicCount: user.dTags.size,
					recentTopics: sortedTopics.slice(0, 3).map(([tag]) => tag),
					latestActivity: sortedTopics[0]?.[1] ?? 0
				};
			})
			.filter((user) => user.activityScore > 0)
			.sort(
				(a, b) =>
					b.activityScore - a.activityScore ||
					b.latestActivity - a.latestActivity ||
					b.entries - a.entries
			)
			.slice(0, 12);
	});

	function relativeTime(ts: number): string {
		if (!ts) return '';
		const seconds = Math.floor(Date.now() / 1000) - ts;
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}d ago`;
		const months = Math.floor(days / 30);
		return `${months}mo ago`;
	}
</script>

{#if topAuthors.length > 0}
	<div class="card-carousel">
		<div class="author-carousel-track">
			{#each topAuthors as author (author.pubkey)}
				<UserProfileLink pubkey={author.pubkey} class="author-portrait-card">
					<div class="author-portrait-media">
						<Avatar
							{ndk}
							pubkey={author.pubkey}
							class="h-full w-full rounded-none object-cover text-4xl"
						/>
					</div>

					<div class="author-portrait-body">
						<div>
							<Name {ndk} pubkey={author.pubkey} class="author-portrait-name block" />
							<div class="author-portrait-meta mt-2">
								{author.topicCount}
								{author.topicCount === 1 ? ' topic' : ' topics'} · {author.entries}
								{author.entries === 1 ? ' entry' : ' entries'}
							</div>
						</div>

						<div>
							{#if author.recentTopics.length > 0}
								<div class="flex flex-wrap gap-1.5">
									{#each author.recentTopics as topic}
										<span class="chrome-pill rounded-full px-2.5 py-1 text-xs text-muted-foreground"
											>{topic}</span
										>
									{/each}
								</div>
								{/if}

								{#if author.latestActivity}
									<div class="author-portrait-kicker mt-4">{relativeTime(author.latestActivity)}</div>
								{/if}
							</div>
						</div>
				</UserProfileLink>
			{/each}
		</div>
	</div>
{:else if entries.events}
	<div class="text-sm text-muted-foreground">No recently active authors yet.</div>
{:else}
	<div class="text-sm text-muted-foreground">Loading authors...</div>
{/if}
