<script lang="ts">
	import TiptapEditor from '$lib/components/TiptapEditor.svelte';
	import DjotRenderer from '$lib/components/DjotRenderer.svelte';

	let content = $state(`# Welcome to Tiptap with Djot

This is a **test page** to demonstrate the new Tiptap editor with _Djot_ format.

## Features

- Bold and italic text
- Code: \`const x = 42;\`
- Links and more

### Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, Djot!");
}
\`\`\`

> This is a blockquote

Try editing the content above!`);

	let newContent = $state(false);
	let showRaw = $state(false);
</script>

<div class="container mx-auto p-8 max-w-4xl">
	<h1 class="text-3xl font-bold mb-4">Tiptap Editor Test</h1>

	<div class="mb-4">
		<button
			class="px-4 py-2 bg-primary text-primary-foreground rounded"
			onclick={() => showRaw = !showRaw}
		>
			{showRaw ? 'Hide' : 'Show'} Raw Djot
		</button>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<div>
			<h2 class="text-xl font-semibold mb-2">Editor</h2>
			<TiptapEditor bind:content bind:newContent />
		</div>

		<div>
			<h2 class="text-xl font-semibold mb-2">Live Preview</h2>
			<div class="border rounded-xl p-4">
				<DjotRenderer {content} />
			</div>
		</div>
	</div>

	{#if showRaw}
		<div class="mt-8">
			<h2 class="text-xl font-semibold mb-2">Raw Djot Content</h2>
			<pre class="bg-muted p-4 rounded overflow-auto"><code>{content}</code></pre>
		</div>
	{/if}
</div>
