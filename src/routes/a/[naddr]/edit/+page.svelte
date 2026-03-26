<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DraftConflictDialog from '$lib/components/DraftConflictDialog.svelte';
	import { ndk } from '$lib/ndk.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		deleteWikiDraft,
		findMatchingWikiDraft,
		listWikiDraftsForAuthor,
		loadWikiDraftById,
		removeWikiDraftById,
		saveWikiDraft,
		upsertActiveWikiDraft,
		type WikiDraftRecord
	} from '$lib/drafts/wiki-drafts';
	import { NDKEvent } from '@nostr-dev-kit/ndk';
	import Editor from '../Editor.svelte';
	import EntryCard from '$lib/components/EntryCard.svelte';

	type DeferredAction = 'autosave' | 'manual-save' | 'publish';

	let baseEvent = $state<NDKEvent | undefined>(undefined);
	let newContent = $state(false);
	let title = $state('');
	let category = $state('');
	let saving = $state(false);
	let publishable = $state(true);
	let statusMessage = $state('');
	let subscriptionKind = $state<number | undefined>(undefined);
	let subscriptionDTag = $state<string | undefined>(undefined);
	let subscriptionAuthor = $state<string | undefined>(undefined);
	let content = $state('');
	let preview = $state(false);
	let drafts = $state<WikiDraftRecord[]>([]);
	let activeDraft = $state<WikiDraftRecord | undefined>(undefined);
	let loadingDrafts = $state(false);
	let loadDraftError = $state<string | undefined>(undefined);
	let draftSaveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let draftSaveError = $state('');
	let lastDraftSavedAt = $state<number | undefined>(undefined);
	let conflictDraft = $state<WikiDraftRecord | undefined>(undefined);
	let conflictDialogOpen = $state(false);
	let bypassedConflictKey = $state<string | undefined>(undefined);
	let deferredAction = $state<DeferredAction | undefined>(undefined);
	let lastSavedSnapshot = $state(createSnapshot({ title: '', category: '', content: '' }));

	let autosaveTimer: ReturnType<typeof setTimeout> | undefined;
	let applyingDraftState = false;

	const currentUser = $derived(ndk.$sessions?.currentUser);
	const requestedDraftId = $derived($page.url.searchParams.get('draft')?.trim() || undefined);
	const currentTargetAddress = $derived(baseEvent?.tagAddress());
	const currentDraftKey = $derived(currentTargetAddress ? `edit:${currentTargetAddress}` : undefined);
	const currentSnapshot = $derived(
		createSnapshot({
			title,
			category,
			content,
			draftId: activeDraft?.draftId,
			key: currentDraftKey
		})
	);
	const hasUnsavedChanges = $derived(currentSnapshot !== lastSavedSnapshot);
	const previewEvent = $derived.by(() => {
		if (!baseEvent) return undefined;

		const event = new NDKEvent(ndk, baseEvent.rawEvent());
		event.content = content;
		event.removeTag('title');
		if (title.trim()) event.tags.push(['title', title.trim()]);
		event.removeTag('c');
		if (category.trim()) event.tags.push(['c', category.trim()]);
		return event;
	});
	const draftStatusText = $derived.by(() => {
		if (loadDraftError) return loadDraftError;
		if (!baseEvent) return 'Loading the current entry...';
		if (!currentUser) return 'Sign in to save drafts and publish updates.';
		if (draftSaveState === 'saving') return 'Saving draft...';
		if (draftSaveState === 'error') return draftSaveError || 'Draft save failed.';
		if (lastDraftSavedAt) {
			return `Draft saved ${new Intl.DateTimeFormat(undefined, {
				dateStyle: 'medium',
				timeStyle: 'short'
			}).format(new Date(lastDraftSavedAt * 1000))}.`;
		}
		if (loadingDrafts) return 'Loading your drafts...';
		return 'Autosave keeps this revision in a private draft while you work.';
	});

	beforeNavigate((navigation) => {
		if (typeof window === 'undefined') return;
		if (!(hasUnsavedChanges && (draftSaveState === 'saving' || draftSaveState === 'error'))) return;

		if (!window.confirm('You still have unsaved draft changes. Leave this page anyway?')) {
			navigation.cancel();
		}
	});

	$effect(() => {
		if (
			typeof window === 'undefined' ||
			!(hasUnsavedChanges && (draftSaveState === 'saving' || draftSaveState === 'error'))
		) {
			return;
		}

		function handleBeforeUnload(event: BeforeUnloadEvent) {
			event.preventDefault();
			event.returnValue = '';
		}

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	});

	const events = ndk.$subscribe(() => {
		if (!subscriptionKind || !subscriptionDTag || !subscriptionAuthor) return undefined;

		return {
			filters: [
				{
					kinds: [subscriptionKind],
					'#d': [subscriptionDTag],
					authors: [subscriptionAuthor]
				}
			],
			subId: 'edit-page-event'
		};
	});

	$effect(() => {
		const currentNaddr = $page.params.naddr;
		if (!currentNaddr) return;

		let cancelled = false;

		baseEvent = undefined;
		activeDraft = undefined;
		title = '';
		category = '';
		content = '';
		loadDraftError = undefined;
		draftSaveState = 'idle';
		draftSaveError = '';
		lastDraftSavedAt = undefined;
		subscriptionKind = undefined;
		subscriptionDTag = undefined;
		subscriptionAuthor = undefined;
		lastSavedSnapshot = createSnapshot({ title: '', category: '', content: '' });

		ndk.fetchEvent(currentNaddr).then((fetchedEvent) => {
			if (cancelled || !fetchedEvent) {
				if (!cancelled) loadDraftError = 'Entry not found.';
				return;
			}

			applyLiveEvent(fetchedEvent, true);
		});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		const user = currentUser;
		if (!user) {
			drafts = [];
			return;
		}

		let cancelled = false;
		loadingDrafts = true;

		listWikiDraftsForAuthor(ndk, user.pubkey)
			.then((records) => {
				if (cancelled) return;
				drafts = records;
			})
			.catch((error) => {
				if (cancelled) return;
				console.error('Failed to load drafts:', error);
				loadDraftError = 'Could not load drafts.';
			})
			.finally(() => {
				if (!cancelled) loadingDrafts = false;
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		const draftId = requestedDraftId;
		const user = currentUser;
		const targetAddress = currentTargetAddress;
		if (!draftId || !user || !targetAddress) return;

		let cancelled = false;

		loadWikiDraftById(ndk, user.pubkey, draftId)
			.then((record) => {
				if (cancelled) return;
				if (!record) {
					loadDraftError = 'Draft not found.';
					return;
				}

				if (record.key !== `edit:${targetAddress}`) {
					loadDraftError = 'That draft belongs to a different entry.';
					return;
				}

				drafts = upsertActiveWikiDraft(drafts, record);
				applyDraftRecord(record);
				loadDraftError = undefined;
			})
			.catch((error) => {
				if (cancelled) return;
				console.error('Failed to load draft:', error);
				loadDraftError = 'Could not load draft.';
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (bypassedConflictKey && bypassedConflictKey !== currentDraftKey) {
			bypassedConflictKey = undefined;
		}
	});

	$effect(() => {
		if (!baseEvent || requestedDraftId || activeDraft || conflictDialogOpen || bypassedConflictKey === currentDraftKey) {
			return;
		}

		const conflict = findMatchingWikiDraft(drafts, currentDraftKey);
		if (!conflict) return;

		conflictDraft = conflict;
		conflictDialogOpen = true;
	});

	$effect(() => {
		if (!events) return;

		const latest = Array.from(events.events).sort((a, b) => {
			const timeDiff = (b.created_at ?? 0) - (a.created_at ?? 0);
			if (timeDiff !== 0) return timeDiff;
			return b.content.length - a.content.length;
		})[0];

		if (!latest || (baseEvent?.id === latest.id && baseEvent.created_at === latest.created_at)) {
			return;
		}

		applyLiveEvent(latest, !activeDraft && !hasUnsavedChanges);
	});

	$effect(() => {
		clearAutosaveTimer();

		if (
			applyingDraftState ||
			!currentUser ||
			!currentDraftKey ||
			!hasUnsavedChanges ||
			saving ||
			conflictDialogOpen ||
			bypassedConflictKey === currentDraftKey
		) {
			return;
		}

		autosaveTimer = setTimeout(() => {
			void persistDraft('autosave');
		}, 2000);

		return () => clearAutosaveTimer();
	});

	function clearAutosaveTimer() {
		if (autosaveTimer) {
			clearTimeout(autosaveTimer);
			autosaveTimer = undefined;
		}
	}

	function applyLiveEvent(event: NDKEvent, resetComposer: boolean) {
		baseEvent = event;
		subscriptionKind = event.kind;
		subscriptionDTag = event.dTag ?? undefined;
		subscriptionAuthor = event.pubkey;

		if (!resetComposer) return;

		applyingDraftState = true;
		title = event.tagValue('title') || event.dTag || '';
		category = event.tagValue('c') ?? '';
		content = event.content;
		newContent = false;
		activeDraft = undefined;
		lastDraftSavedAt = undefined;
		draftSaveState = 'idle';
		draftSaveError = '';
		lastSavedSnapshot = createSnapshot({
			title,
			category,
			content,
			key: `edit:${event.tagAddress()}`
		});
		syncDraftQueryParam(undefined);

		queueMicrotask(() => {
			applyingDraftState = false;
		});
	}

	function applyDraftRecord(record: WikiDraftRecord) {
		applyingDraftState = true;
		activeDraft = record;
		title = record.title;
		category = record.category;
		content = record.content;
		newContent = false;
		preview = false;
		lastDraftSavedAt = record.updatedAt;
		draftSaveState = 'saved';
		draftSaveError = '';
		lastSavedSnapshot = createSnapshot({
			title: record.title,
			category: record.category,
			content: record.content,
			draftId: record.draftId,
			key: record.key
		});
		syncDraftQueryParam(record.draftId);

		queueMicrotask(() => {
			applyingDraftState = false;
		});
	}

	async function persistDraft(reason: Exclude<DeferredAction, 'publish'>): Promise<boolean> {
		clearAutosaveTimer();

		if (!currentUser || !baseEvent || !baseEvent.dTag) {
			if (reason === 'manual-save') {
				draftSaveState = 'error';
				draftSaveError = 'Sign in to save drafts.';
			}
			return false;
		}

		if (reason === 'autosave' && bypassedConflictKey === currentDraftKey) {
			return false;
		}

		if (!(await ensureDraftConflictResolved(reason))) {
			return false;
		}

		draftSaveState = 'saving';
		draftSaveError = '';

		try {
			const record = await saveWikiDraft(ndk, {
				draftId: activeDraft?.draftId,
				title,
				category,
				content,
				dTag: baseEvent.dTag,
				targetAddress: baseEvent.tagAddress()
			});
			activeDraft = record;
			drafts = upsertActiveWikiDraft(drafts, record);
			lastDraftSavedAt = record.updatedAt;
			draftSaveState = 'saved';
			lastSavedSnapshot = createSnapshot({
				title,
				category,
				content,
				draftId: record.draftId,
				key: record.key
			});
			syncDraftQueryParam(record.draftId);
			return true;
		} catch (error) {
			console.error('Failed to save draft:', error);
			draftSaveState = 'error';
			draftSaveError = 'Could not save draft.';
			return false;
		}
	}

	async function publishUpdate(skipConflictCheck = false) {
		if (!baseEvent || !currentUser) return;

		clearAutosaveTimer();

		if (!skipConflictCheck && !(await ensureDraftConflictResolved('publish'))) {
			return;
		}

		saving = true;

		try {
			const published = new NDKEvent(ndk, baseEvent.rawEvent());
			const originalAuthor = baseEvent.pubkey;

			if (originalAuthor !== currentUser.pubkey) {
				published.removeTag('e');
				published.removeTag('a');
				published.tag(baseEvent, 'fork');
			}

			published.id = '';
			published.sig = '';
			published.created_at = undefined;
			published.author = currentUser;
			published.content = content;
			published.removeTag('title');
			if (title.trim()) published.tags.push(['title', title.trim()]);
			published.removeTag('c');
			if (category.trim()) published.tags.push(['c', category.trim()]);
			published.removeTag('published_at');
			published.tags.push(['published_at', Math.floor(Date.now() / 1000).toString()]);
			published.alt = `This is a wiki article about ${title || baseEvent.dTag || 'Untitled'}\n\nYou can read it on https://wikifreedia.xyz/a/${published.encode()}`;

			await published.publishReplaceable();

			if (activeDraft) {
				try {
					await deleteWikiDraft(ndk, activeDraft.draftId);
					drafts = removeWikiDraftById(drafts, activeDraft.draftId);
				} catch (error) {
					console.error('Failed to delete published draft:', error);
				}
			}

			goto(`/${published.dTag}/${published.author.npub}`);
		} catch (error) {
			console.error('Failed to publish entry update:', error);
			saving = false;
		}
	}

	async function ensureDraftConflictResolved(action: DeferredAction): Promise<boolean> {
		const conflict = findMatchingWikiDraft(drafts, currentDraftKey, activeDraft?.draftId);
		if (!conflict) return true;

		conflictDraft = conflict;
		conflictDialogOpen = true;
		deferredAction = action;

		if (action === 'manual-save') {
			draftSaveState = 'idle';
			draftSaveError = '';
		}

		return false;
	}

	async function resumeConflictingDraft() {
		const draft = conflictDraft;
		conflictDraft = undefined;
		conflictDialogOpen = false;
		deferredAction = undefined;
		bypassedConflictKey = undefined;

		if (!draft) return;
		applyDraftRecord(draft);
	}

	async function replaceConflictingDraft() {
		const draft = conflictDraft;
		const nextAction = deferredAction;

		conflictDraft = undefined;
		conflictDialogOpen = false;
		deferredAction = undefined;
		bypassedConflictKey = undefined;

		if (!draft) return;

		try {
			await deleteWikiDraft(ndk, draft.draftId);
			drafts = removeWikiDraftById(drafts, draft.draftId);
		} catch (error) {
			console.error('Failed to replace draft:', error);
			draftSaveState = 'error';
			draftSaveError = 'Could not replace the existing draft.';
			return;
		}

		if (nextAction === 'publish') {
			await publishUpdate(true);
		} else if (nextAction) {
			await persistDraft(nextAction);
		}
	}

	function cancelConflictDialog() {
		bypassedConflictKey = conflictDraft?.key;
		conflictDraft = undefined;
		conflictDialogOpen = false;
		deferredAction = undefined;
	}

	function togglePreview() {
		preview = !preview;
	}

	function syncDraftQueryParam(draftId: string | undefined) {
		if (typeof window === 'undefined') return;

		const url = new URL(window.location.href);
		if (draftId) url.searchParams.set('draft', draftId);
		else url.searchParams.delete('draft');

		window.history.replaceState(window.history.state, '', url);
	}

	function createSnapshot(input: {
		title: string;
		category: string;
		content: string;
		draftId?: string;
		key?: string;
	}) {
		return JSON.stringify({
			title: input.title,
			category: input.category,
			content: input.content,
			draftId: input.draftId ?? '',
			key: input.key ?? ''
		});
	}
</script>

{#if baseEvent}
	<div class="page-shell-content px-4 pb-16 pt-6 sm:px-6">
		<section class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
			<div class="max-w-3xl space-y-3">
				<p class="eyebrow">Revision</p>
				<h1>Edit Entry</h1>
				<p class="max-w-2xl text-sm text-muted-foreground sm:text-base">
					Revise the piece in the same surface readers will feel. Title, structure, and body stay
					together while metadata remains out of sight.
				</p>
			</div>

			<div
				class="chrome-pill self-start rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground"
			>
				{preview ? 'Previewing' : activeDraft ? 'Editing saved draft' : 'Editing live version'}
			</div>
		</section>

		<p class="mb-5 text-sm text-muted-foreground">{draftStatusText}</p>

		<div class="compose-frame rounded-2xl p-5 sm:p-6 lg:p-8">
			{#key `${activeDraft?.draftId ?? baseEvent.id}:${preview}`}
				{#if !preview}
					<Editor
						bind:content
						bind:newContent
						bind:publishable
						bind:statusMessage
						bind:title
						bind:category
					/>
				{:else if previewEvent}
					<div class="rounded-xl border border-white/10 bg-black/20 p-4 sm:p-6">
						<EntryCard event={previewEvent} skipEdit={true} />
					</div>
				{/if}

				<div
					class="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
				>
					<p class="max-w-xl text-sm text-muted-foreground">
						{#if !publishable && statusMessage}
							{statusMessage}
						{:else if preview}
							Preview the article as readers will see it, then return to the editor for the next
							pass.
						{:else}
							Save a private draft while you work, then publish when the next version is ready.
						{/if}
					</p>

					<div class="flex flex-col gap-3 sm:flex-row">
						<Button
							variant="ghost"
							onclick={togglePreview}
							class="rounded-full px-6 text-muted-foreground hover:text-foreground"
						>
							{preview ? 'Back to Editor' : 'Preview'}
						</Button>

						<button
							type="button"
							class="rounded-full border border-white/10 px-6 py-2 text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
							onclick={() => void persistDraft('manual-save')}
							disabled={!currentUser || draftSaveState === 'saving'}
						>
							{draftSaveState === 'saving' ? 'Saving...' : 'Save draft'}
						</button>

						<button
							class="nav-cta disabled:pointer-events-none disabled:opacity-40"
							onclick={() => void publishUpdate()}
							disabled={!currentUser || !publishable || saving}
						>
							{saving ? 'Publishing...' : 'Publish update'}
						</button>
					</div>
				</div>
			{/key}
		</div>
	</div>
{:else}
	<div class="page-shell-content px-4 pb-16 pt-6 text-muted-foreground sm:px-6">
		{loadDraftError || 'Looking for entry'}
	</div>
{/if}

<DraftConflictDialog
	bind:open={conflictDialogOpen}
	title="A draft already exists for this entry"
	description="You can resume the saved revision draft or replace it with the live version currently loaded in the editor."
	draftTitle={conflictDraft?.title}
	updatedAt={conflictDraft?.updatedAt}
	onresume={resumeConflictingDraft}
	onreplace={replaceConflictingDraft}
	oncancel={cancelConflictDialog}
/>
