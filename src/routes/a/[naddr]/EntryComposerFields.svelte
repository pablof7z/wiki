<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { wysiwyg } from '$lib/stores/settings';
	import TiptapEditor from '$lib/components/TiptapEditor.svelte';
	import CategoryDropdown from './CategoryDropdown.svelte';

	let {
		title = $bindable(''),
		category = $bindable(''),
		content = $bindable(''),
		newContent = $bindable(false),
		publishable = $bindable(true),
		statusMessage = $bindable('')
	}: {
		title?: string;
		category?: string;
		content?: string;
		newContent?: boolean;
		publishable?: boolean;
		statusMessage?: string;
	} = $props();

	const wordCount = $derived.by(() => {
		const trimmed = content.trim();
		return trimmed ? trimmed.split(/\s+/).length : 0;
	});

	const readingTime = $derived(wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 225)) : 0);
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
		<div class="flex flex-wrap items-center gap-3">
			<div
				class="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-2 py-2"
			>
				<span
					class="pl-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground"
				>
					Category
				</span>
				<CategoryDropdown
					bind:value={category}
					class="h-10 min-w-[220px] rounded-full border-0 bg-transparent px-3 shadow-none hover:bg-white/[0.05]"
				/>
			</div>

			<div class="chrome-pill rounded-full px-4 py-2 text-xs font-medium text-muted-foreground">
				{wordCount ? `${wordCount} words` : 'Blank draft'}
			</div>

			<div class="chrome-pill rounded-full px-4 py-2 text-xs font-medium text-muted-foreground">
				{readingTime ? `${readingTime} min read` : 'Reading time builds as you write'}
			</div>
		</div>

		<label
			class="flex items-center gap-3 self-start rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground"
		>
			<span class="font-medium text-foreground">Rich editing</span>
			<Switch
				bind:checked={$wysiwyg}
				class="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10"
			/>
		</label>
	</div>

	<div class="space-y-3 border-b border-white/8 pb-6">
		<span class="eyebrow">Title</span>
		<input
			bind:value={title}
			aria-label="Title"
			class="compose-title-input"
			placeholder="Untitled"
			autocomplete="off"
			spellcheck="false"
		/>
		<p class="max-w-2xl text-sm text-muted-foreground">
			The public link is generated from the title automatically, so the writing surface stays clean.
		</p>
	</div>

	<div class="space-y-4">
		<div class="flex items-center justify-between gap-4">
			<span class="eyebrow">Body</span>
			<span class="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
				Write for the final page, not a form
			</span>
		</div>

		<TiptapEditor
			bind:content
			bind:newContent
			bind:publishable
			bind:statusMessage
			preferRich={$wysiwyg}
			variant="compose"
			placeholder="Start with the defining moment, the context, and why it matters..."
		/>
	</div>

	{#if !publishable && statusMessage}
		<p
			class="rounded-[1.1rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
		>
			{statusMessage}
		</p>
	{:else}
		<p class="text-sm text-muted-foreground">
			Use sections, quotations, and direct links to related entries. The editor handles the rest.
		</p>
	{/if}
</div>
