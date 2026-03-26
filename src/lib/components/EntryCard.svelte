<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import { NDKEvent, NDKKind, type NostrEvent } from '@nostr-dev-kit/ndk';
	import ArticleComments from '$lib/components/ArticleComments.svelte';
	import ArticleContentHighlights from '$lib/components/ArticleContentHighlights.svelte';
	import ArticleHighlights from '$lib/components/ArticleHighlights.svelte';
	import ArticleOtherAuthors from '$lib/components/ArticleOtherAuthors.svelte';
	import ArticleToc from '$lib/components/ArticleToc.svelte';
	import EntryCardSupportFooter from './EntryCardSupportFooter.svelte';
	import EntryReactions from './EntryReactions.svelte';
	import Input from './ui/input/input.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import Name from '$lib/components/Name.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { mergeUniqueEvents } from '$lib/highlights/nostr';
	import { extractMarkupHeadings, extractMarkupTitle } from '$lib/utils/markup';
	import { useNip05RouteId } from '$lib/utils/user-route.svelte';

	let currentUser = $derived(ndk.$currentUser);

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
	const authorRoute = useNip05RouteId(() => event.pubkey);
	let forkPubkey = $state<string | undefined>(undefined);
	let fork = $state<NDKEvent | undefined>(undefined);
	let showRaw = $state(false);
	let reactionCount = $state<number | undefined>(undefined);
	let copied = $state(false);
	let activeView = $state<'content' | 'comments' | 'highlights' | 'metadata'>('content');

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
	const showToc = $derived(hasToc && activeView === 'content');

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

	const exactHighlightsSub = ndk.$subscribe(() => {
		if (!event.id) return undefined;

		return {
			filters: [{ kinds: [NDKKind.Highlight], '#e': [event.id] }],
			subId: `article-highlights-exact-${event.id}`
		};
	});

	const topicHighlightsSub = ndk.$subscribe(() => {
		if (!event.dTag) return undefined;

		return {
			filters: [{ kinds: [NDKKind.Highlight], '#d': [event.dTag] }],
			subId: `article-highlights-topic-${event.dTag}`
		};
	});

	const allHighlights = $derived(mergeUniqueEvents(exactHighlightsSub.events, topicHighlightsSub.events));
	const hasHighlights = $derived(allHighlights.length > 0);
	const tabsGridClass = $derived(hasHighlights ? 'grid-cols-4 sm:max-w-xl' : 'grid-cols-3 sm:max-w-md');

	$effect(() => {
		if (!hasHighlights && activeView === 'highlights') {
			activeView = 'content';
		}
	});

	function formatDate(createdAt?: number) {
		if (!createdAt) return 'Unknown date';
		return new Date(createdAt * 1000).toLocaleDateString();
	}
</script>

<div
	class={showToc
		? 'grid gap-8 xl:grid-cols-[1fr_minmax(0,54rem)_300px] 2xl:grid-cols-[1fr_minmax(0,56rem)_320px]'
		: 'grid gap-8 xl:grid-cols-[minmax(0,56rem)_1fr]'}
>
	{#if showToc}
		<aside class="hidden xl:block">
			<div class="sticky top-32">
				<ArticleToc headings={tocHeadings} />
			</div>
		</aside>
	{/if}

	<article class="min-w-0 w-full max-w-[56rem]">
		<Tabs.Root bind:value={activeView}>
			<div class="mt-7">
				{#if !skipTitle}
					<h1 class="max-w-[14ch] break-words text-[clamp(3rem,6.4vw,4.95rem)] leading-[0.92]">
						{title}
					</h1>
				{/if}

				<div class="mt-7 flex flex-col gap-5">
					<div class="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted-foreground">
						<a href={'/p/' + (authorRoute.id || event.author.npub)} class="flex items-center gap-3">
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
							<div class="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
								{reactionCount}
								{reactionCount === 1 ? 'reaction' : 'reactions'}
							</div>
						{/if}

						{#if fork}
							<a href={'/a/' + fork.encode()} class="subtle-link flex gap-1 text-sm">
								Forked from <Name {ndk} pubkey={forkPubkey} class="inline" />
							</a>
						{/if}
					</div>

					{#if currentUser?.pubkey === event.pubkey && fork}
						<div>
							<Button onclick={requestMerge} variant="outline" size="sm" class="rounded-full px-4">
								Request merge
							</Button>
						</div>
					{/if}

					<EntryReactions {event} {reactions} bind:reactionCount />
				</div>
			</div>

			<div class="mt-4 py-2">
				<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<Tabs.List class={`grid h-auto w-full rounded-full bg-white/[0.03] p-1 ${tabsGridClass}`}>
						<Tabs.Trigger
							value="content"
							class="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] data-[state=active]:bg-white/[0.06] data-[state=active]:shadow-none"
						>
							Content
						</Tabs.Trigger>
						<Tabs.Trigger
							value="comments"
							class="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] data-[state=active]:bg-white/[0.06] data-[state=active]:shadow-none"
						>
							Comments
						</Tabs.Trigger>
						{#if hasHighlights}
							<Tabs.Trigger
								value="highlights"
								class="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] data-[state=active]:bg-white/[0.06] data-[state=active]:shadow-none"
							>
								Highlights
							</Tabs.Trigger>
						{/if}
						<Tabs.Trigger
							value="metadata"
							class="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] data-[state=active]:bg-white/[0.06] data-[state=active]:shadow-none"
						>
							Metadata
						</Tabs.Trigger>
					</Tabs.List>

					<div class="flex flex-wrap items-center gap-2 lg:justify-end">
						<Button
							href={'/' + encodeURIComponent(event.dTag || '')}
							variant="ghost"
							size="sm"
							class="rounded-full px-4 text-muted-foreground hover:text-foreground"
						>
							All versions
						</Button>
						<Button
							onclick={copyPermalink}
							variant="ghost"
							size="sm"
							class="rounded-full px-4 text-muted-foreground hover:text-foreground"
						>
							{copied ? 'Copied' : 'Copy link'}
						</Button>
						<div class:hidden={skipEdit}>
							<Button href={'/a/' + event.encode() + '/edit'} size="sm" class="rounded-full px-4">
								Edit
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-4">
				<Tabs.Content value="content" class="mt-0">
					<ArticleContentHighlights {event} highlights={allHighlights} />
				</Tabs.Content>

				<Tabs.Content value="comments" class="mt-0">
					<ArticleComments {event} />
				</Tabs.Content>

				{#if hasHighlights}
					<Tabs.Content value="highlights" class="mt-0">
						<ArticleHighlights {event} highlights={allHighlights} />
					</Tabs.Content>
				{/if}

				<Tabs.Content value="metadata" class="mt-0">
					<p class="eyebrow mb-3">Article metadata</p>
					<h3 class="text-xl">About this entry</h3>

					<div class="mt-5 space-y-4">
						<div>
							<h4
								class="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground"
							>
								Event Id
							</h4>
							<Input value={event.encode()} readonly />
						</div>

						<div class="flex items-center justify-between gap-4">
							<h4 class="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
								Raw event
							</h4>
							<Button onclick={() => (showRaw = !showRaw)} variant="outline" size="sm">
								{showRaw ? 'Hide' : 'Open'}
							</Button>
						</div>

						{#if showRaw}
							<pre class="surface-inset overflow-auto rounded-xl p-4">
									{JSON.stringify(event.rawEvent(), null, 4)}
								</pre>
						{/if}
					</div>
				</Tabs.Content>
			</div>
		</Tabs.Root>

		<div class="mt-12 space-y-6 xl:hidden">
			{#if showToc}
				<ArticleToc headings={tocHeadings} />
			{/if}
			<ArticleOtherAuthors versions={relatedVersions} />
		</div>
	</article>

	<aside class="hidden xl:block">
		<div class="sticky top-32">
			<ArticleOtherAuthors versions={relatedVersions} />
		</div>
	</aside>
</div>

{#if currentUser && currentUser.pubkey !== event.pubkey}
	<EntryCardSupportFooter {event} />
{/if}
