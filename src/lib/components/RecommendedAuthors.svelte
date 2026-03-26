<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import Name from '$lib/components/Name.svelte';
	import UserProfileLink from '$lib/components/UserProfileLink.svelte';

	const RECOMMENDED_AUTHOR_LIST_KIND = 10101;
	const RECOMMENDED_AUTHOR_LIMIT = 12;
	const compactNumber = new Intl.NumberFormat('en-US');

	type RecommendedAuthor = {
		pubkey: string;
		recommenders: number;
		latestRecommendation: number;
	};

	const recommendedAuthorLists = ndk.$subscribe(() => ({
		filters: [{ kinds: [RECOMMENDED_AUTHOR_LIST_KIND], limit: 500 }],
		subId: 'recommended-author-lists'
	}));

	const topRecommendedAuthors = $derived.by(() => {
		const latestListByAuthor = new Map<string, NDKEvent>();
		const recommendationsByAuthor = new Map<
			string,
			{
				pubkey: string;
				recommenders: Set<string>;
				latestRecommendation: number;
			}
		>();

		if (recommendedAuthorLists.events) {
			recommendedAuthorLists.events.forEach((event: NDKEvent) => {
				const existing = latestListByAuthor.get(event.pubkey);
				if (!existing || (event.created_at ?? 0) > (existing.created_at ?? 0)) {
					latestListByAuthor.set(event.pubkey, event);
				}
			});
		}

		latestListByAuthor.forEach((event, recommenderPubkey) => {
			const createdAt = event.created_at ?? 0;
			const taggedPubkeys = new Set(
				event
					.getMatchingTags('p')
					.map((tag) => tag[1])
					.filter((pubkey): pubkey is string => Boolean(pubkey))
			);

			taggedPubkeys.forEach((pubkey) => {
				const current = recommendationsByAuthor.get(pubkey) ?? {
					pubkey,
					recommenders: new Set<string>(),
					latestRecommendation: 0
				};

				current.recommenders.add(recommenderPubkey);
				if (createdAt > current.latestRecommendation) {
					current.latestRecommendation = createdAt;
				}

				recommendationsByAuthor.set(pubkey, current);
			});
		});

		return Array.from(recommendationsByAuthor.values())
			.map(
				(author): RecommendedAuthor => ({
					pubkey: author.pubkey,
					recommenders: author.recommenders.size,
					latestRecommendation: author.latestRecommendation
				})
			)
			.sort(
				(a, b) =>
					b.recommenders - a.recommenders ||
					b.latestRecommendation - a.latestRecommendation ||
					a.pubkey.localeCompare(b.pubkey)
			)
			.slice(0, RECOMMENDED_AUTHOR_LIMIT);
	});

	function formatCount(value: number): string {
		return compactNumber.format(value);
	}

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

{#if topRecommendedAuthors.length > 0}
	<div class="card-carousel">
		<div class="author-carousel-track">
			{#each topRecommendedAuthors as author (author.pubkey)}
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
								{formatCount(author.recommenders)}
								{author.recommenders === 1 ? ' curator' : ' curators'}
							</div>
						</div>

						<div>
							{#if author.latestRecommendation}
								<div class="author-portrait-kicker">Last added {relativeTime(author.latestRecommendation)}</div>
							{/if}
						</div>
					</div>
				</UserProfileLink>
			{/each}
		</div>
	</div>
{:else if recommendedAuthorLists.events}
	<div class="text-sm text-muted-foreground">No public wiki-author recommendations yet.</div>
{:else}
	<div class="text-sm text-muted-foreground">Loading public wiki-author lists...</div>
{/if}
