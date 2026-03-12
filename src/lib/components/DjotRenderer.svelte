<script lang="ts">
	import { mount, onMount } from 'svelte';
	import 'katex/dist/katex.min.css';
	import { renderMarkupToHtml } from '$lib/utils/markup';
	import { renderLatexInElement } from '$lib/utils/latex';
	import { ndk } from '$lib/ndk.svelte';
	import type { ContentRenderer } from '$lib/nostr-content/content-renderer';
	import { defaultContentRenderer } from '$lib/nostr-content/default-renderer';
	import EmbeddedEvent from '$lib/nostr-content/embedded-event.svelte';

	let {
		content,
		renderer = defaultContentRenderer,
		class: className = ''
	}: {
		content: string;
		renderer?: ContentRenderer;
		class?: string;
	} = $props();

	function escapeHtml(value: string) {
		return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
	}

	let contentElement: HTMLDivElement | undefined;
	let mountedComponents: Array<{ unmount: () => void }> = [];

	const html = $derived.by(() => {
		try {
			return renderMarkupToHtml(content);
		} catch (error) {
			console.error('Error rendering markup content:', error);
			return `<p>${escapeHtml(content)}</p>`;
		}
	});

	function unmountMountedComponents() {
		for (const mounted of mountedComponents) {
			mounted.unmount();
		}

		mountedComponents = [];
	}

	function trackMountedComponent(component: { unmount?: () => void }) {
		mountedComponents.push({
			unmount: component.unmount ?? (() => {})
		});
	}

	async function hydrateRenderedContent() {
		if (!contentElement) {
			return;
		}

		await renderLatexInElement(contentElement);
		hydrateNostrEntities();
	}

	function hydrateNostrEntities() {
		if (!contentElement) {
			return;
		}

		unmountMountedComponents();

		const mentionPlaceholders = contentElement.querySelectorAll<HTMLElement>('.nostr-mention');
		for (const placeholder of mentionPlaceholders) {
			const bech32 = placeholder.dataset.bech32;
			if (!bech32) {
				continue;
			}

			placeholder.replaceChildren();

			if (!renderer.mentionComponent) {
				placeholder.textContent = `nostr:${bech32}`;
				continue;
			}

			trackMountedComponent(
				mount(renderer.mentionComponent, {
					target: placeholder,
					props: {
						ndk,
						bech32
					}
				}) as { unmount?: () => void }
			);
		}

		const eventPlaceholders = contentElement.querySelectorAll<HTMLElement>('.nostr-event-ref');
		for (const placeholder of eventPlaceholders) {
			const bech32 = placeholder.dataset.bech32;
			if (!bech32) {
				continue;
			}

			placeholder.replaceChildren();

			trackMountedComponent(
				mount(EmbeddedEvent, {
					target: placeholder,
					props: {
						ndk,
						bech32,
						renderer
					}
				}) as { unmount?: () => void }
			);
		}
	}

	onMount(() => {
		return () => {
			unmountMountedComponents();
		};
	});

	$effect(() => {
		html;
		renderer;

		if (!contentElement) {
			return;
		}

		void hydrateRenderedContent();
	});
</script>

<div bind:this={contentElement} class="markup-content prose dark:prose-invert max-w-none {className}">
	{@html html}
</div>

<style>
	:global(.markup-content) {
		color: hsl(var(--foreground) / 1);
	}

	:global(.markup-content p) {
		margin-block: 1rem;
	}

	:global(.markup-content h1) {
		margin-block: 1rem;
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1.2;
	}

	:global(.markup-content h2) {
		margin-block: 0.75rem;
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.25;
	}

	:global(.markup-content h3) {
		margin-block: 0.75rem;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.3;
	}

	:global(.markup-content h4) {
		margin-block: 0.5rem;
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.35;
	}

	:global(.markup-content code) {
		border-radius: 0.375rem;
		background: hsl(var(--muted) / 1);
		padding: 0.125rem 0.25rem;
		font-size: 0.875rem;
	}

	:global(.markup-content pre) {
		overflow-x: auto;
		margin-block: 1rem;
		border-radius: 0.5rem;
		background: hsl(var(--muted) / 1);
		padding: 1rem;
	}

	:global(.markup-content pre code) {
		background: transparent;
		padding: 0;
	}

	:global(.markup-content blockquote) {
		margin-block: 1rem;
		border-left: 4px solid hsl(var(--primary) / 0.5);
		padding-left: 1rem;
		font-style: italic;
	}

	:global(.markup-content ul, .markup-content ol) {
		margin-block: 1rem;
		padding-left: 1.5rem;
	}

	:global(.markup-content li) {
		margin-block: 0.25rem;
	}

	:global(.markup-content hr) {
		margin-block: 1.5rem;
		border-color: hsl(var(--border) / 1);
	}

	:global(.markup-content img) {
		margin-block: 1rem;
		max-width: 100%;
		border-radius: 0.5rem;
	}

	:global(.markup-content a) {
		color: hsl(var(--primary) / 1);
		text-decoration: none;
	}

	:global(.markup-content a:hover) {
		text-decoration: underline;
	}

	:global(.markup-content .katex) {
		color: inherit;
	}

	:global(.markup-content .katex-display) {
		overflow-x: auto;
		overflow-y: hidden;
		padding-block: 0.5rem;
	}
</style>
