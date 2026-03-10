<script lang="ts">
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';
	import { normalizeDTag } from '$lib/utils/dtag';
	import {
		analyzeMarkupForRichEditor,
		tiptapToDjot,
		type MarkupFormat,
		type RichEditorAnalysis
	} from '$lib/utils/markup';

	const WikiAwareLink = Link.extend({
		addAttributes() {
			return {
				...(this.parent?.() ?? {}),
				wikiRef: {
					default: null,
					parseHTML: (element) => element.getAttribute('data-wiki-ref'),
					renderHTML: (attributes) => {
						if (typeof attributes.wikiRef !== 'string' || !attributes.wikiRef) {
							return {};
						}

						return {
							'data-wiki-ref': attributes.wikiRef,
							href:
								typeof attributes.href === 'string' && attributes.href
									? attributes.href
									: `/${normalizeDTag(attributes.wikiRef)}`
						};
					}
				}
			};
		}
	});

	type EditorMode = 'rich' | 'raw';

	let {
		content = $bindable(''),
		placeholder = 'Write something...',
		toolbar = true,
		autofocus = false,
		enterSubmits = false,
		preferRich = true,
		newContent = $bindable(false),
		publishable = $bindable(true),
		statusMessage = $bindable(''),
		contentFormat = $bindable<MarkupFormat>('djot'),
		class: className = '',
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
		preferRich?: boolean;
		newContent?: boolean;
		publishable?: boolean;
		statusMessage?: string;
		contentFormat?: MarkupFormat;
		class?: string;
		onsubmit?: () => void;
		onforceSubmit?: () => void;
		oncontentChanged?: () => void;
		onfocus?: () => void;
		onblur?: () => void;
	} = $props();

	let editor = $state<Editor | null>(null);
	let editorElement = $state<HTMLDivElement | null>(null);
	let mode = $state<EditorMode>('raw');
	let canUseRichMode = $state(false);
	let forceRawMode = $state(false);
	let pendingAnalysis = $state<RichEditorAnalysis | null>(null);
	let suppressEditorUpdate = false;
	let previousPreferRich = $state<boolean | undefined>(undefined);

	function buildEditor() {
		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3, 4, 5, 6]
					}
				}),
				WikiAwareLink.configure({
					autolink: true,
					linkOnPaste: true,
					openOnClick: false,
					protocols: ['nostr'],
					isAllowedUri: () => true,
					HTMLAttributes: {
						class: 'text-primary hover:underline'
					}
				}),
				Placeholder.configure({
					placeholder
				})
			],
			editorProps: {
				attributes: {
					class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4'
				},
				handleKeyDown: (_view, event) => {
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
			onUpdate: ({ editor }) => {
				if (suppressEditorUpdate) {
					return;
				}

				content = tiptapToDjot(editor.getJSON());
				newContent = true;
				oncontentChanged();
			},
			onFocus: () => {
				onfocus();
			},
			onBlur: () => {
				onblur();
			}
		});
	}

	function destroyEditor() {
		if (editor) {
			editor.destroy();
			editor = null;
		}
	}

	function syncAnalysis(analysis: RichEditorAnalysis) {
		pendingAnalysis = analysis;
		publishable = analysis.publishable;
		statusMessage = analysis.message ?? '';
		contentFormat = analysis.format;
		canUseRichMode = analysis.richSupported;

		if (analysis.convertedFromLegacy && analysis.canonicalDjot && analysis.canonicalDjot !== content) {
			content = analysis.canonicalDjot;
			return;
		}

		if (preferRich && !analysis.richSupported) {
			forceRawMode = true;
		}

		const shouldUseRich = preferRich && analysis.richSupported && !forceRawMode;
		mode = shouldUseRich ? 'rich' : 'raw';

		if (shouldUseRich && analysis.canonicalDjot && analysis.canonicalDjot !== content) {
			content = analysis.canonicalDjot;
		}
	}

	function setEditorContent() {
		if (!editor || !pendingAnalysis?.json) {
			return;
		}

		suppressEditorUpdate = true;
		editor.commands.setContent(pendingAnalysis.json);
		suppressEditorUpdate = false;
	}

	function useRichEditor() {
		forceRawMode = false;
	}

	function isDirectLinkTarget(value: string) {
		return /^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(value);
	}

	function setLinkFromPrompt() {
		const value = window.prompt('Enter a URL, nostr URI, or wiki target:')?.trim();
		if (!value) {
			return;
		}

		if (isDirectLinkTarget(value)) {
			editor?.chain().focus().setLink({ href: value }).run();
			return;
		}

		editor
			?.chain()
			.focus()
			.setLink({
				href: `/${normalizeDTag(value)}`,
				wikiRef: value
			} as never)
			.run();
	}

	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}

	function toggleStrike() {
		editor?.chain().focus().toggleStrike().run();
	}

	function toggleCode() {
		editor?.chain().focus().toggleCode().run();
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
		if (previousPreferRich === undefined) {
			previousPreferRich = preferRich;
			return;
		}

		if (preferRich !== previousPreferRich) {
			forceRawMode = !preferRich;
			previousPreferRich = preferRich;
		}
	});

	$effect(() => {
		syncAnalysis(analyzeMarkupForRichEditor(content));
	});

	$effect(() => {
		if (mode !== 'rich') {
			destroyEditor();
			return;
		}

		if (!editorElement) {
			return;
		}

		if (!editor) {
			buildEditor();
		}

		setEditorContent();

		return () => {
			destroyEditor();
		};
	});
</script>

<div class="flex flex-col border rounded-xl {className}">
	{#if toolbar && mode === 'rich'}
		<div class="toolbar border-b p-2 flex flex-wrap gap-1 items-center sticky top-0 bg-background/80 backdrop-blur-xl z-40">
			<div class="flex gap-1 border-r pr-2">
				<select
					class="px-2 py-1 text-sm rounded hover:bg-accent"
					onchange={(event) => {
						const value = event.currentTarget.value;
						if (value === 'p') setParagraph();
						else if (value.startsWith('h')) setHeading(parseInt(value[1]) as 1 | 2 | 3 | 4 | 5 | 6);
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
					onclick={toggleBold}
					class="px-3 py-1 rounded hover:bg-accent font-bold"
					class:bg-accent={editor?.isActive('bold')}
					aria-label="Bold"
				>
					B
				</button>
				<button
					type="button"
					onclick={toggleItalic}
					class="px-3 py-1 rounded hover:bg-accent italic"
					class:bg-accent={editor?.isActive('italic')}
					aria-label="Italic"
				>
					I
				</button>
				<button
					type="button"
					onclick={toggleStrike}
					class="px-3 py-1 rounded hover:bg-accent line-through"
					class:bg-accent={editor?.isActive('strike')}
					aria-label="Strike"
				>
					S
				</button>
				<button
					type="button"
					onclick={toggleCode}
					class="px-3 py-1 rounded hover:bg-accent font-mono text-sm"
					class:bg-accent={editor?.isActive('code')}
					aria-label="Inline code"
				>
					&lt;/&gt;
				</button>
				<button
					type="button"
					onclick={setLinkFromPrompt}
					class="px-3 py-1 rounded hover:bg-accent"
					class:bg-accent={editor?.isActive('link')}
					aria-label="Link"
				>
					Link
				</button>
				<button
					type="button"
					onclick={toggleBlockquote}
					class="px-3 py-1 rounded hover:bg-accent"
					class:bg-accent={editor?.isActive('blockquote')}
					aria-label="Blockquote"
				>
					"
				</button>
				<button
					type="button"
					onclick={toggleCodeBlock}
					class="px-3 py-1 rounded hover:bg-accent"
					class:bg-accent={editor?.isActive('codeBlock')}
					aria-label="Code block"
				>
					{'<>'}
				</button>
			</div>
		</div>
	{/if}

	<div class="px-4 pt-3 text-sm text-muted-foreground flex flex-wrap gap-3 items-center">
		<span>{mode === 'rich' ? 'Rich Djot editor' : 'Raw source editor'}</span>
		<span>Detected: {contentFormat}</span>
		{#if mode === 'raw' && canUseRichMode && preferRich}
			<button type="button" class="text-primary hover:underline" onclick={useRichEditor}>
				Switch to rich editor
			</button>
		{/if}
	</div>

	{#if statusMessage}
		<div class="px-4 pb-3 text-sm" class:text-amber-600={!publishable}>
			{statusMessage}
		</div>
	{/if}

	{#if mode === 'rich'}
		<div bind:this={editorElement} class="min-h-[200px] {className}"></div>
	{:else}
		<textarea
			bind:value={content}
			class="w-full min-h-[320px] p-4 border-0 rounded-b-xl font-mono bg-transparent"
			placeholder={placeholder}
			onfocus={onfocus}
			onblur={onblur}
			oninput={() => {
				newContent = true;
				oncontentChanged();
			}}
		></textarea>
	{/if}
</div>
