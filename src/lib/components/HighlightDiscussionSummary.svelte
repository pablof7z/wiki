<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { NIP22_COMMENT_KIND } from '$lib/comments/nip22';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';

	let { event }: { event: NDKEvent } = $props();

	const commentsSub = ndk.$subscribe(() => ({
		filters: [{ kinds: [NIP22_COMMENT_KIND], ...event.nip22Filter() }],
		subId: `highlight-discussion-summary-${event.id}`
	}));

	const commentCount = $derived.by(() => Array.from(commentsSub.events ?? []).length);
	const discussionHref = $derived(event.id ? `/e/${event.encode()}` : undefined);
</script>

<div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/8 pt-4">
	{#if commentCount > 0}
		<div class="text-sm text-muted-foreground">
			{commentCount} {commentCount === 1 ? 'comment' : 'comments'}
		</div>
	{/if}

	{#if discussionHref}
		<a href={discussionHref} class="subtle-link ml-auto text-sm">Enter discussion</a>
	{/if}
</div>
