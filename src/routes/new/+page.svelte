<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ndk } from '$lib/ndk.svelte';
	import { normalizeDTag } from '$lib/utils/dtag';
	import { NDKEvent, type NostrEvent } from '@nostr-dev-kit/ndk';
	import EntryComposerFields from '../a/[naddr]/EntryComposerFields.svelte';

	let title = $state('');
	let content = $state('');
	let category = $state('');
	let saving = $state(false);
	let newContent = $state(true);
	let publishable = $state(true);
	let statusMessage = $state('');

	const dTag = $derived(title ? normalizeDTag(title) : '');

	async function createEntry() {
		if (!title.trim() || !dTag.trim()) return;

		saving = true;
		try {
			const event = new NDKEvent(ndk, {
				kind: 30818,
				content,
				tags: [
					['d', dTag],
					['title', title],
					['published_at', Math.floor(Date.now() / 1000).toString()]
				]
			} as NostrEvent);

			if (category) {
				event.tags.push(['c', category]);
			}

			event.alt = `This is a wiki article about ${title}\n\nYou can read it on https://wikifreedia.xyz/a/${event.encode()}`;

			await event.publish();
			goto(`/${dTag}/${event.author.npub}`);
		} catch (error) {
			console.error('Failed to create entry:', error);
			saving = false;
		}
	}
</script>

<div class="page-shell-content px-4 pb-16 pt-6 sm:px-6">
	<section class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div class="max-w-3xl space-y-3">
			<p class="eyebrow">Compose</p>
			<h1>Create New Entry</h1>
			<p class="max-w-2xl text-sm text-muted-foreground sm:text-base">
				The title, category, and body are the whole experience here. Publishing metadata stays out
				of the way until the entry is ready.
			</p>
		</div>

		<div
			class="chrome-pill self-start rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.26em] text-muted-foreground"
		>
			Living knowledge draft
		</div>
	</section>

	<div class="compose-frame rounded-[2rem] p-5 sm:p-6 lg:p-8">
		<EntryComposerFields
			bind:title
			bind:category
			bind:content
			bind:newContent
			bind:publishable
			bind:statusMessage
		/>

		<div
			class="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
		>
			<p class="max-w-xl text-sm text-muted-foreground">
				{#if !publishable && statusMessage}
					{statusMessage}
				{:else}
					Publish when the structure and tone are ready. The article URL is generated from the title
					automatically.
				{/if}
			</p>

			<div class="flex flex-col gap-3 sm:flex-row">
				<Button
					variant="ghost"
					onclick={() => window.history.back()}
					class="rounded-full px-6 text-muted-foreground hover:text-foreground"
				>
					Cancel
				</Button>

				<Button
					onclick={createEntry}
					disabled={!title.trim() || !dTag.trim() || saving || !publishable}
					class="rounded-full px-8"
				>
					{#if saving}
						Creating...
					{:else}
						Create Entry
					{/if}
				</Button>
			</div>
		</div>
	</div>
</div>
