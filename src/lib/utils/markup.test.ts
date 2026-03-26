import { describe, expect, it } from 'vitest';
import type { JSONContent } from '@tiptap/core';
import { JSDOM } from 'jsdom';
import { nip19 } from 'nostr-tools';
import {
	analyzeDjotForRichEditor,
	analyzeMarkupForRichEditor,
	detectMarkupFormat,
	djotToTiptap,
	extractMarkupHeadings,
	extractMarkupTitle,
	renderDjotToHtml,
	renderMarkupToHtml,
	tiptapToDjot
} from './markup';

globalThis.DOMParser = new JSDOM('').window.DOMParser as typeof DOMParser;

describe('markup detection', () => {
	it('defaults plain content to djot', () => {
		expect(detectMarkupFormat('hello world')).toBe('djot');
	});

	it('detects legacy asciidoc markers', () => {
		expect(detectMarkupFormat('hello [[Target Page]]')).toBe('asciidoc');
		expect(detectMarkupFormat('https://example.com[example]')).toBe('asciidoc');
	});

	it('prefers djot for markdown tables even when legacy wiki links are present', () => {
		expect(
			detectMarkupFormat(
				'# Title\n\n| Name | Project |\n| --- | --- |\n| Alice | [[Target Page]] |'
			)
		).toBe('djot');
	});
});

describe('djot rendering', () => {
	it('renders unresolved reference links as wiki links', () => {
		const html = renderDjotToHtml('a tree is a [vegetable][] that grows big.');

		expect(html).toContain('href="/vegetable"');
		expect(html).toContain('data-wiki-ref="vegetable"');
	});

	it('renders defined references normally and leaves unresolved ones as wiki links', () => {
		const html = renderDjotToHtml(
			'trees are often [green][green color], but [bob][].\n\n[bob]: nostr:npub1example'
		);

		expect(html).toContain('href="/green-color"');
		expect(html).toContain('href="nostr:npub1example"');
	});

	it('keeps authored URL schemes intact', () => {
		const html = renderDjotToHtml('[x](javascript:alert(1))');

		expect(html).toContain('href="javascript:alert(1)"');
	});

	it('renders bare nostr entities as hydratable placeholders', () => {
		const npub = nip19.npubEncode('f'.repeat(64));
		const note = nip19.noteEncode('e'.repeat(64));
		const nevent = nip19.neventEncode({ id: 'd'.repeat(64) });
		const naddr = nip19.naddrEncode({
			identifier: 'nostr-markup',
			pubkey: 'c'.repeat(64),
			kind: 30818
		});
		const html = renderDjotToHtml(
			`author nostr:${npub}\n\nsee nostr:${note}\n\nthread nostr:${nevent}\n\nwiki nostr:${naddr}`
		);

		expect(html).toContain(`class="nostr-mention"`);
		expect(html).toContain(`data-bech32="${npub}"`);
		expect(html).toContain(`class="nostr-event-ref"`);
		expect(html).toContain(`data-bech32="${note}"`);
		expect(html).toContain(`data-bech32="${nevent}"`);
		expect(html).toContain(`data-bech32="${naddr}"`);
	});

	it('normalizes markdown pipe tables and legacy wiki links', () => {
		const html = renderMarkupToHtml(
			'# Title\n\n| Name | Project |\n| --- | --- |\n| Alice | [[Target Page]] |'
		);

		expect(html).toContain('<table>');
		expect(html).toContain('<th>Name</th>');
		expect(html).toContain('<th>Project</th>');
		expect(html).not.toContain('<td>---</td>');
		expect(html).toContain('href="/target-page"');
		expect(html).toContain('data-wiki-ref="Target Page"');
	});
});

describe('legacy asciidoc rendering', () => {
	it('converts legacy wiki links into internal anchors before rendering', () => {
		const html = renderMarkupToHtml('hello [[Target Page]] and [[target page|see this]]');

		expect(html).toContain('href="/target-page"');
		expect(html).toContain('data-wiki-ref="Target Page"');
		expect(html).toContain('data-wiki-ref="target page"');
	});

	it('keeps authored legacy link schemes intact', () => {
		const html = renderMarkupToHtml('link:javascript:alert(1)[x]');

		expect(html).toContain('href="javascript:alert(1)"');
	});
});

describe('heading extraction', () => {
	it('matches djot section ids from the official renderer', () => {
		expect(extractMarkupHeadings('# Hello\n\n## World\n\n## World')).toEqual([
			{ level: 1, text: 'Hello', id: 'Hello' },
			{ level: 2, text: 'World', id: 'World' },
			{ level: 2, text: 'World', id: 'World-1' }
		]);
	});

	it('extracts legacy asciidoc heading ids from rendered html', () => {
		expect(extractMarkupHeadings('[[Target Page]]\n\n== Section A\n\n=== Inner')).toEqual([
			{ level: 2, text: 'Section A', id: '_section_a' },
			{ level: 3, text: 'Inner', id: '_inner' }
		]);
	});
});

describe('title extraction', () => {
	it('extracts asciidoc document titles', () => {
		expect(extractMarkupTitle('= NKBIP-07: Quiet Mode\n\n== Abstract')).toBe(
			'NKBIP-07: Quiet Mode'
		);
	});

	it('extracts first-level djot headings', () => {
		expect(extractMarkupTitle('# Nostr Markup\n\n## Addresses')).toBe('Nostr Markup');
	});
});

describe('editor serialization', () => {
	it('serializes wiki links as reference-style djot', () => {
		const json: JSONContent = {
			type: 'doc',
			content: [
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'vegetable',
							marks: [{ type: 'link', attrs: { href: '/vegetable', wikiRef: 'vegetable' } }]
						},
						{ type: 'text', text: ' ' },
						{
							type: 'text',
							text: 'green',
							marks: [{ type: 'link', attrs: { href: '/green-color', wikiRef: 'green color' } }]
						}
					]
				}
			]
		};

		expect(tiptapToDjot(json)).toBe('[vegetable][] [green][green color]');
	});

	it('parses supported djot into a rich-editor document', () => {
		const json = djotToTiptap('# Hello\n\nThis is a [wiki][target page].');

		expect(json.content?.[0]?.type).toBe('heading');
		expect(json.content?.[1]?.type).toBe('paragraph');
	});
});

describe('rich editor analysis', () => {
	it('accepts the supported djot subset', () => {
		const analysis = analyzeDjotForRichEditor(
			'# Hello\n\nThis is *bold* and [green][green color].'
		);

		expect(analysis.richSupported).toBe(true);
		expect(analysis.publishable).toBe(true);
		expect(analysis.canonicalDjot).toContain('[green][green color]');
	});

	it('falls back to raw mode for unsupported djot constructs', () => {
		const analysis = analyzeDjotForRichEditor('| fruit | price |\n|---|---|\n| apple | 1 |');

		expect(analysis.richSupported).toBe(false);
		expect(analysis.publishable).toBe(true);
		expect(analysis.message).toContain('Tables');
	});

	it('converts legacy asciidoc into canonical djot when supported', () => {
		const analysis = analyzeMarkupForRichEditor('hello [[Target Page]]');

		expect(analysis.convertedFromLegacy).toBe(true);
		expect(analysis.richSupported).toBe(true);
		expect(analysis.publishable).toBe(true);
		expect(analysis.canonicalDjot).toContain('[Target Page][]');
	});

	it('blocks publish when legacy asciidoc cannot be converted to the supported subset', () => {
		const analysis = analyzeMarkupForRichEditor('image::https://example.com/cat.png[]');

		expect(analysis.richSupported).toBe(false);
		expect(analysis.publishable).toBe(false);
		expect(analysis.message).toContain('Rewrite it as Djot');
	});
});
