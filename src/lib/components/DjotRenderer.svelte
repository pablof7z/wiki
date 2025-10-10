<script lang="ts">
	import { djotToTiptap } from '@/utils/djot';
	import type { JSONContent } from '@tiptap/core';

	let { content, class: className = "" }: { content: string; class?: string } = $props();

	// Parse Djot to JSON structure
	const parsedContent = $derived.by(() => {
		try {
			return djotToTiptap(content);
		} catch (e) {
			console.error('Error parsing Djot content:', e);
			return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }] };
		}
	});

	function renderNode(node: JSONContent): string {
		if (!node) return '';

		// Handle text nodes
		if (node.type === 'text') {
			let text = node.text || '';

			// Apply marks
			if (node.marks) {
				for (const mark of node.marks) {
					switch (mark.type) {
						case 'bold':
						case 'strong':
							text = `<strong>${text}</strong>`;
							break;
						case 'italic':
						case 'em':
							text = `<em>${text}</em>`;
							break;
						case 'code':
							text = `<code>${text}</code>`;
							break;
						case 'strike':
							text = `<s>${text}</s>`;
							break;
						case 'link':
							const href = mark.attrs?.href || '';
							text = `<a href="${href}" class="text-primary hover:underline" target="${href.startsWith('http') ? '_blank' : '_self'}" rel="${href.startsWith('http') ? 'noopener noreferrer' : ''}">${text}</a>`;
							break;
					}
				}
			}

			return text;
		}

		const content = node.content?.map(child => renderNode(child)).join('') || '';

		switch (node.type) {
			case 'doc':
				return content;

			case 'paragraph':
				return `<p>${content}</p>`;

			case 'heading':
				const level = node.attrs?.level || 1;
				return `<h${level}>${content}</h${level}>`;

			case 'bulletList':
				return `<ul>${content}</ul>`;

			case 'orderedList':
				return `<ol>${content}</ol>`;

			case 'listItem':
				return `<li>${content}</li>`;

			case 'codeBlock':
				const lang = node.attrs?.language || '';
				return `<pre><code class="language-${lang}">${content}</code></pre>`;

			case 'blockquote':
				return `<blockquote>${content}</blockquote>`;

			case 'horizontalRule':
				return '<hr />';

			case 'hardBreak':
				return '<br />';

			case 'image':
				const src = node.attrs?.src || '';
				const alt = node.attrs?.alt || '';
				return `<img src="${src}" alt="${alt}" />`;

			// Nostr-specific nodes
			case 'nprofile':
			case 'nevent':
			case 'naddr':
			case 'npub':
			case 'note':
				const bech32 = node.attrs?.bech32 || node.attrs?.[node.type] || '';
				return `<span class="nostr-ref text-primary font-medium">${bech32}</span>`;

			default:
				return content;
		}
	}

	const html = $derived(renderNode(parsedContent));
</script>

<div class="djot-content prose dark:prose-invert max-w-none {className}">
	{@html html}
</div>

<style>
	:global(.djot-content) {
		@apply text-foreground;
	}

	:global(.djot-content p) {
		@apply my-4;
	}

	:global(.djot-content h1) {
		@apply text-3xl font-bold my-4;
	}

	:global(.djot-content h2) {
		@apply text-2xl font-bold my-3;
	}

	:global(.djot-content h3) {
		@apply text-xl font-bold my-3;
	}

	:global(.djot-content h4) {
		@apply text-lg font-bold my-2;
	}

	:global(.djot-content code) {
		@apply bg-muted px-1 py-0.5 rounded text-sm;
	}

	:global(.djot-content pre) {
		@apply bg-muted p-4 rounded-lg my-4 overflow-x-auto;
	}

	:global(.djot-content pre code) {
		@apply bg-transparent p-0;
	}

	:global(.djot-content blockquote) {
		@apply border-l-4 border-primary/50 pl-4 italic my-4;
	}

	:global(.djot-content ul, .djot-content ol) {
		@apply my-4 pl-6;
	}

	:global(.djot-content li) {
		@apply my-1;
	}

	:global(.djot-content hr) {
		@apply my-6 border-border;
	}

	:global(.djot-content img) {
		@apply max-w-full rounded-lg my-4;
	}

	:global(.djot-content .nostr-ref) {
		@apply inline-block;
	}
</style>
