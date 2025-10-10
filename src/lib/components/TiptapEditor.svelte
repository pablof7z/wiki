<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';
	import { NostrExtension } from 'nostr-editor';
	import { tiptapToDjot, djotToTiptap } from '@/utils/djot';

	let {
		content = $bindable(""),
		placeholder = "Write something...",
		toolbar = true,
		autofocus = false,
		enterSubmits = false,
		newContent = $bindable(false),
		class: className = "",
		onsubmit = () => {},
		onforceSubmit = () => {},
		oncontentChanged = () => {},
		onfocus = () => {},
		onblur = () => {}
	}: {
		content?: string;
		placeholder?: string;
		toolbar?: boolean;
		autofocus?: boolean;
		enterSubmits?: boolean;
		newContent?: boolean;
		class?: string;
		onsubmit?: () => void;
		onforceSubmit?: () => void;
		oncontentChanged?: () => void;
		onfocus?: () => void;
		onblur?: () => void;
	} = $props();

	let editor: Editor | null = null;
	let editorElement: HTMLDivElement;

	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3, 4, 5, 6]
					}
				}),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'text-primary hover:underline'
					}
				}),
				Placeholder.configure({
					placeholder
				}),
				NostrExtension.configure({
					link: { autolink: true }
				})
			],
			editorProps: {
				attributes: {
					class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4'
				},
				handleKeyDown: (view, event) => {
					if (event.key === 'Enter') {
						if (enterSubmits && !event.shiftKey && !event.metaKey) {
							event.preventDefault();
							onsubmit();
							return true;
						}
						if (event.metaKey && event.shiftKey) {
							event.preventDefault();
							onforceSubmit();
							return true;
						}
						if (event.metaKey && !event.shiftKey) {
							event.preventDefault();
							onsubmit();
							return true;
						}
					}
					return false;
				}
			},
			autofocus,
			onCreate: () => {
				if (content) {
					// Parse Djot content into editor
					try {
						const json = djotToTiptap(content);
						editor?.commands.setContent(json);
					} catch (e) {
						console.error('Error parsing Djot content:', e);
						editor?.commands.setContent(content);
					}
				}
			},
			onUpdate: ({ editor }) => {
				// Convert editor content to Djot format
				try {
					const json = editor.getJSON();
					content = tiptapToDjot(json);
					newContent = true;
					oncontentChanged();
				} catch (e) {
					console.error('Error converting to Djot:', e);
				}
			},
			onFocus: () => {
				onfocus();
			},
			onBlur: () => {
				onblur();
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	// Helper functions for toolbar actions
	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}

	function toggleCode() {
		editor?.chain().focus().toggleCode().run();
	}

	function toggleLink() {
		const url = window.prompt('Enter URL:');
		if (url) {
			editor?.chain().focus().setLink({ href: url }).run();
		}
	}

	function toggleBlockquote() {
		editor?.chain().focus().toggleBlockquote().run();
	}

	function toggleCodeBlock() {
		editor?.chain().focus().toggleCodeBlock().run();
	}

	function setHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
		editor?.chain().focus().toggleHeading({ level }).run();
	}

	function setParagraph() {
		editor?.chain().focus().setParagraph().run();
	}

	$effect(() => {
		// Reactive update when content changes externally
		if (editor && !editor.isFocused) {
			const currentContent = tiptapToDjot(editor.getJSON());
			if (currentContent !== content) {
				try {
					const json = djotToTiptap(content);
					editor.commands.setContent(json);
				} catch (e) {
					console.error('Error updating content:', e);
				}
			}
		}
	});
</script>

<div class="flex flex-col border rounded-xl {className}">
	{#if toolbar}
		<div class="toolbar border-b p-2 flex flex-wrap gap-1 items-center sticky top-0 bg-background/80 backdrop-blur-xl z-40">
			<div class="flex gap-1 border-r pr-2">
				<select
					class="px-2 py-1 text-sm rounded hover:bg-accent"
					on:change={(e) => {
						const value = e.currentTarget.value;
						if (value === 'p') setParagraph();
						else if (value.startsWith('h')) setHeading(parseInt(value[1]) as any);
					}}
				>
					<option value="p">Paragraph</option>
					<option value="h1">Heading 1</option>
					<option value="h2">Heading 2</option>
					<option value="h3">Heading 3</option>
					<option value="h4">Heading 4</option>
					<option value="h5">Heading 5</option>
					<option value="h6">Heading 6</option>
				</select>
			</div>

			<div class="flex gap-1">
				<button
					type="button"
					on:click={toggleBold}
					class="px-3 py-1 rounded hover:bg-accent font-bold"
					class:bg-accent={editor?.isActive('bold')}
					aria-label="Bold"
				>
					B
				</button>
				<button
					type="button"
					on:click={toggleItalic}
					class="px-3 py-1 rounded hover:bg-accent italic"
					class:bg-accent={editor?.isActive('italic')}
					aria-label="Italic"
				>
					I
				</button>
				<button
					type="button"
					on:click={toggleCode}
					class="px-3 py-1 rounded hover:bg-accent font-mono text-sm"
					class:bg-accent={editor?.isActive('code')}
					aria-label="Inline code"
				>
					&lt;/&gt;
				</button>
				<button
					type="button"
					on:click={toggleLink}
					class="px-3 py-1 rounded hover:bg-accent"
					class:bg-accent={editor?.isActive('link')}
					aria-label="Link"
				>
					🔗
				</button>
				<button
					type="button"
					on:click={toggleBlockquote}
					class="px-3 py-1 rounded hover:bg-accent"
					class:bg-accent={editor?.isActive('blockquote')}
					aria-label="Blockquote"
				>
					"
				</button>
				<button
					type="button"
					on:click={toggleCodeBlock}
					class="px-3 py-1 rounded hover:bg-accent"
					class:bg-accent={editor?.isActive('codeBlock')}
					aria-label="Code block"
				>
					{'<>'}
				</button>
			</div>
		</div>
	{/if}

	{#if $$slots.belowToolbar}
		<slot name="belowToolbar" />
	{/if}

	<div bind:this={editorElement} class="editor-content"></div>
</div>

<style>
	:global(.editor-content .ProseMirror) {
		min-height: 200px;
	}

	:global(.editor-content .ProseMirror p.is-editor-empty:first-child::before) {
		color: #adb5bd;
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}

	:global(.editor-content .ProseMirror:focus) {
		outline: none;
	}

	:global(.editor-content code) {
		@apply bg-muted px-1 py-0.5 rounded text-sm;
	}

	:global(.editor-content pre) {
		@apply bg-muted p-4 rounded-lg my-4;
	}

	:global(.editor-content blockquote) {
		@apply border-l-4 border-primary/50 pl-4 italic my-4;
	}

	:global(.editor-content h1) {
		@apply text-3xl font-bold my-4;
	}

	:global(.editor-content h2) {
		@apply text-2xl font-bold my-3;
	}

	:global(.editor-content h3) {
		@apply text-xl font-bold my-3;
	}

	:global(.editor-content h4) {
		@apply text-lg font-bold my-2;
	}

	:global(.editor-content ul, .editor-content ol) {
		@apply my-4 pl-6;
	}

	:global(.editor-content li) {
		@apply my-1;
	}
</style>
