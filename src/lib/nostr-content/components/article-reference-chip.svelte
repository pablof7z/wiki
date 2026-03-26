<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import Name from '$lib/components/Name.svelte';

	const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

	let {
		ndk,
		event,
		class: className = ''
	}: {
		ndk: NDKSvelte;
		event: NDKEvent;
		class?: string;
	} = $props();

	const title = $derived(event.tagValue('title') || event.dTag || 'Untitled article');
	const href = $derived(`/a/${event.encode()}`);
	const publishedAt = $derived(
		event.created_at ? dateFormat.format(new Date(event.created_at * 1000)) : undefined
	);
</script>

<a
	href={href}
	class={`inline-flex max-w-full items-center gap-3 rounded-2xl px-3 py-2 align-middle text-left no-underline transition-colors hover:bg-muted/40 ${className}`}
>
	<span class="rounded-full bg-primary/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary">
		Article
	</span>
	<span class="min-w-0">
		<span class="block truncate text-sm font-medium text-foreground">{title}</span>
		<span class="block text-xs text-muted-foreground">
			<Name {ndk} npub={event.author.npub} npubMaxLength={12} />
			{#if publishedAt}
				<span aria-hidden="true"> · </span>
				{publishedAt}
			{/if}
		</span>
	</span>
</a>
