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
	<div class="flex items-center gap-3">
		<CategoryDropdown
			bind:value={category}
			class="h-9 rounded-full px-3 text-sm shadow-none hover:bg-white/[0.05]"
		/>

		{#if wordCount > 0}
			<span class="text-xs text-muted-foreground">{wordCount} words · {readingTime} min read</span>
		{/if}

		<label class="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
			<Switch
				bind:checked={$wysiwyg}
				class="data-[state=checked]:bg-white data-[state=unchecked]:bg-white/10"
			/>
			<span>Rich</span>
		</label>
	</div>

	<input
		bind:value={title}
		aria-label="Title"
		class="compose-title-input"
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
		<p
			class="rounded-[1.1rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
		>
			{statusMessage}
		</p>
	{/if}
</div>
