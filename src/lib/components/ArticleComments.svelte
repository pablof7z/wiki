<script lang="ts">
	import { ndk } from '@/ndk.svelte';
	import type { NDKEvent, NostrEvent } from '@nostr-dev-kit/ndk';
	import { NDKEvent as NDKCommentEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import Name from './Name.svelte';
	import { Button } from '@/components/ui/button';
	import { Textarea } from '@/components/ui/textarea';

	let { event }: { event: NDKEvent } = $props();

	let currentUser = $derived(ndk.$sessions?.currentUser);
	let newComment = $state('');
	let submitting = $state(false);
	let rootAddress = $derived(event.tagAddress());
	let relayHint = $derived(event.relay?.url ?? '');

	const commentsSub = ndk.$subscribe(() => {
		if (!rootAddress) return undefined;

		return {
			filters: [{ kinds: [1111 as number], '#A': [rootAddress] }],
			subId: `article-comments-${event.id}`
		};
	});

	const comments = $derived.by(() => {
		return Array.from(commentsSub.events ?? [])
			.filter((comment) => {
				const parentAddress = comment.getMatchingTags('a')[0]?.[1];
				const parentEventId = comment.getMatchingTags('e')[0]?.[1];
				return parentAddress === rootAddress || parentEventId === event.id;
			})
			.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
	});

	function formatDate(createdAt?: number) {
		if (!createdAt) return 'Unknown date';
		return new Date(createdAt * 1000).toLocaleString();
	}

	async function submitComment() {
		if (!currentUser || !rootAddress || !newComment.trim()) return;

		submitting = true;

		try {
			const comment = new NDKCommentEvent(ndk, {
				kind: 1111,
				content: newComment.trim()
			} as NostrEvent);

			comment.tags.push(['A', rootAddress, relayHint]);
			comment.tags.push(['K', String(event.kind ?? 30818)]);
			comment.tags.push(['P', event.pubkey, relayHint]);
			comment.tags.push(['a', rootAddress, relayHint]);
			comment.tags.push(['k', String(event.kind ?? 30818)]);
			comment.tags.push(['p', event.pubkey, relayHint]);

			if (event.id) {
				comment.tags.push(['e', event.id, relayHint, event.pubkey]);
			}

			await comment.publish();
			newComment = '';
		} catch (error) {
			console.error('Failed to publish comment', error);
		} finally {
			submitting = false;
		}
	}
</script>

<section class="glass-panel-soft rounded-[1.9rem] px-5 py-5">
	<div class="flex items-end justify-between gap-3">
		<div>
			<p class="eyebrow mb-3">NIP-22</p>
			<h3 class="text-lg">Comments</h3>
		</div>

		<div class="text-sm text-muted-foreground">{comments.length}</div>
	</div>

	<div class="mt-4 space-y-3">
		{#if currentUser}
			<div class="space-y-3 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
				<Textarea
					bind:value={newComment}
					class="min-h-[120px] rounded-[1.25rem] border-white/10 bg-transparent shadow-none focus-visible:ring-0"
					placeholder="Leave a plaintext comment scoped to this article"
				/>
				<div class="flex justify-end">
					<Button on:click={submitComment} disabled={submitting || !newComment.trim()}>
						{submitting ? 'Posting...' : 'Post comment'}
					</Button>
				</div>
			</div>
		{:else}
			<p
				class="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-muted-foreground"
			>
				Sign in to join the NIP-22 discussion thread for this article.
			</p>
		{/if}

		{#if comments.length === 0}
			<p class="text-sm leading-6 text-muted-foreground">No comments yet.</p>
		{:else}
			<div class="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
				{#each comments as comment (comment.id)}
					<article class="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
						<div class="flex items-center gap-3">
							<Avatar
								{ndk}
								pubkey={comment.pubkey}
								class="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
							/>
							<div class="min-w-0">
								<div class="truncate font-medium">
									<Name {ndk} pubkey={comment.pubkey} />
								</div>
								<div class="text-xs text-muted-foreground">
									{formatDate(comment.created_at)}
								</div>
							</div>
						</div>

						<p class="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/86">
							{comment.content}
						</p>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</section>
