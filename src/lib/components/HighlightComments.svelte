<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import {
		buildCommentThread,
		createNip22CommentEvent,
		flattenCommentThread,
		NIP22_COMMENT_KIND
	} from '$lib/comments/nip22';
	import {
		buildFallbackHighlightSourceMeta,
		getHighlightSourceReference,
		type HighlightSourceMeta,
		resolveHighlightSourceMeta
	} from '$lib/highlights/source';
	import { getHighlightContext } from '$lib/highlights/nostr';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import Name from './Name.svelte';

	let { event }: { event: NDKEvent } = $props();

	let currentUser = $derived(ndk.$currentUser);
	let newComment = $state('');
	let showComposer = $state(false);
	let replyTargetId = $state<string | undefined>(undefined);
	let replyText = $state('');
	let submitting = $state(false);
	let sourceMeta = $state<HighlightSourceMeta | undefined>(undefined);

	const sourceReference = $derived(getHighlightSourceReference(event));

	const commentsSub = ndk.$subscribe(() => ({
		filters: [{ kinds: [NIP22_COMMENT_KIND], ...event.nip22Filter() }],
		subId: `highlight-comments-${event.id}`
	}));

	const comments = $derived.by(() => {
		return Array.from(commentsSub.events ?? []).sort(
			(left, right) => (left.created_at ?? 0) - (right.created_at ?? 0)
		);
	});

	const commentThread = $derived(buildCommentThread(comments, event));
	const flattenedComments = $derived(flattenCommentThread(commentThread));
	const replyTarget = $derived(replyTargetId ? comments.find((comment) => comment.id === replyTargetId) : undefined);
	const context = $derived.by(() => {
		const value = getHighlightContext(event)?.trim();
		const quote = event.content.trim();
		return value && value !== quote ? value : undefined;
	});

	$effect(() => {
		let cancelled = false;
		const reference = sourceReference;
		const fallbackMeta = buildFallbackHighlightSourceMeta(reference);
		sourceMeta = fallbackMeta;

		void resolveHighlightSourceMeta(ndk, reference)
			.then((resolved) => {
				if (cancelled || !resolved) return;
				sourceMeta = resolved;
			})
			.catch(() => {
				if (cancelled) return;
				sourceMeta = {
					...fallbackMeta,
					loading: false
				};
			});

		return () => {
			cancelled = true;
		};
	});

	function formatDate(createdAt?: number) {
		if (!createdAt) return 'Unknown date';
		return new Date(createdAt * 1000).toLocaleString();
	}

	async function publishComment(parent: NDKEvent, content: string) {
		if (!currentUser || !content.trim()) return;

		submitting = true;

		try {
			const comment = createNip22CommentEvent(ndk, {
				root: event,
				parent,
				content
			});
			comment.author = currentUser;
			await comment.publish();
		} catch (error) {
			console.error('Failed to publish highlight comment', error);
		} finally {
			submitting = false;
		}
	}

	async function submitRootComment() {
		await publishComment(event, newComment);
		newComment = '';
		showComposer = false;
	}

	async function submitReply() {
		if (!replyTarget) return;

		await publishComment(replyTarget, replyText);
		replyTargetId = undefined;
		replyText = '';
	}
</script>

<section class="space-y-8">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="eyebrow mb-3">Highlight discussion</p>
			<h1 class="text-[2.2rem] leading-[1.02] sm:text-[2.8rem]">Discussion around this highlight</h1>
			<p class="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
				{comments.length === 0
					? 'No comments yet. Start the thread around this passage.'
					: `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'} on this highlight.`}
			</p>
		</div>

		{#if sourceMeta?.href}
			<a href={sourceMeta.href} class="subtle-link text-sm">Open entry</a>
		{/if}
	</div>

	<article class="surface-inset rounded-[2rem] px-6 py-6 sm:px-8 sm:py-7">
		<div class="flex items-start gap-3">
			<Avatar
				{ndk}
				pubkey={event.pubkey}
				class="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
			/>

			<div class="min-w-0 flex-1">
				<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div class="font-medium text-foreground">
						<Name {ndk} pubkey={event.pubkey} />
					</div>
					<div class="text-xs text-muted-foreground">
						{formatDate(event.created_at)}
					</div>
				</div>

				<blockquote class="mt-4 border-l border-[rgba(252,208,87,0.45)] pl-4 text-lg leading-8 text-foreground sm:text-[1.35rem] sm:leading-9">
					“{event.content.trim() || event.content}”
				</blockquote>

				{#if context}
					<p class="mt-4 max-w-[72ch] text-sm leading-7 text-muted-foreground">
						{context}
					</p>
				{/if}

				{#if sourceMeta}
					<div class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
						<span>Source:</span>
						{#if sourceMeta.href}
							<a href={sourceMeta.href} class="subtle-link text-foreground">
								{sourceMeta.title}
							</a>
						{:else}
							<span class="text-foreground">{sourceMeta.title}</span>
						{/if}
						{#if sourceMeta.authorPubkey}
							<span class="opacity-40">&middot;</span>
							<Name {ndk} pubkey={sourceMeta.authorPubkey} class="inline text-foreground" />
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</article>

	<section class="space-y-6">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h2 class="text-lg">Discussion</h2>
				<p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
					Threaded replies live here instead of inside the highlights list.
				</p>
			</div>

			{#if currentUser && !showComposer}
				<Button onclick={() => (showComposer = true)} size="sm" class="rounded-full px-4">
					Add comment
				</Button>
			{/if}
		</div>

		{#if currentUser && showComposer}
			<div class="space-y-3 border-t border-white/8 pt-5">
				<Textarea
					bind:value={newComment}
					class="min-h-[140px] rounded-[1.2rem] border-white/8 bg-white/[0.03] px-4 py-4 shadow-none focus-visible:ring-white/20"
					placeholder="Comment on this highlight"
				/>

				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p class="text-sm text-muted-foreground">Keep it anchored to the quoted passage.</p>
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
							class="rounded-full px-5"
							disabled={submitting || !newComment.trim()}
							onclick={submitRootComment}
						>
							{submitting ? 'Posting...' : 'Post comment'}
						</Button>
					</div>
				</div>
			</div>
		{:else if !currentUser}
			<div class="border-t border-white/8 pt-5 text-sm text-muted-foreground">
				Sign in to comment on this highlight.
			</div>
		{/if}

		<div class="border-t border-white/8 pt-6">
			{#if flattenedComments.length === 0}
				<p class="text-sm text-muted-foreground">No comments yet.</p>
			{:else}
				<div class="space-y-5">
					{#each flattenedComments as entry (entry.comment.id)}
						<article
							class="space-y-3 border-l border-white/10 pl-4"
							style={`margin-left: ${Math.min(entry.depth, 4) * 1.1}rem;`}
						>
							<div class="flex items-start gap-3">
								<Avatar
									{ndk}
									pubkey={entry.comment.pubkey}
									class="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
								/>

								<div class="min-w-0 flex-1">
									<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
										<div class="truncate text-sm font-medium">
											<Name {ndk} pubkey={entry.comment.pubkey} />
										</div>
										<div class="text-xs text-muted-foreground">
											{formatDate(entry.comment.created_at)}
										</div>
									</div>

									<p class="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/86">
										{entry.comment.content}
									</p>

									{#if currentUser}
										<div class="mt-3">
											<Button
												variant="ghost"
												size="sm"
												class="rounded-full px-3 text-muted-foreground hover:text-foreground"
												onclick={() => {
													replyTargetId =
														replyTargetId === entry.comment.id ? undefined : entry.comment.id;
													replyText = '';
												}}
											>
												{replyTargetId === entry.comment.id ? 'Cancel reply' : 'Reply'}
											</Button>
										</div>
									{/if}

									{#if replyTargetId === entry.comment.id}
										<div class="mt-3 space-y-3 border-t border-white/8 pt-3">
											<Textarea
												bind:value={replyText}
												class="min-h-[90px] rounded-[1rem] border-white/8 bg-white/[0.03] px-4 py-3 shadow-none focus-visible:ring-white/20"
												placeholder="Reply to this comment"
											/>

											<div class="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="sm"
													class="rounded-full px-4 text-muted-foreground hover:text-foreground"
													onclick={() => {
														replyTargetId = undefined;
														replyText = '';
													}}
												>
													Cancel
												</Button>
												<Button
													size="sm"
													class="rounded-full px-4"
													disabled={submitting || !replyText.trim()}
													onclick={submitReply}
												>
													{submitting ? 'Posting...' : 'Post reply'}
												</Button>
											</div>
										</div>
									{/if}
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</section>
