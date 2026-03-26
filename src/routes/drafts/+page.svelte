<script lang="ts">
	import Login from '../Login.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ndk } from '$lib/ndk.svelte';
	import {
		deleteWikiDraft,
		getWikiDraftLiveHref,
		getWikiDraftResumeHref,
		listWikiDraftsForAuthor,
		removeWikiDraftById,
		type WikiDraftRecord
	} from '$lib/drafts/wiki-drafts';

	let drafts = $state<WikiDraftRecord[]>([]);
	let loading = $state(false);
	let error = $state<string | undefined>(undefined);
	let deletingDraftId = $state<string | undefined>(undefined);

	const currentUser = $derived(ndk.$currentUser);
	const dateFormat = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	$effect(() => {
		const user = currentUser;
		if (!user) {
			drafts = [];
			error = undefined;
			loading = false;
			return;
		}

		let cancelled = false;
		loading = true;
		error = undefined;

		listWikiDraftsForAuthor(ndk, user.pubkey)
			.then((records) => {
				if (cancelled) return;
				drafts = records;
			})
			.catch((loadError) => {
				if (cancelled) return;
				console.error('Failed to load drafts:', loadError);
				error = 'Could not load your drafts.';
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});

		return () => {
			cancelled = true;
		};
	});

	async function deleteDraft(record: WikiDraftRecord) {
		if (deletingDraftId) return;
		if (!window.confirm(`Delete the draft "${record.title}"?`)) return;

		deletingDraftId = record.draftId;

		try {
			await deleteWikiDraft(ndk, record.draftId);
			drafts = removeWikiDraftById(drafts, record.draftId);
		} catch (deleteError) {
			console.error('Failed to delete draft:', deleteError);
			error = 'Could not delete that draft.';
		} finally {
			deletingDraftId = undefined;
		}
	}
</script>

<div class="page-shell-content px-4 pb-16 pt-8 sm:px-6">
	<section class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div class="space-y-3">
			<p class="eyebrow">Drafts</p>
			<h1>Draft Manager</h1>
			<p class="max-w-2xl text-sm text-muted-foreground sm:text-base">
				Private NIP-37 composer drafts for new topics and entry revisions.
			</p>
		</div>

		{#if currentUser}
			<Button href="/new" class="rounded-full px-6">New entry</Button>
		{/if}
	</section>

	{#if !currentUser}
		<div class="compose-frame rounded-2xl p-6 sm:p-8">
			<h2 class="text-xl font-semibold">Sign in to view drafts</h2>
			<p class="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
				Drafts are encrypted and tied to your current Nostr identity. Sign in to resume or
				delete them.
			</p>
			<div class="mt-6">
				<Login />
			</div>
		</div>
	{:else if loading}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">Loading drafts...</div>
	{:else if error}
		<div class="surface-inset rounded-2xl px-6 py-8 text-sm text-red-200/90">{error}</div>
	{:else if drafts.length === 0}
		<div class="surface-inset rounded-2xl px-6 py-8 text-muted-foreground">
			No drafts yet. Start a new entry or open an article to begin revising it.
		</div>
	{:else}
		<div class="section-list">
			{#each drafts as record (record.draftId)}
				<article class="section-row">
					<div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-2">
								<h2 class="text-xl">{record.title}</h2>
								<span class="chrome-pill rounded-full px-3 py-1.5 text-xs text-muted-foreground">
									{record.origin === 'edit' ? 'Revision draft' : 'New topic draft'}
								</span>
								{#if record.category}
									<span class="chrome-pill rounded-full px-3 py-1.5 text-xs text-muted-foreground">
										{record.category}
									</span>
								{/if}
							</div>

							<p class="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
								{record.publishable
									? 'Ready to publish.'
									: record.publishabilityMessage || 'Needs cleanup before publishing.'}
							</p>

							<div class="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
								<span>Last saved {dateFormat.format(new Date(record.updatedAt * 1000))}</span>
								<span>{record.content.trim() ? record.content.trim().split(/\s+/).length : 0} words</span>
							</div>
						</div>

						<div class="flex flex-col gap-3 sm:flex-row">
							{#if getWikiDraftResumeHref(record)}
								<Button href={getWikiDraftResumeHref(record)} class="rounded-full px-5">
									Resume
								</Button>
							{/if}

							{#if getWikiDraftLiveHref(record)}
								<Button
									href={getWikiDraftLiveHref(record)}
									variant="ghost"
									class="rounded-full px-5 text-muted-foreground hover:text-foreground"
								>
									Open live entry
								</Button>
							{/if}

							<button
								type="button"
								class="rounded-full border border-white/10 px-5 py-2 text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
								onclick={() => void deleteDraft(record)}
								disabled={deletingDraftId === record.draftId}
							>
								{deletingDraftId === record.draftId ? 'Deleting...' : 'Delete'}
							</button>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>
