<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DraftConflictDialog from '$lib/components/DraftConflictDialog.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import TiptapEditor from '$lib/components/TiptapEditor.svelte';
	import { ndk } from '$lib/ndk.svelte';
	import {
		buildWikiDraftEvent,
		deleteWikiDraft,
		deriveNewWikiDraftKey,
		findMatchingWikiDraft,
		listWikiDraftsForAuthor,
		loadWikiDraftById,
		removeWikiDraftById,
		saveWikiDraft,
		upsertActiveWikiDraft,
		type WikiDraftRecord
	} from '$lib/drafts/wiki-drafts';
	import { Switch } from '$lib/components/ui/switch';
	import { wysiwyg } from '$lib/stores/settings';
	import { normalizeDTag } from '$lib/utils/dtag';
	import CategoryDropdown from '../a/[naddr]/CategoryDropdown.svelte';

	type DeferredAction = 'autosave' | 'manual-save' | 'publish';

	let title = $state('');
	let content = $state('');
	let category = $state('');
	let saving = $state(false);
	let newContent = $state(true);
	let publishable = $state(true);
	let statusMessage = $state('');
	let scrolled = $state(false);
	let drafts = $state<WikiDraftRecord[]>([]);
	let activeDraft = $state<WikiDraftRecord | undefined>(undefined);
	let loadingDrafts = $state(false);
	let draftSaveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let draftSaveError = $state('');
	let lastDraftSavedAt = $state<number | undefined>(undefined);
	let loadDraftError = $state<string | undefined>(undefined);
	let conflictDraft = $state<WikiDraftRecord | undefined>(undefined);
	let conflictDialogOpen = $state(false);
	let bypassedConflictKey = $state<string | undefined>(undefined);
	let deferredAction = $state<DeferredAction | undefined>(undefined);
	let lastSavedSnapshot = $state(createSnapshot({ title: '', category: '', content: '' }));

	let autosaveTimer: ReturnType<typeof setTimeout> | undefined;
	let applyingDraftState = false;

	const currentUser = $derived(ndk.$sessions?.currentUser);
	const requestedDraftId = $derived($page.url.searchParams.get('draft')?.trim() || undefined);
	const dTag = $derived(title ? normalizeDTag(title) : '');
	const currentDraftKey = $derived(deriveNewWikiDraftKey(title));
	const canPersistDraft = $derived(Boolean(currentUser && currentDraftKey));
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
	const wordCount = $derived.by(() => {
		const trimmed = content.trim();
		return trimmed ? trimmed.split(/\s+/).length : 0;
	});
	const draftStatusText = $derived.by(() => {
		if (loadDraftError) return loadDraftError;
		if (!currentUser) return 'Sign in to save drafts and publish.';
		if (!currentDraftKey) {
			if (wordCount < 12 && !category.trim()) return undefined;
			return 'Add a title to start saving this draft.';
		}
		if (draftSaveState === 'saving') return 'Saving draft...';
		if (draftSaveState === 'error') return draftSaveError || 'Draft save failed.';
		if (lastDraftSavedAt) {
			return `Draft saved ${new Intl.DateTimeFormat(undefined, {
				dateStyle: 'medium',
				timeStyle: 'short'
			}).format(new Date(lastDraftSavedAt * 1000))}.`;
		}
		if (loadingDrafts) return 'Loading your drafts...';
		return 'Autosave starts after a short pause.';
	});

	beforeNavigate((navigation) => {
		if (typeof window === 'undefined') return;
		if (!(hasUnsavedChanges && (draftSaveState === 'saving' || draftSaveState === 'error'))) return;

		if (!window.confirm('You still have unsaved draft changes. Leave this page anyway?')) {
			navigation.cancel();
		}
	});

	$effect(() => {
		function onScroll() {
			scrolled = window.scrollY > 10;
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
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

	$effect(() => {
		const user = currentUser;
		if (!user) {
			drafts = [];
			activeDraft = undefined;
			loadDraftError = undefined;
			lastSavedSnapshot = createSnapshot({ title, category, content });
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
		const user = currentUser;
		const draftId = requestedDraftId;
		if (!user || !draftId) return;

		let cancelled = false;

		loadWikiDraftById(ndk, user.pubkey, draftId)
			.then((record) => {
				if (cancelled) return;
				if (!record) {
					loadDraftError = 'Draft not found.';
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

	function applyDraftRecord(record: WikiDraftRecord) {
		applyingDraftState = true;
		activeDraft = record;
		title = record.title;
		category = record.category;
		content = record.content;
		newContent = false;
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

		if (!currentUser) {
			if (reason === 'manual-save') {
				draftSaveState = 'error';
				draftSaveError = 'Sign in to save drafts.';
			}
			return false;
		}

		if (!dTag) {
			if (reason === 'manual-save') {
				draftSaveState = 'error';
				draftSaveError = 'Give the topic a title before saving a draft.';
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
				dTag
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

	async function createEntry(skipConflictCheck = false) {
		if (!currentUser || !title.trim() || !dTag.trim()) return;

		clearAutosaveTimer();

		if (!skipConflictCheck && !(await ensureDraftConflictResolved('publish'))) {
			return;
		}

		saving = true;
		try {
			const event = buildWikiDraftEvent(ndk, {
				title,
				category,
				content,
				dTag
			});
			event.author = currentUser;
			event.removeTag('published_at');
			event.tags.push(['published_at', Math.floor(Date.now() / 1000).toString()]);
			event.alt = `This is a wiki article about ${title}\n\nYou can read it on https://wikifreedia.xyz/a/${event.encode()}`;

			await event.publishReplaceable();

			if (activeDraft) {
				try {
					await deleteWikiDraft(ndk, activeDraft.draftId);
					drafts = removeWikiDraftById(drafts, activeDraft.draftId);
				} catch (error) {
					console.error('Failed to delete published draft:', error);
				}
			}

			syncDraftQueryParam(undefined);
			goto(`/${dTag}/${event.author.npub}`);
		} catch (error) {
			console.error('Failed to create entry:', error);
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
			await createEntry(true);
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

<header class="compose-header sticky top-0 z-50" class:scrolled>
	<div class="page-shell">
		<div class="flex min-h-[3.5rem] items-center gap-4 py-2">
			<a href="/" class="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
				<Logo size={22} />
			</a>

			<div class="ml-auto flex items-center gap-3">
				{#if wordCount > 0}
					<span class="hidden text-xs text-muted-foreground sm:block">{wordCount} words</span>
				{/if}

				<label class="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground">
					<Switch
						bind:checked={$wysiwyg}
						class="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10"
					/>
					<span class="hidden sm:inline">Rich</span>
				</label>

				<CategoryDropdown
					bind:value={category}
					class="h-8 rounded-full bg-transparent px-3 text-sm shadow-none hover:bg-white/[0.05]"
				/>

				<button
					type="button"
					onclick={() => void persistDraft('manual-save')}
					disabled={!canPersistDraft || draftSaveState === 'saving'}
					class="rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
				>
					{draftSaveState === 'saving' ? 'Saving...' : 'Save draft'}
				</button>

				<button
					type="button"
					onclick={() => void createEntry()}
					disabled={!currentUser || !title.trim() || !dTag.trim() || saving || !publishable}
					class="nav-cta disabled:pointer-events-none disabled:opacity-40"
				>
					{saving ? 'Publishing...' : 'Publish'}
				</button>
			</div>
		</div>
	</div>
</header>

<div class="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6">
	{#if draftStatusText}
		<p class="mb-5 text-sm text-muted-foreground">{draftStatusText}</p>
	{/if}

	<input
		bind:value={title}
		aria-label="Title"
		class="compose-title-input mb-8 block w-full"
		placeholder="Untitled"
		autocomplete="off"
		spellcheck="false"
	/>

	<TiptapEditor
		bind:content
		bind:newContent
		bind:publishable
		bind:statusMessage
		preferRich={$wysiwyg}
		variant="compose"
		placeholder="Start with the defining moment, the context, and why it matters..."
	/>

	{#if !publishable && statusMessage}
		<p class="mt-4 rounded-[1.1rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
			{statusMessage}
		</p>
	{/if}
</div>

<DraftConflictDialog
	bind:open={conflictDialogOpen}
	title="A draft already exists for this topic"
	description="You can resume the saved draft for this topic or replace it with what you have in the composer now."
	draftTitle={conflictDraft?.title}
	updatedAt={conflictDraft?.updatedAt}
	onresume={resumeConflictingDraft}
	onreplace={replaceConflictingDraft}
	oncancel={cancelConflictDialog}
/>
