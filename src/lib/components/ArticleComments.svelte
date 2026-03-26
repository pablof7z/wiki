<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import { createNip22CommentEvent, isDirectReplyToRoot } from '$lib/comments/nip22';
	import Name from './Name.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';

	let { event }: { event: NDKEvent } = $props();

	let currentUser = $derived(ndk.$currentUser);
	let newComment = $state('');
	let showComposer = $state(false);
	let submitting = $state(false);
	let rootAddress = $derived(event.tagAddress());
	let relayHint = $derived(event.relay?.url ?? '');

	const commentsSub = ndk.$subscribe(() => {
		if (!rootAddress) return undefined;

		return {
			filters: [{ kinds: [1111 as number], ...event.nip22Filter() }],
			subId: `article-comments-${event.id}`
		};
	});

	const comments = $derived.by(() => {
		return Array.from(commentsSub.events ?? [])
			.filter((comment) => isDirectReplyToRoot(comment, event))
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
			const comment = createNip22CommentEvent(ndk, {
				root: event,
				parent: event,
				content: newComment
			});
			comment.author = currentUser;
			await comment.publish();
			newComment = '';
			showComposer = false;
		} catch (error) {
			console.error('Failed to publish comment', error);
		} finally {
			submitting = false;
		}
	}
</script>

<section class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<h3 class="text-lg">Comments</h3>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
				{comments.length === 0
					? 'Public conversation about this article.'
					: `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'} on this article.`}
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			{#if currentUser && !showComposer}
				<Button onclick={() => (showComposer = true)} size="sm" class="rounded-full px-4">
					New comment
				</Button>
			{/if}
		</div>
	</div>

	{#if currentUser && showComposer}
		<div class="space-y-3 border-t border-white/8 pt-5">
			<Textarea
				bind:value={newComment}
				class="min-h-[140px] rounded-[1.2rem] border-white/8 bg-white/[0.03] px-4 py-4 shadow-none focus-visible:ring-white/20"
				placeholder="Share a thought about this article"
			/>

			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p class="text-sm text-muted-foreground">Keep it focused on the article.</p>
				<div class="flex justify-end gap-2">
					<Button
						onclick={() => {
							newComment = '';
							showComposer = false;
						}}
						variant="ghost"
						size="sm"
						class="rounded-full px-4 text-muted-foreground hover:text-foreground"
					>
						Cancel
					</Button>
					<Button
						onclick={submitComment}
						disabled={submitting || !newComment.trim()}
						class="rounded-full px-5"
					>
						{submitting ? 'Posting...' : 'Post comment'}
					</Button>
				</div>
			</div>
		</div>
	{:else if !currentUser}
		<div class="border-t border-white/8 pt-5 text-sm text-muted-foreground">
			Sign in to join the discussion.
		</div>
	{/if}

	<div class="border-t border-white/8 pt-5">
		{#if comments.length === 0}
			<p class="text-sm leading-6 text-muted-foreground">No comments yet.</p>
		{:else}
			<div class="section-list max-h-[28rem] overflow-y-auto pr-1">
				{#each comments as comment (comment.id)}
					<article class="section-row">
						<div class="flex items-start gap-3">
							<Avatar
								{ndk}
								pubkey={comment.pubkey}
								class="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
							/>

							<div class="min-w-0 flex-1">
								<div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
									<div class="truncate font-medium">
										<Name {ndk} pubkey={comment.pubkey} />
									</div>
									<div class="text-xs text-muted-foreground">
										{formatDate(comment.created_at)}
									</div>
								</div>

								<p class="mt-3 max-w-[72ch] whitespace-pre-wrap text-sm leading-7 text-foreground/86">
									{comment.content}
								</p>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</section>
