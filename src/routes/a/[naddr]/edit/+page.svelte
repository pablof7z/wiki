<script lang="ts">
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import Editor from '../Editor.svelte';
	import { goto } from '$app/navigation';
	import EntryCard from '$lib/components/EntryCard.svelte';

	let event = $state<NDKEvent | undefined>(undefined);
	let newContent = $state(false);
	let title = $state<string>('');
	let category = $state('');
	let saving = $state(false);
	let publishable = $state(true);
	let statusMessage = $state('');
	let subscriptionKind = $state<number | undefined>(undefined);
	let subscriptionDTag = $state<string | undefined>(undefined);
	let subscriptionAuthor = $state<string | undefined>(undefined);

	let currentUser: NDKUser;
	ndk.signer?.user().then((user) => {
		currentUser = user;
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

		event = undefined;
		title = '';
		category = '';
		content = '';
		subscriptionKind = undefined;
		subscriptionDTag = undefined;
		subscriptionAuthor = undefined;

		ndk.fetchEvent(currentNaddr).then((fetchedEvent) => {
			if (cancelled || !fetchedEvent) return;

			event = fetchedEvent;
			content = fetchedEvent.content;
			title = fetchedEvent.tagValue('title') || fetchedEvent.dTag!;
			category = fetchedEvent.tagValue('c') ?? '';
			subscriptionKind = fetchedEvent.kind;
			subscriptionDTag = fetchedEvent.dTag ?? undefined;
			subscriptionAuthor = fetchedEvent.pubkey;
		});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (events) {
			const eventsList = Array.from(events.events);
			if (eventsList.length > 0) {
				const latest = eventsList.sort((a, b) => {
					const time = b.created_at! - a.created_at!;
					if (time !== 0) return time;
					return b.content.length - a.content.length;
				})[0];
				if (latest && event?.id !== latest.id) {
					event = latest;
					content = latest.content;
					title = latest.tagValue('title') || latest.dTag!;
					category = latest.tagValue('c') ?? '';
				}
			}
		}
	});

	async function save() {
		if (!event) return;

		saving = true;
		const prevKey = event.pubkey;

		if (prevKey !== currentUser.pubkey) {
			event.removeTag('e');
			event.removeTag('a');
			event.tag(event, 'fork');
		}

		try {
			event.id = '';
			event.sig = '';
			event.pubkey = '';
			event.created_at = undefined;
			event.removeTag('title');
			event.alt =
				'This is a wiki article about ' +
				title +
				'\n\nYou can read it on https://wikifreedia.xyz/a/' +
				event.encode();
			event.tags.push(['title', title]);
			event.removeTag('c');
			if (category) event.tags.push(['c', category]);
			event.removeTag('published_at');
			event.tags.push(['published_at', Math.floor(Date.now() / 1000).toString()]);
			await event.publish();
			goto(`/${event.dTag}/${event.author.npub}`);
		} finally {
			saving = false;
		}
	}

	let content = $state<string>('');
	let preview = $state(false);

	function togglePreview() {
		preview = !preview;
	}
</script>

{#if event}
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
				{preview ? 'Previewing' : 'Editing live draft'}
			</div>
		</section>

		<div class="compose-frame rounded-[2rem] p-5 sm:p-6 lg:p-8">
			{#key `${event.id}:${preview}`}
				{#if !preview}
					<Editor
						bind:content={event.content}
						bind:newContent
						bind:publishable
						bind:statusMessage
						bind:title
						bind:category
					/>
				{:else}
					<div class="rounded-[1.75rem] border border-white/10 bg-black/20 p-4 sm:p-6">
						<EntryCard {event} skipEdit={true} />
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
							Save when the next version is ready. The existing URL stays intact.
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

						<Button
							class="w-fit rounded-full px-8"
							onclick={() => save()}
							disabled={!publishable || saving}
						>
							{#if saving}
								Saving...
							{:else}
								Save
							{/if}
						</Button>
					</div>
				</div>
			{/key}
		</div>
	</div>
{:else}
	Looking for event
{/if}
