<script lang="ts">
	import EntryComposerFields from './EntryComposerFields.svelte';

	let {
		content = $bindable(''),
		newContent = $bindable(false),
		publishable = $bindable(true),
		title = $bindable(''),
		category = $bindable(''),
		statusMessage = $bindable('')
	}: {
		content?: string;
		newContent?: boolean;
		publishable?: boolean;
		title?: string;
		category?: string;
		statusMessage?: string;
	} = $props();

	$effect(() => {
		if (content && newContent) {
			newContent = false;
		}
	});
</script>

<EntryComposerFields
	bind:content
	bind:newContent
	bind:publishable
	bind:title
	bind:category
	bind:statusMessage
/>
