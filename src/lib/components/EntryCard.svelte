<script lang="ts">
	import { ndk } from '@/ndk.svelte';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import { NDKEvent, type NostrEvent } from '@nostr-dev-kit/ndk';
	import ArticleComments from '@/components/ArticleComments.svelte';
	import ArticleOtherAuthors from '@/components/ArticleOtherAuthors.svelte';
	import ArticleToc from '@/components/ArticleToc.svelte';
	import EntryCardSupportFooter from './EntryCardSupportFooter.svelte';
	import EntryReactions from './EntryReactions.svelte';
	import EventContent from '@/components/EventContent.svelte';
	import Input from './ui/input/input.svelte';
	import Name from '@/components/Name.svelte';
	import Button from '@/components/ui/button/button.svelte';
	import { extractMarkupHeadings, extractMarkupTitle } from '@/utils/markup';

	let currentUser = $derived(ndk.$sessions?.currentUser);

	let {
		skipTitle = false,
		event,
		skipEdit = false,
		otherVersions = undefined
	}: {
		skipTitle?: boolean;
		event: NDKEvent;
		skipEdit?: boolean;
		otherVersions?: Subscription<NDKEvent>;
	} = $props();

	const title = $derived(
		event.tagValue('title') || extractMarkupTitle(event.content) || event.dTag || 'Untitled'
	);
	let forkPubkey = $state<string | undefined>(undefined);
	let fork = $state<NDKEvent | undefined>(undefined);
	let showRaw = $state(false);
	let reactionCount = $state<number | undefined>(undefined);
	let copied = $state(false);

	const fallbackVersions = ndk.$subscribe(() => {
		if (otherVersions || !event.dTag || !event.kind) return undefined;

		return {
			filters: [{ kinds: [event.kind], '#d': [event.dTag] }],
			subId: `article-versions-${event.id}`
		};
	});

	const versionEvents = $derived(
		Array.from(otherVersions?.events ?? fallbackVersions.events ?? [])
	);

	const relatedVersions = $derived.by(() => {
		const latestByAuthor = new Map<string, NDKEvent>();

		for (const version of versionEvents) {
			if (version.id === event.id) continue;
			if (version.getMatchingTags('a').some((tag) => tag[3] === 'defer')) continue;

			const existing = latestByAuthor.get(version.pubkey);
			if (!existing || (version.created_at ?? 0) > (existing.created_at ?? 0)) {
				latestByAuthor.set(version.pubkey, version);
			}
		}

		return Array.from(latestByAuthor.values()).sort(
			(a, b) => (b.created_at ?? 0) - (a.created_at ?? 0)
		);
	});

	const tocHeadings = $derived.by(() => {
		return extractMarkupHeadings(event.content)
			.filter((heading) => heading.level >= 2 && heading.level <= 3)
			.filter((heading, index) => !(index === 0 && heading.text === title));
	});

	const hasToc = $derived(tocHeadings.length > 0);

	$effect(() => {
		const forkValue = event.getMatchingTags('a').find((tag) => tag[3] === 'fork');
		if (!forkValue) return;

		const forkId = event.getMatchingTags('e').find((tag) => tag[3] === 'fork')?.[1];
		if (!forkId) return;

		ndk.fetchEvents({ ids: [forkId] }).then((fetchedEvents) => {
			if (fetchedEvents.size === 0) return;
			fork = Array.from(fetchedEvents)[0];
			forkPubkey = fork.pubkey;
		});
	});

	async function requestMerge() {
		if (!fork) return;

		const content = prompt(
			'Optionally provide a message to the author of the original entry on what was changed'
		);
		const merge = new NDKEvent(ndk, {
			content,
			kind: 818
		} as NostrEvent);
		merge.tag(fork);
		merge.tags.push(['e', event.id, event.relay?.url ?? '', 'fork']);
		await merge.publish();
	}

	async function copyPermalink() {
		if (typeof navigator === 'undefined' || !navigator.clipboard) return;
		await navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1500);
	}

	const reactions = ndk.$subscribe(() => ({
		filters: [{ kinds: [7], ...event.filter() }],
		subId: 'entry-reactions'
	}));

	function formatDate(createdAt?: number) {
		if (!createdAt) return 'Unknown date';
		return new Date(createdAt * 1000).toLocaleDateString();
	}
</script>

<div
	class={hasToc
		? 'grid gap-8 xl:grid-cols-[200px_minmax(0,54rem)_300px] 2xl:grid-cols-[220px_minmax(0,56rem)_320px] xl:justify-center'
		: 'grid gap-8 xl:grid-cols-[minmax(0,56rem)_300px] xl:justify-center'}
>
	{#if hasToc}
		<aside class="hidden xl:block">
			<div class="sticky top-32">
				<ArticleToc headings={tocHeadings} />
			</div>
		</aside>
	{/if}

	<article class="min-w-0">
		<div
			class="flex flex-col gap-4 border-b border-white/8 pb-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="flex flex-wrap items-center gap-3">
				<span class="eyebrow">Community revision</span>
				<span>Updated {formatDate(event.created_at)}</span>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<Button href={'/' + encodeURIComponent(event.dTag || '')} variant="ghost" size="sm">
					All versions
				</Button>
				<Button on:click={copyPermalink} variant="ghost" size="sm">
					{copied ? 'Copied' : 'Copy link'}
				</Button>
				<div class:hidden={skipEdit}>
					<Button href={'/a/' + event.encode() + '/edit'} size="sm">Edit</Button>
				</div>
			</div>
		</div>

		<div class="mt-7">
			<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
				<a href={'/p/' + event.author.npub} class="flex items-center gap-3">
					<Avatar
						{ndk}
						pubkey={event.pubkey}
						class="h-11 w-11 rounded-full object-cover ring-1 ring-white/10"
					/>
					<div>
						<div class="font-medium text-foreground">
							<Name {ndk} pubkey={event.pubkey} />
						</div>
						<div class="text-xs text-muted-foreground">
							Published {formatDate(event.created_at)}
						</div>
					</div>
				</a>

				{#if reactionCount}
					<div>{reactionCount} {reactionCount === 1 ? 'reaction' : 'reactions'}</div>
				{/if}

				{#if fork}
					<a href={'/a/' + fork.encode()} class="subtle-link flex gap-1">
						Forked from <Name {ndk} pubkey={forkPubkey} class="inline" />
					</a>
				{/if}
			</div>

			{#if !skipTitle}
				<h1 class="mt-8 max-w-[14ch] break-words text-[clamp(3rem,6.4vw,4.95rem)] leading-[0.92]">
					{title}
				</h1>
			{/if}

			{#if currentUser?.pubkey === event.pubkey && fork}
				<div class="mt-5">
					<Button on:click={requestMerge} variant="outline" size="sm">Request merge</Button>
				</div>
			{/if}

			<div class="mt-8">
				<EntryReactions {event} {reactions} bind:reactionCount />
			</div>
		</div>

		<div class="mt-12 border-t border-white/8 pt-10">
			<EventContent {event} class="article-document" />
		</div>

		<div class="mt-12 space-y-6 xl:hidden">
			<ArticleToc headings={tocHeadings} />
			<ArticleOtherAuthors versions={relatedVersions} />
			<ArticleComments {event} />
		</div>

		<div class="glass-panel-soft mt-12 rounded-[2rem] px-6 py-5 sm:px-8">
			<p class="eyebrow mb-3">Article metadata</p>
			<h3 class="text-xl">About this entry</h3>

			<div class="mt-5 space-y-4">
				<div>
					<h4 class="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
						Event Id
					</h4>
					<Input value={event.encode()} readonly />
				</div>

				<div class="flex items-center justify-between gap-4">
					<h4 class="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
						Raw event
					</h4>
					<Button on:click={() => (showRaw = !showRaw)} variant="outline" size="sm">
						{showRaw ? 'Hide' : 'Open'}
					</Button>
				</div>

				{#if showRaw}
					<pre class="glass-panel-soft overflow-auto rounded-[1.5rem] p-4">
						{JSON.stringify(event.rawEvent(), null, 4)}
					</pre>
				{/if}
			</div>
		</div>
	</article>

	<aside class="hidden xl:block">
		<div class="sticky top-32 space-y-5">
			<ArticleOtherAuthors versions={relatedVersions} />
			<ArticleComments {event} />
		</div>
	</aside>
</div>

{#if currentUser && currentUser.pubkey !== event.pubkey}
	<EntryCardSupportFooter {event} />
{/if}
