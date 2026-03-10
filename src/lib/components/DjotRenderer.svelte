<script lang="ts">
	import { renderMarkupToHtml } from '@/utils/markup';

	let { content, class: className = '' }: { content: string; class?: string } = $props();

	function escapeHtml(value: string) {
		return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
	}

	const html = $derived.by(() => {
		try {
			return renderMarkupToHtml(content);
		} catch (error) {
			console.error('Error rendering markup content:', error);
			return `<p>${escapeHtml(content)}</p>`;
		}
	});
</script>

<div class="markup-content prose dark:prose-invert max-w-none {className}">
	{@html html}
</div>

<style>
	:global(.markup-content) {
		@apply text-foreground;
	}

	:global(.markup-content p) {
		@apply my-4;
	}

	:global(.markup-content h1) {
		@apply text-3xl font-bold my-4;
	}

	:global(.markup-content h2) {
		@apply text-2xl font-bold my-3;
	}

	:global(.markup-content h3) {
		@apply text-xl font-bold my-3;
	}

	:global(.markup-content h4) {
		@apply text-lg font-bold my-2;
	}

	:global(.markup-content code) {
		@apply bg-muted px-1 py-0.5 rounded text-sm;
	}

	:global(.markup-content pre) {
		@apply bg-muted p-4 rounded-lg my-4 overflow-x-auto;
	}

	:global(.markup-content pre code) {
		@apply bg-transparent p-0;
	}

	:global(.markup-content blockquote) {
		@apply border-l-4 border-primary/50 pl-4 italic my-4;
	}

	:global(.markup-content ul, .markup-content ol) {
		@apply my-4 pl-6;
	}

	:global(.markup-content li) {
		@apply my-1;
	}

	:global(.markup-content hr) {
		@apply my-6 border-border;
	}

	:global(.markup-content img) {
		@apply max-w-full rounded-lg my-4;
	}

	:global(.markup-content a) {
		@apply text-primary hover:underline;
	}
</style>
