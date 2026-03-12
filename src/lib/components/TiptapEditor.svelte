<script lang="ts">
	import {
		Bold,
		CodeXml,
		Italic,
		Link2,
		SquareTerminal,
		Strikethrough,
		TextQuote
	} from '@lucide/svelte';
	import { Editor } from '@tiptap/core';
	import { Link as LinkExtension } from '@tiptap/extension-link';
	import { Placeholder } from '@tiptap/extension-placeholder';
	import { StarterKit } from '@tiptap/starter-kit';
	import { cn } from '$lib/utils.js';
	import { normalizeDTag } from '$lib/utils/dtag';
	import {
		analyzeMarkupForRichEditor,
		tiptapToDjot,
		type MarkupFormat,
		type RichEditorAnalysis
	} from '$lib/utils/markup';

	const WikiAwareLink = LinkExtension.extend({
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
	type EditorVariant = 'default' | 'compose';

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
		variant = 'default',
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
		variant?: EditorVariant;
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
	let syncedEditorContent = $state<string | null>(null);
	let suppressEditorUpdate = false;
	let previousPreferRich = $state<boolean | undefined>(undefined);

	function editorContentClass() {
		if (variant === 'compose') {
			return 'compose-editor-content prose prose-lg max-w-none focus:outline-none';
		}

		return 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4';
	}

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
					class: editorContentClass()
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
				syncedEditorContent = content;
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

		syncedEditorContent = null;
	}

	function syncAnalysis(analysis: RichEditorAnalysis) {
		pendingAnalysis = analysis;
		publishable = analysis.publishable;
		statusMessage = analysis.message ?? '';
		contentFormat = analysis.format;
		canUseRichMode = analysis.richSupported;

		if (
			analysis.convertedFromLegacy &&
			analysis.canonicalDjot &&
			analysis.canonicalDjot !== content
		) {
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
		syncedEditorContent = content;
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

		return () => {
			destroyEditor();
		};
	});

	$effect(() => {
		if (mode !== 'rich' || !editor || !pendingAnalysis?.json) {
			return;
		}

		if (content === syncedEditorContent) {
			return;
		}

		setEditorContent();
	});
</script>

<div
	class={cn(
		'flex flex-col overflow-hidden',
		variant === 'compose' ? 'compose-editor-shell' : 'rounded-xl border',
		className
	)}
>
	{#if toolbar && mode === 'rich'}
		<div
			class={cn(
				'toolbar sticky top-0 z-40 flex flex-wrap items-center gap-1 border-b bg-background/80 p-2 backdrop-blur-xl',
				variant === 'compose' && 'compose-toolbar'
			)}
		>
			<div class="flex gap-1 border-r pr-2">
				<select
					class={cn(
						'rounded px-2 py-1 text-sm hover:bg-accent',
						variant === 'compose' && 'compose-toolbar-select'
					)}
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
					class={cn(
						'inline-flex items-center justify-center rounded px-3 py-1.5 transition-colors hover:bg-accent',
						variant === 'compose' && 'compose-toolbar-control'
					)}
					class:bg-accent={editor?.isActive('bold')}
					aria-label="Bold"
					title="Bold"
				>
					<Bold class="size-4" />
				</button>
				<button
					type="button"
					onclick={toggleItalic}
					class={cn(
						'inline-flex items-center justify-center rounded px-3 py-1.5 transition-colors hover:bg-accent',
						variant === 'compose' && 'compose-toolbar-control'
					)}
					class:bg-accent={editor?.isActive('italic')}
					aria-label="Italic"
					title="Italic"
				>
					<Italic class="size-4" />
				</button>
				<button
					type="button"
					onclick={toggleStrike}
					class={cn(
						'inline-flex items-center justify-center rounded px-3 py-1.5 transition-colors hover:bg-accent',
						variant === 'compose' && 'compose-toolbar-control'
					)}
					class:bg-accent={editor?.isActive('strike')}
					aria-label="Strike"
					title="Strikethrough"
				>
					<Strikethrough class="size-4" />
				</button>
				<button
					type="button"
					onclick={toggleCode}
					class={cn(
						'inline-flex items-center justify-center rounded px-3 py-1.5 transition-colors hover:bg-accent',
						variant === 'compose' && 'compose-toolbar-control'
					)}
					class:bg-accent={editor?.isActive('code')}
					aria-label="Inline code"
					title="Inline code"
				>
					<CodeXml class="size-4" />
				</button>
				<button
					type="button"
					onclick={setLinkFromPrompt}
					class={cn(
						'inline-flex items-center justify-center rounded px-3 py-1.5 transition-colors hover:bg-accent',
						variant === 'compose' && 'compose-toolbar-control'
					)}
					class:bg-accent={editor?.isActive('link')}
					aria-label="Link"
					title="Link"
				>
					<Link2 class="size-4" />
				</button>
				<button
					type="button"
					onclick={toggleBlockquote}
					class={cn(
						'inline-flex items-center justify-center rounded px-3 py-1.5 transition-colors hover:bg-accent',
						variant === 'compose' && 'compose-toolbar-control'
					)}
					class:bg-accent={editor?.isActive('blockquote')}
					aria-label="Blockquote"
					title="Blockquote"
				>
					<TextQuote class="size-4" />
				</button>
				<button
					type="button"
					onclick={toggleCodeBlock}
					class={cn(
						'inline-flex items-center justify-center rounded px-3 py-1.5 transition-colors hover:bg-accent',
						variant === 'compose' && 'compose-toolbar-control'
					)}
					class:bg-accent={editor?.isActive('codeBlock')}
					aria-label="Code block"
					title="Code block"
				>
					<SquareTerminal class="size-4" />
				</button>
			</div>
		</div>
	{/if}

	<div
		class={cn(
			'flex flex-wrap items-center gap-3 px-4 pt-3 text-sm text-muted-foreground',
			variant === 'compose' && 'compose-editor-meta'
		)}
	>
		<span>{mode === 'rich' ? 'Rich editor' : 'Source editor'}</span>
		<span>{contentFormat === 'djot' ? 'Djot markup' : 'AsciiDoc markup'}</span>
		{#if mode === 'raw' && canUseRichMode && preferRich}
			<button type="button" class="text-primary hover:underline" onclick={useRichEditor}>
				Switch back to rich editing
			</button>
		{/if}
	</div>

	{#if statusMessage}
		<div
			class={cn(
				'px-4 pb-3 text-sm',
				variant === 'compose' && 'compose-editor-status',
				!publishable && 'text-amber-600'
			)}
		>
			{statusMessage}
		</div>
	{/if}

	{#if mode === 'rich'}
		<div
			bind:this={editorElement}
			class={variant === 'compose' ? 'px-5 pb-5 sm:px-8' : 'min-h-[200px]'}
		></div>
	{:else}
		<textarea
			bind:value={content}
			class={cn(
				'w-full border-0 bg-transparent',
				variant === 'compose'
					? 'compose-raw-editor px-5 pb-10 pt-4 sm:px-8'
					: 'min-h-[320px] rounded-b-xl p-4 font-mono'
			)}
			{placeholder}
			{onfocus}
			{onblur}
			oninput={() => {
				newContent = true;
				oncontentChanged();
			}}
		></textarea>
	{/if}
</div>
