<script lang="ts">
	import PageContainer from '$lib/components/PageContainer.svelte';
	import { ndk } from '$lib/ndk.svelte';
	import { extractMarkupTitle } from '$lib/utils/markup';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import { NDKKind, type NDKEvent } from '@nostr-dev-kit/ndk';
	import Name from '$lib/components/Name.svelte';
	import { nip19 } from 'nostr-tools';

	type CommentTarget = {
		address: string;
		href?: string;
		title: string;
		topic?: string;
		authorPubkey?: string;
		loading: boolean;
	};

	const RECENT_COMMENT_LIMIT = 150;

	let commentTargets = $state<Record<string, CommentTarget>>({});

	const recentCommentsSub = ndk.$subscribe(() => ({
		filters: [
			{
				kinds: [1111 as number],
				'#K': [String(NDKKind.Wiki)],
				limit: RECENT_COMMENT_LIMIT
			}
		],
		subId: 'recent-wiki-comments'
	}));

	const recentComments = $derived.by(() => {
		return Array.from(recentCommentsSub.events ?? []).sort(
			(a, b) => (b.created_at ?? 0) - (a.created_at ?? 0)
		);
	});

	$effect(() => {
		let cancelled = false;

		for (const comment of recentComments) {
			const targetTag = getAddressTag(comment);
			const address = targetTag?.[1];
			const relayHint = targetTag?.[2];

			if (!address || commentTargets[address]) continue;

			const parsedAddress = parseAddress(address);
			if (!parsedAddress) {
				commentTargets = {
					...commentTargets,
					[address]: {
						address,
						title: 'Unknown entry',
						loading: false
					}
				};
				continue;
			}

			const encodedAddress = nip19.naddrEncode({
				...parsedAddress,
				...(relayHint ? { relays: [relayHint] } : {})
			});

			commentTargets = {
				...commentTargets,
				[address]: {
					address,
					href: `/a/${encodedAddress}`,
					title: parsedAddress.identifier || 'Untitled',
					topic: parsedAddress.identifier || undefined,
					authorPubkey: parsedAddress.pubkey,
					loading: true
				}
			};

			ndk
				.fetchEvent(encodedAddress)
				.then((event) => {
					if (cancelled) return;

					commentTargets = {
						...commentTargets,
						[address]: buildCommentTarget(address, encodedAddress, parsedAddress.pubkey, event)
					};
				})
				.catch(() => {
					if (cancelled) return;

					commentTargets = {
						...commentTargets,
						[address]: {
							address,
							href: `/a/${encodedAddress}`,
							title: parsedAddress.identifier || 'Untitled',
							topic: parsedAddress.identifier || undefined,
							authorPubkey: parsedAddress.pubkey,
							loading: false
						}
					};
				});
		}

		return () => {
			cancelled = true;
		};
	});

	function getAddressTag(comment: NDKEvent) {
		return comment.getMatchingTags('a')[0] ?? comment.getMatchingTags('A')[0];
	}

	function getCommentTarget(comment: NDKEvent) {
		const address = getAddressTag(comment)?.[1];
		return address ? commentTargets[address] : undefined;
	}

	function buildCommentTarget(
		address: string,
		encodedAddress: string,
		fallbackPubkey: string,
		event: NDKEvent | null | undefined
	): CommentTarget {
		if (!event) {
			return {
				address,
				href: `/a/${encodedAddress}`,
				title: 'Untitled',
				authorPubkey: fallbackPubkey,
				loading: false
			};
		}

		return {
			address,
			href: `/a/${event.encode() || encodedAddress}`,
			title: event.tagValue('title') || extractMarkupTitle(event.content) || event.dTag || 'Untitled',
			topic: event.dTag || undefined,
			authorPubkey: event.pubkey || fallbackPubkey,
			loading: false
		};
	}

	function parseAddress(address: string) {
		const [kindValue, pubkey, ...identifierParts] = address.split(':');
		const identifier = identifierParts.join(':');
		const kind = Number(kindValue);

		if (!Number.isFinite(kind) || !pubkey || !identifier) return undefined;

		return {
			kind,
			pubkey,
			identifier
		};
	}

	function formatDate(createdAt?: number) {
		if (!createdAt) return 'Unknown date';
		return new Date(createdAt * 1000).toLocaleString();
	}
</script>

<svelte:head>
	<title>Recent Comments • Wikifreedia</title>
	<meta
		name="description"
		content="Recent comments across Wikifreedia entries, filtered to wiki article discussions."
	/>
</svelte:head>

<PageContainer class="py-6">
	<section>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="text-[2.2rem] leading-[1.1]">Recent comments</h1>
				<p class="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
					Live discussion from across wiki entries.
				</p>
			</div>

			<div class="text-sm text-muted-foreground">{recentComments.length} shown</div>
		</div>

		{#if recentComments.length === 0}
			<div class="surface-inset mt-6 rounded-xl px-5 py-6 text-sm text-muted-foreground">
				No wiki comments have shown up yet.
			</div>
		{:else}
			<div class="section-list mt-6">
				{#each recentComments as comment (comment.id)}
					{@const target = getCommentTarget(comment)}
					<article class="section-row">
						<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
							<div class="min-w-0">
									{#if target?.href}
									<a href={target.href} class="subtle-link block">
										<h2 class="display-wordmark text-[1.15rem] leading-none sm:text-[1.25rem]">
											{target.title}
										</h2>
									</a>
								{:else if target?.loading}
									<h2 class="text-xl text-foreground">Resolving entry...</h2>
								{:else}
									<h2 class="text-xl text-foreground">Unknown entry</h2>
								{/if}

								<div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
									<div class="flex items-center gap-3">
										<Avatar
											{ndk}
											pubkey={comment.pubkey}
											class="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
										/>
										<div>
											<div class="font-medium text-foreground">
												<Name {ndk} pubkey={comment.pubkey} />
											</div>
											<div class="text-xs text-muted-foreground">Comment author</div>
										</div>
									</div>

									{#if target?.authorPubkey}
										<div class="text-xs uppercase tracking-[0.24em] text-muted-foreground/70">
											On version by <Name {ndk} pubkey={target.authorPubkey} class="inline normal-case tracking-normal" />
										</div>
									{/if}

									{#if target?.topic}
										<div class="text-xs uppercase tracking-[0.24em] text-muted-foreground/70">
											Topic {target.topic}
										</div>
									{/if}
								</div>
							</div>

							<div class="text-sm text-muted-foreground">{formatDate(comment.created_at)}</div>
						</div>

						<p class="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground/86">
							{comment.content}
						</p>

						{#if target?.href}
							<div class="mt-4">
								<a href={target.href} class="subtle-link text-sm">Open entry</a>
							</div>
						{/if}
					</article>
				{/each}
			</div>
		{/if}
	</section>
</PageContainer>
