<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import Name from '$lib/components/Name.svelte';
	import { NDKKind } from '@nostr-dev-kit/ndk';

	let {
		ndk,
		event,
		class: className = ''
	}: {
		ndk: NDKSvelte;
		event: NDKEvent;
		class?: string;
	} = $props();

	function truncate(value: string, maxLength = 72) {
		return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
	}

	function kindLabel(kind?: number) {
		switch (kind) {
			case NDKKind.Text:
				return 'Note';
			case NDKKind.Highlight:
				return 'Highlight';
			case 30818:
				return 'Article';
			default:
				return kind === undefined ? 'Event' : `Kind ${kind}`;
		}
	}

	const label = $derived.by(() => {
		const title = event.tagValue('title') || event.tagValue('subject');
		if (title) {
			return title;
		}

		const excerpt = event.content.replace(/\s+/g, ' ').trim();
		if (excerpt) {
			return truncate(excerpt);
		}

		return truncate(event.encode(), 32);
	});

	const href = $derived.by(() => {
		if (event.kind === 30818) {
			return `/a/${event.encode()}`;
		}

		if (event.kind === NDKKind.Highlight) {
			return `/e/${event.encode()}`;
		}

		return `nostr:${event.encode()}`;
	});
</script>

<a
	href={href}
	class={`inline-flex max-w-full items-center gap-3 rounded-2xl px-3 py-2 align-middle text-left no-underline transition-colors hover:bg-muted/40 ${className}`}
>
	<span class="rounded-full bg-muted px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
		{kindLabel(event.kind)}
	</span>
	<span class="min-w-0">
		<span class="block truncate text-sm font-medium text-foreground">{label}</span>
		<span class="block text-xs text-muted-foreground">
			<Name {ndk} npub={event.author.npub} npubMaxLength={12} />
		</span>
	</span>
</a>
