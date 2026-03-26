import type { JSONContent } from '@tiptap/core';
import Asciidoctor from 'asciidoctor';
import { parse, renderDjot, renderHTML } from '@djot/djot';
import { normalizeDTag } from './dtag';
import {
	createNostrPlaceholderHtml,
	findNostrEntityMatches
} from './nostr-entities';

type DjotReference = {
	destination: string;
};

type DjotBlock = {
	tag: string;
	attributes?: Record<string, string>;
	autoAttributes?: Record<string, string>;
	[key: string]: any;
};

type DjotInline = {
	tag: string;
	attributes?: Record<string, string>;
	[key: string]: any;
};

type DjotLink = DjotInline & {
	tag: 'link';
	children: DjotInline[];
};

type DjotDoc = {
	tag: 'doc';
	references: Record<string, DjotReference>;
	autoReferences: Record<string, DjotReference>;
	footnotes: Record<string, unknown>;
	children: DjotBlock[];
};

const asciidoctor = Asciidoctor();

const ASCII_DOC_PATTERNS = [
	/\[\[[^\]]+\]\]/,
	/(?:^|[\s(])(?:https?:\/\/|mailto:|nostr:|link:)[^\s\[]+\[[^\]]*]/,
	/\bimage::[^\s\[]+\[[^\]]*]/,
	/^\[source[^\]]*]/m,
	/^\s*(?:----+|\|===+)\s*$/m,
	/\bfootnote:\[[^\]]*]/,
	/^:[\w-]+:.*$/m
];
const DJOT_PATTERNS = [
	/^#{1,6}\s+\S/m,
	/\[[^\]\n]+\]\((?:[^()\n]|\\.)+\)/,
	/(?:^|\n)\|(?:[^\n|]*\|){2,}\s*\n\|(?:\s*:?-{3,}:?\s*\|){2,}\s*(?:\n|$)/m,
	/(?:^|\n)```/
];

const BLOCK_TAGS = new Set([
	'div',
	'section',
	'article',
	'main',
	'body',
	'header',
	'footer',
	'figure'
]);
const UNSUPPORTED_HTML_TAGS = new Set([
	'img',
	'table',
	'dl',
	'math',
	'video',
	'audio',
	'iframe',
	'script',
	'style'
]);
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

export type MarkupFormat = 'djot' | 'asciidoc';

export type MarkupHeading = {
	level: number;
	text: string;
	id: string;
};

export type RichEditorAnalysis = {
	format: MarkupFormat;
	publishable: boolean;
	richSupported: boolean;
	message?: string;
	json?: JSONContent;
	canonicalDjot?: string;
	convertedFromLegacy?: boolean;
};

class UnsupportedMarkupError extends Error {
	constructor(feature: string) {
		super(feature);
		this.name = 'UnsupportedMarkupError';
	}
}

export function detectMarkupFormat(content: string): MarkupFormat {
	if (!content.trim()) {
		return 'djot';
	}

	if (DJOT_PATTERNS.some((pattern) => pattern.test(content))) {
		return 'djot';
	}

	return ASCII_DOC_PATTERNS.some((pattern) => pattern.test(content)) ? 'asciidoc' : 'djot';
}

export function preprocessLegacyAsciiDoc(content: string): string {
	return content.replace(/\[\[([^|\]]+?)(?:\|([^\]]+))?\]\]/g, (_match, rawTarget, rawLabel) => {
		const target = rawTarget.trim();
		const label = (rawLabel ?? rawTarget).trim();
		const href = `/${normalizeDTag(target)}`;

		return `pass:[<a href="${escapeHtmlAttribute(href)}" data-wiki-ref="${escapeHtmlAttribute(target)}">${escapeHtmlText(label)}</a>]`;
	});
}

export function renderAsciiDocToHtml(content: string): string {
	const preprocessed = preprocessLegacyAsciiDoc(content);

	return String(
		asciidoctor.convert(preprocessed, {
			safe: 'safe',
			standalone: false,
			attributes: {
				showtitle: false
			}
		})
	);
}

export function renderDjotToHtml(content: string): string {
	if (!content.trim()) {
		return '';
	}

	const ast = enhanceDjotAstWithNostrEntities(parseDjotDocument(content));

	return renderHTML(ast as never, {
		overrides: {
			link: (node, renderer) => {
				if (!node.reference) {
					return renderer.renderAstNodeDefault(node);
				}

				const reference =
					renderer.references[node.reference] ?? renderer.autoReferences[node.reference];
				if (reference) {
					return renderer.renderAstNodeDefault(node);
				}

				return renderer.inTags('a', node, 0, {
					href: `/${normalizeDTag(node.reference)}`,
					'data-wiki-ref': node.reference
				});
			}
		}
	});
}

function parseDjotDocument(content: string): DjotDoc {
	return normalizeDjotAst(parse(preprocessDjotContent(content)) as DjotDoc);
}

function preprocessDjotContent(content: string): string {
	return content.replace(/\[\[([^|\]]+?)(?:\|([^\]]+))?\]\]/g, (_match, rawTarget, rawLabel) => {
		const target = rawTarget.trim();
		const label = (rawLabel ?? rawTarget).trim();

		if (label === target) {
			return `[${escapeDjotText(label)}][]`;
		}

		return `[${escapeDjotText(label)}][${escapeDjotText(target)}]`;
	});
}

function escapeDjotText(value: string): string {
	return value.replace(/[\\[\]]/g, '\\$&');
}

function normalizeDjotAst(doc: DjotDoc): DjotDoc {
	return {
		...doc,
		children: normalizeDjotNodesForTables(doc.children) as DjotBlock[]
	};
}

function normalizeDjotNodesForTables(
	nodes: Array<DjotBlock | DjotInline>
): Array<DjotBlock | DjotInline> {
	return nodes.map((node) => {
		if (!Array.isArray(node.children)) {
			return node;
		}

		const normalizedNode = {
			...node,
			children: normalizeDjotNodesForTables(node.children as Array<DjotBlock | DjotInline>)
		};

		if (normalizedNode.tag !== 'table') {
			return normalizedNode;
		}

		return normalizeMarkdownTable(normalizedNode as DjotBlock);
	});
}

function normalizeMarkdownTable(table: DjotBlock): DjotBlock {
	const children = [...((table.children ?? []) as DjotBlock[])];
	const rowIndexes = children.flatMap((child, index) => (child.tag === 'row' ? [index] : []));

	if (rowIndexes.length < 2) {
		return table;
	}

	const headerRowIndex = rowIndexes[0];
	const separatorRowIndex = rowIndexes[1];
	const headerRow = children[headerRowIndex];
	const separatorRow = children[separatorRowIndex];

	if (headerRow.head || !isMarkdownTableSeparatorRow(separatorRow)) {
		return table;
	}

	const alignments = getMarkdownTableAlignments(separatorRow);
	children[headerRowIndex] = formatMarkdownTableRow(headerRow, true, alignments);
	children.splice(separatorRowIndex, 1);

	for (const rowIndex of rowIndexes.slice(2).map((index) =>
		index > separatorRowIndex ? index - 1 : index
	)) {
		children[rowIndex] = formatMarkdownTableRow(children[rowIndex], false, alignments);
	}

	return {
		...table,
		children
	};
}

function isMarkdownTableSeparatorRow(row: DjotBlock): boolean {
	const cells = (row.children ?? []) as DjotBlock[];
	return (
		cells.length > 0 &&
		cells.every((cell) => /^:?-{3,}:?$/.test(extractDjotNodeText(cell).replace(/\s+/g, '')))
	);
}

function getMarkdownTableAlignments(row: DjotBlock): string[] {
	return ((row.children ?? []) as DjotBlock[]).map((cell) => {
		const marker = extractDjotNodeText(cell).replace(/\s+/g, '');
		if (marker.startsWith(':') && marker.endsWith(':')) {
			return 'center';
		}
		if (marker.endsWith(':')) {
			return 'right';
		}
		if (marker.startsWith(':')) {
			return 'left';
		}
		return 'default';
	});
}

function formatMarkdownTableRow(row: DjotBlock, head: boolean, alignments: string[]): DjotBlock {
	return {
		...row,
		head,
		children: ((row.children ?? []) as DjotBlock[]).map((cell, index) => ({
			...cell,
			head,
			align: alignments[index] ?? cell.align ?? 'default'
		}))
	};
}

function extractDjotNodeText(node: DjotBlock | DjotInline): string {
	if ('text' in node && typeof node.text === 'string') {
		return node.text;
	}
	if ('alias' in node && typeof node.alias === 'string') {
		return node.alias;
	}
	if (Array.isArray(node.children)) {
		return node.children
			.map((child) => extractDjotNodeText(child as DjotBlock | DjotInline))
			.join('');
	}
	return '';
}

function enhanceDjotAstWithNostrEntities(doc: DjotDoc): DjotDoc {
	return {
		...doc,
		children: enhanceDjotNodes(doc.children, false) as DjotBlock[]
	};
}

function enhanceDjotNodes(
	nodes: Array<DjotBlock | DjotInline>,
	insideLink: boolean
): Array<DjotBlock | DjotInline> {
	return nodes.flatMap((node) => {
		if (node.tag === 'str' && !insideLink) {
			return splitDjotStringNode(node as DjotInline);
		}

		if (!Array.isArray(node.children)) {
			return [node];
		}

		return [
			{
				...node,
				children: enhanceDjotNodes(
					node.children as Array<DjotBlock | DjotInline>,
					insideLink || node.tag === 'link'
				)
			}
		];
	});
}

function splitDjotStringNode(node: DjotInline): DjotInline[] {
	const text = node.text ?? '';
	const matches = findNostrEntityMatches(text);
	if (matches.length === 0) {
		return [node];
	}

	const fragments: DjotInline[] = [];
	let lastIndex = 0;

	for (const match of matches) {
		if (match.index > lastIndex) {
			fragments.push({
				...node,
				text: text.slice(lastIndex, match.index)
			});
		}

		fragments.push({
			tag: 'raw_inline',
			format: 'html',
			text: createNostrPlaceholderHtml(match, escapeHtmlText, escapeHtmlAttribute)
		});

		lastIndex = match.index + match.uri.length;
	}

	if (lastIndex < text.length) {
		fragments.push({
			...node,
			text: text.slice(lastIndex)
		});
	}

	return fragments;
}

export function renderMarkupToHtml(content: string): string {
	return detectMarkupFormat(content) === 'asciidoc'
		? renderAsciiDocToHtml(content)
		: renderDjotToHtml(content);
}

export function extractMarkupHeadings(content: string): MarkupHeading[] {
	return detectMarkupFormat(content) === 'asciidoc'
		? extractAsciiDocHeadings(content)
		: extractDjotHeadings(content);
}

export function extractMarkupTitle(content: string): string | undefined {
	if (!content.trim()) {
		return undefined;
	}

	const asciiDocTitle = content.match(/^=\s+(.+)$/m)?.[1]?.trim();
	if (asciiDocTitle) {
		return asciiDocTitle;
	}

	if (detectMarkupFormat(content) === 'asciidoc') {
		return undefined;
	}

	return extractDjotHeadings(content).find((heading) => heading.level === 1)?.text;
}

export function analyzeDjotForRichEditor(content: string): RichEditorAnalysis {
	try {
		const json = djotToTiptap(content);
		return {
			format: 'djot',
			publishable: true,
			richSupported: true,
			json,
			canonicalDjot: tiptapToDjot(json)
		};
	} catch (error) {
		const reason = toReason(error, 'This Djot document can only be edited in raw mode.');
		return {
			format: 'djot',
			publishable: true,
			richSupported: false,
			message: reason
		};
	}
}

export function analyzeMarkupForRichEditor(content: string): RichEditorAnalysis {
	if (detectMarkupFormat(content) === 'djot') {
		return analyzeDjotForRichEditor(content);
	}

	try {
		const html = renderAsciiDocToHtml(content);
		const json = htmlSubsetToTiptap(html);
		return {
			format: 'djot',
			publishable: true,
			richSupported: true,
			json,
			canonicalDjot: tiptapToDjot(json),
			convertedFromLegacy: true,
			message: 'Converted legacy AsciiDoc to Djot for editing.'
		};
	} catch (error) {
		const reason = `${toReason(
			error,
			'Legacy AsciiDoc could not be converted to the supported rich-text subset.'
		)} Rewrite it as Djot to publish.`;
		return {
			format: 'asciidoc',
			publishable: false,
			richSupported: false,
			message: reason
		};
	}
}

export function htmlSubsetToTiptap(html: string): JSONContent {
	if (typeof DOMParser === 'undefined') {
		throw new Error('DOMParser is unavailable in this environment.');
	}

	const document = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
	const body = document.body;

	return {
		type: 'doc',
		content: parseBlockChildren(body)
	};
}

export function djotToTiptap(content: string): JSONContent {
	if (!content.trim()) {
		return { type: 'doc', content: [] };
	}

	const ast = parseDjotDocument(content);

	return {
		type: 'doc',
		content: ast.children.flatMap((child) => djotBlockToTiptap(child, ast))
	};
}

export function tiptapToDjot(json: JSONContent): string {
	const ast: DjotDoc = {
		tag: 'doc',
		references: {},
		autoReferences: {},
		footnotes: {},
		children: tiptapBlocksToDjot(json.content ?? [])
	};

	return renderDjot(ast as never, { wrapWidth: 0 }).trim();
}

function djotBlockToTiptap(block: DjotBlock, doc: DjotDoc): JSONContent[] {
	assertNoAttributes(block);

	switch (block.tag) {
		case 'para':
			return [
				{
					type: 'paragraph',
					content: djotInlinesToTiptap((block.children ?? []) as DjotInline[], doc)
				}
			];

		case 'heading':
			return [
				{
					type: 'heading',
					attrs: { level: block.level },
					content: djotInlinesToTiptap((block.children ?? []) as DjotInline[], doc)
				}
			];

		case 'section':
			return (block.children as DjotBlock[]).flatMap((child: DjotBlock) =>
				djotBlockToTiptap(child, doc)
			);

		case 'block_quote':
			return [
				{
					type: 'blockquote',
					content: (block.children as DjotBlock[]).flatMap((child: DjotBlock) =>
						djotBlockToTiptap(child, doc)
					)
				}
			];

		case 'bullet_list':
			return [
				{
					type: 'bulletList',
					content: (block.children as DjotBlock[]).map((child: DjotBlock) =>
						djotListItemToTiptap(child as { tag: 'list_item'; children?: DjotBlock[] }, doc)
					)
				}
			];

		case 'ordered_list':
			return [
				{
					type: 'orderedList',
					attrs: {
						start: block.start ?? 1
					},
					content: (block.children as DjotBlock[]).map((child: DjotBlock) =>
						djotListItemToTiptap(child as { tag: 'list_item'; children?: DjotBlock[] }, doc)
					)
				}
			];

		case 'code_block':
			return [
				{
					type: 'codeBlock',
					attrs: block.lang ? { language: block.lang } : {},
					content: block.text ? [{ type: 'text', text: block.text }] : []
				}
			];

		case 'thematic_break':
			return [{ type: 'horizontalRule' }];

		default:
			throw new UnsupportedMarkupError(describeUnsupportedBlock(block.tag));
	}
}

function djotListItemToTiptap(
	item: { tag: 'list_item'; children?: DjotBlock[]; attributes?: Record<string, string> },
	doc: DjotDoc
): JSONContent {
	assertNoAttributes(item);

	return {
		type: 'listItem',
		content: (item.children ?? []).flatMap((child: DjotBlock) => djotBlockToTiptap(child, doc))
	};
}

function djotInlinesToTiptap(
	inlines: DjotInline[],
	doc: DjotDoc,
	marks: Array<{ type: string; attrs?: Record<string, unknown> }> = []
): JSONContent[] {
	return inlines.flatMap((inline: DjotInline) => {
		assertNoAttributes(inline);

		switch (inline.tag) {
			case 'str':
				return inline.text ? [createTextNode(inline.text, marks)] : [];

			case 'soft_break':
			case 'hard_break':
				return [{ type: 'hardBreak' }];

			case 'non_breaking_space':
				return [createTextNode(' ', marks)];

			case 'emph':
				return djotInlinesToTiptap((inline.children ?? []) as DjotInline[], doc, [
					...marks,
					{ type: 'italic' }
				]);

			case 'strong':
				return djotInlinesToTiptap((inline.children ?? []) as DjotInline[], doc, [
					...marks,
					{ type: 'bold' }
				]);

			case 'delete':
				return djotInlinesToTiptap((inline.children ?? []) as DjotInline[], doc, [
					...marks,
					{ type: 'strike' }
				]);

			case 'verbatim':
				return [createTextNode(inline.text ?? '', [...marks, { type: 'code' }])];

			case 'url':
				return [
					createTextNode(inline.text ?? '', [
						...marks,
						{ type: 'link', attrs: { href: inline.text ?? '' } }
					])
				];

			case 'email':
				return [
					createTextNode(inline.text ?? '', [
						...marks,
						{ type: 'link', attrs: { href: `mailto:${inline.text ?? ''}` } }
					])
				];

			case 'smart_punctuation':
				return [createTextNode(inline.text ?? '', marks)];

			case 'link':
				return djotLinkToTiptap(inline as DjotLink, doc, marks);

			default:
				throw new UnsupportedMarkupError(describeUnsupportedInline(inline.tag));
		}
	});
}

function djotLinkToTiptap(
	link: DjotLink,
	doc: DjotDoc,
	marks: Array<{ type: string; attrs?: Record<string, unknown> }>
): JSONContent[] {
	const reference = link.reference
		? (doc.references[link.reference] ?? doc.autoReferences[link.reference])
		: undefined;

	if (link.reference && !reference) {
		return djotInlinesToTiptap(link.children, doc, [
			...marks,
			{
				type: 'link',
				attrs: {
					href: `/${normalizeDTag(link.reference)}`,
					wikiRef: link.reference
				}
			}
		]);
	}

	const href = link.destination ?? reference?.destination;
	if (!href) {
		throw new UnsupportedMarkupError('Link without a destination.');
	}

	return djotInlinesToTiptap(link.children, doc, [
		...marks,
		{
			type: 'link',
			attrs: {
				href
			}
		}
	]);
}

function tiptapBlocksToDjot(nodes: JSONContent[]): DjotBlock[] {
	return nodes.flatMap((node) => {
		switch (node.type) {
			case 'paragraph':
				return [
					{
						tag: 'para',
						children: tiptapInlinesToDjot(node.content ?? [])
					}
				] satisfies DjotBlock[];

			case 'heading':
				return [
					{
						tag: 'heading',
						level: node.attrs?.level ?? 1,
						children: tiptapInlinesToDjot(node.content ?? [])
					}
				] satisfies DjotBlock[];

			case 'blockquote':
				return [
					{
						tag: 'block_quote',
						children: tiptapBlocksToDjot(node.content ?? [])
					}
				] satisfies DjotBlock[];

			case 'bulletList':
				return [
					{
						tag: 'bullet_list',
						tight: false,
						style: '-',
						children: (node.content ?? []).map((child) => tiptapListItemToDjot(child))
					}
				] satisfies DjotBlock[];

			case 'orderedList':
				return [
					{
						tag: 'ordered_list',
						tight: false,
						style: '1.',
						start: node.attrs?.start,
						children: (node.content ?? []).map((child) => tiptapListItemToDjot(child))
					}
				] satisfies DjotBlock[];

			case 'codeBlock':
				return [
					{
						tag: 'code_block',
						lang: node.attrs?.language || undefined,
						text: extractText(node.content ?? [])
					}
				] satisfies DjotBlock[];

			case 'horizontalRule':
				return [{ tag: 'thematic_break' }] satisfies DjotBlock[];

			default:
				throw new UnsupportedMarkupError(`Unsupported editor block: ${node.type ?? 'unknown'}`);
		}
	});
}

function tiptapListItemToDjot(node: JSONContent) {
	if (node.type !== 'listItem') {
		throw new UnsupportedMarkupError('Malformed list item.');
	}

	return {
		tag: 'list_item',
		children: tiptapBlocksToDjot(node.content ?? [])
	} as const;
}

function tiptapInlinesToDjot(nodes: JSONContent[]): DjotInline[] {
	const inlines = nodes.flatMap((node) => {
		switch (node.type) {
			case 'text':
				return node.text ? [applyMarksToDjotInline(node.text, node.marks ?? [])] : [];

			case 'hardBreak':
				return [{ tag: 'hard_break' }] satisfies DjotInline[];

			default:
				throw new UnsupportedMarkupError(`Unsupported editor inline: ${node.type ?? 'unknown'}`);
		}
	});

	return normalizeDjotInlines(inlines);
}

function applyMarksToDjotInline(
	text: string,
	marks: Array<{ type: string; attrs?: Record<string, unknown> }>
): DjotInline {
	let inline: DjotInline = {
		tag: 'str',
		text
	};

	for (const mark of sortMarks(marks)) {
		switch (mark.type) {
			case 'bold':
			case 'strong':
				inline = { tag: 'strong', children: [inline] };
				break;

			case 'italic':
			case 'em':
				inline = { tag: 'emph', children: [inline] };
				break;

			case 'strike':
				inline = { tag: 'delete', children: [inline] };
				break;

			case 'code':
				inline = { tag: 'verbatim', text: extractInlineText(inline) };
				break;

			case 'link': {
				const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : undefined;
				const wikiRef = typeof mark.attrs?.wikiRef === 'string' ? mark.attrs.wikiRef : undefined;

				inline = wikiRef
					? { tag: 'link', reference: wikiRef, children: [inline] }
					: { tag: 'link', destination: href ?? '', children: [inline] };
				break;
			}

			default:
				break;
		}
	}

	return inline;
}

function normalizeDjotInlines(inlines: DjotInline[]): DjotInline[] {
	const normalized: DjotInline[] = [];

	for (const inline of inlines) {
		const current = normalizeDjotInline(inline);
		const previous = normalized[normalized.length - 1];

		if (!previous) {
			normalized.push(current);
			continue;
		}

		if (previous.tag === 'str' && current.tag === 'str') {
			previous.text = (previous.text ?? '') + (current.text ?? '');
			continue;
		}

		if (previous.tag === 'verbatim' && current.tag === 'verbatim') {
			previous.text = (previous.text ?? '') + (current.text ?? '');
			continue;
		}

		if (
			previous.tag === current.tag &&
			(previous.tag === 'strong' ||
				previous.tag === 'emph' ||
				previous.tag === 'delete' ||
				previous.tag === 'link')
		) {
			if (previous.tag === 'link') {
				if (previous.reference !== (current as DjotLink).reference) {
					normalized.push(current);
					continue;
				}
				if (previous.destination !== (current as DjotLink).destination) {
					normalized.push(current);
					continue;
				}
			}

			previous.children = normalizeDjotInlines([
				...((previous.children ?? []) as DjotInline[]),
				...((current.children ?? []) as DjotInline[])
			]);
			continue;
		}

		normalized.push(current);
	}

	return normalized;
}

function normalizeDjotInline(inline: DjotInline): DjotInline {
	if ('children' in inline) {
		return {
			...inline,
			children: normalizeDjotInlines((inline.children ?? []) as DjotInline[])
		} as DjotInline;
	}

	return inline;
}

function extractDjotHeadings(content: string): MarkupHeading[] {
	if (!content.trim()) {
		return [];
	}

	const ast = parseDjotDocument(content);
	return extractDjotHeadingsFromBlocks(ast.children);
}

function extractDjotHeadingsFromBlocks(blocks: DjotBlock[]): MarkupHeading[] {
	const headings: MarkupHeading[] = [];

	for (const block of blocks) {
		if (block.tag === 'section') {
			const children = (block.children ?? []) as DjotBlock[];
			const heading = children.find((child) => child.tag === 'heading');
			const id =
				block.attributes?.id ??
				block.autoAttributes?.id ??
				heading?.attributes?.id ??
				heading?.autoAttributes?.id;

			if (heading && id) {
				headings.push({
					level: heading.level ?? 1,
					text: ((heading.children ?? []) as DjotInline[])
						.map((child) => extractInlineText(child))
						.join(''),
					id
				});
			}

			headings.push(
				...extractDjotHeadingsFromBlocks(children.filter((child) => child.tag !== 'heading'))
			);
			continue;
		}

		if (Array.isArray(block.children)) {
			headings.push(...extractDjotHeadingsFromBlocks(block.children as DjotBlock[]));
		}
	}

	return headings;
}

function extractAsciiDocHeadings(content: string): MarkupHeading[] {
	const html = renderAsciiDocToHtml(content);
	const headings: MarkupHeading[] = [];
	const pattern = /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/g;

	for (const match of html.matchAll(pattern)) {
		const level = Number(match[1]);
		const id = match[2].match(/\sid="([^"]+)"/)?.[1];
		if (!id) {
			continue;
		}

		headings.push({
			level,
			id,
			text: decodeHtmlText(match[3].replace(/<[^>]+>/g, '')).trim()
		});
	}

	return headings;
}

function parseBlockChildren(parent: ParentNode): JSONContent[] {
	const blocks: JSONContent[] = [];

	for (const child of Array.from(parent.childNodes)) {
		if (child.nodeType === TEXT_NODE) {
			const text = child.textContent?.trim();
			if (text) {
				blocks.push({
					type: 'paragraph',
					content: [{ type: 'text', text }]
				});
			}
			continue;
		}

		if (child.nodeType !== ELEMENT_NODE) {
			continue;
		}

		const element = child as HTMLElement;
		const tag = element.tagName.toLowerCase();

		if (BLOCK_TAGS.has(tag)) {
			blocks.push(...parseBlockChildren(element));
			continue;
		}

		if (UNSUPPORTED_HTML_TAGS.has(tag)) {
			throw new UnsupportedMarkupError(`Unsupported block element: <${tag}>.`);
		}

		switch (tag) {
			case 'p': {
				const content = parseInlineChildren(element);
				blocks.push({
					type: 'paragraph',
					content
				});
				break;
			}

			case 'h1':
			case 'h2':
			case 'h3':
			case 'h4':
			case 'h5':
			case 'h6':
				blocks.push({
					type: 'heading',
					attrs: { level: Number(tag[1]) },
					content: parseInlineChildren(element)
				});
				break;

			case 'blockquote': {
				const content = parseBlockChildren(element);
				blocks.push({
					type: 'blockquote',
					content: content.length
						? content
						: [{ type: 'paragraph', content: parseInlineChildren(element) }]
				});
				break;
			}

			case 'ul':
			case 'ol':
				blocks.push(parseList(element, tag === 'ol'));
				break;

			case 'pre':
				blocks.push(parseCodeBlock(element));
				break;

			case 'hr':
				blocks.push({ type: 'horizontalRule' });
				break;

			default:
				if (isInlineElement(tag)) {
					blocks.push({
						type: 'paragraph',
						content: parseInlineChildren(element)
					});
					break;
				}

				blocks.push(...parseBlockChildren(element));
				break;
		}
	}

	return blocks;
}

function parseList(element: HTMLElement, ordered: boolean): JSONContent {
	return {
		type: ordered ? 'orderedList' : 'bulletList',
		attrs:
			ordered && element.hasAttribute('start')
				? { start: Number(element.getAttribute('start') || '1') }
				: {},
		content: Array.from(element.children)
			.filter((child) => child.tagName.toLowerCase() === 'li')
			.map((child) => parseListItem(child as HTMLElement))
	};
}

function parseListItem(element: HTMLElement): JSONContent {
	const blocks: JSONContent[] = [];
	const inlineChildren: ChildNode[] = [];

	for (const child of Array.from(element.childNodes)) {
		if (child.nodeType === ELEMENT_NODE) {
			const tag = (child as HTMLElement).tagName.toLowerCase();
			if (
				tag === 'ul' ||
				tag === 'ol' ||
				tag === 'p' ||
				tag === 'pre' ||
				tag === 'blockquote' ||
				tag === 'hr'
			) {
				if (inlineChildren.length > 0) {
					blocks.push({
						type: 'paragraph',
						content: parseInlineNodeList(inlineChildren)
					});
					inlineChildren.length = 0;
				}
				blocks.push(...parseBlockChildren(child as HTMLElement));
				continue;
			}
		}
		inlineChildren.push(child);
	}

	if (inlineChildren.length > 0 || blocks.length === 0) {
		blocks.unshift({
			type: 'paragraph',
			content: parseInlineNodeList(
				inlineChildren.length > 0 ? inlineChildren : Array.from(element.childNodes)
			)
		});
	}

	return {
		type: 'listItem',
		content: blocks
	};
}

function parseCodeBlock(element: HTMLElement): JSONContent {
	const codeElement = element.querySelector('code');
	const languageClass =
		codeElement?.className
			.split(/\s+/)
			.find((name) => name.startsWith('language-'))
			?.replace('language-', '') ?? '';
	const text = codeElement?.textContent ?? element.textContent ?? '';

	return {
		type: 'codeBlock',
		attrs: languageClass ? { language: languageClass } : {},
		content: text ? [{ type: 'text', text }] : []
	};
}

function parseInlineChildren(element: HTMLElement): JSONContent[] {
	return parseInlineNodeList(Array.from(element.childNodes));
}

function parseInlineNodeList(nodes: ChildNode[]): JSONContent[] {
	const content: JSONContent[] = [];

	for (const node of nodes) {
		if (node.nodeType === TEXT_NODE) {
			const text = node.textContent ?? '';
			if (text) {
				content.push({ type: 'text', text });
			}
			continue;
		}

		if (node.nodeType !== ELEMENT_NODE) {
			continue;
		}

		const element = node as HTMLElement;
		const tag = element.tagName.toLowerCase();

		if (UNSUPPORTED_HTML_TAGS.has(tag)) {
			throw new UnsupportedMarkupError(`Unsupported inline element: <${tag}>.`);
		}

		switch (tag) {
			case 'br':
				content.push({ type: 'hardBreak' });
				break;

			case 'strong':
			case 'b':
				content.push(...applyMarks(parseInlineChildren(element), [{ type: 'bold' }]));
				break;

			case 'em':
			case 'i':
				content.push(...applyMarks(parseInlineChildren(element), [{ type: 'italic' }]));
				break;

			case 's':
			case 'strike':
			case 'del':
				content.push(...applyMarks(parseInlineChildren(element), [{ type: 'strike' }]));
				break;

			case 'code':
				content.push(...applyMarks(parseInlineChildren(element), [{ type: 'code' }]));
				break;

			case 'a': {
				const wikiRef = element.getAttribute('data-wiki-ref');
				const href = element.getAttribute('href') ?? (wikiRef ? `/${normalizeDTag(wikiRef)}` : '');
				content.push(
					...applyMarks(parseInlineChildren(element), [
						{
							type: 'link',
							attrs: {
								href,
								wikiRef: wikiRef ?? undefined
							}
						}
					])
				);
				break;
			}

			case 'span':
			case 'small':
			case 'sup':
			case 'sub':
				content.push(...parseInlineChildren(element));
				break;

			default:
				if (BLOCK_TAGS.has(tag)) {
					content.push(...parseInlineNodeList(Array.from(element.childNodes)));
					break;
				}

				throw new UnsupportedMarkupError(`Unsupported inline element: <${tag}>.`);
		}
	}

	return content;
}

function applyMarks(
	content: JSONContent[],
	marks: Array<{ type: string; attrs?: Record<string, unknown> }>
): JSONContent[] {
	return content.map((node) => {
		if (node.type !== 'text') {
			return node;
		}

		return {
			...node,
			marks: [...(node.marks ?? []), ...marks]
		};
	});
}

function createTextNode(
	text: string,
	marks: Array<{ type: string; attrs?: Record<string, unknown> }>
): JSONContent {
	return marks.length > 0 ? { type: 'text', text, marks } : { type: 'text', text };
}

function sortMarks(marks: Array<{ type: string; attrs?: Record<string, unknown> }>) {
	return [...marks].sort((left, right) => markPriority(left.type) - markPriority(right.type));
}

function markPriority(type: string) {
	switch (type) {
		case 'code':
			return 0;
		case 'bold':
		case 'strong':
			return 1;
		case 'italic':
		case 'em':
			return 2;
		case 'strike':
			return 3;
		case 'link':
			return 4;
		default:
			return 10;
	}
}

function extractText(nodes: JSONContent[]): string {
	return nodes
		.map((node) => {
			if (node.type === 'text') {
				return node.text ?? '';
			}
			if (node.type === 'hardBreak') {
				return '\n';
			}
			return extractText(node.content ?? []);
		})
		.join('');
}

function extractInlineText(node: DjotInline): string {
	if ('text' in node) {
		return node.text ?? '';
	}
	if ('children' in node && node.children) {
		return node.children.map((child: DjotInline) => extractInlineText(child)).join('');
	}
	return '';
}

function assertNoAttributes(node: { attributes?: Record<string, string> }) {
	if (node.attributes && Object.keys(node.attributes).length > 0) {
		throw new UnsupportedMarkupError('Attributes are only supported in raw Djot mode.');
	}
}

function escapeHtmlText(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function escapeHtmlAttribute(value: string): string {
	return escapeHtmlText(value).replaceAll('"', '&quot;');
}

function decodeHtmlText(value: string): string {
	return value
		.replaceAll('&quot;', '"')
		.replaceAll('&#39;', "'")
		.replaceAll('&gt;', '>')
		.replaceAll('&lt;', '<')
		.replaceAll('&amp;', '&');
}

function isInlineElement(tag: string): boolean {
	return ['a', 'strong', 'b', 'em', 'i', 'code', 'span', 'small', 's', 'del', 'strike'].includes(
		tag
	);
}

function describeUnsupportedBlock(tag: string): string {
	switch (tag) {
		case 'div':
		case 'raw_block':
			return 'Custom blocks are only supported in raw Djot mode.';
		case 'table':
			return 'Tables are only supported in raw Djot mode.';
		case 'definition_list':
			return 'Description lists are only supported in raw Djot mode.';
		case 'task_list':
			return 'Task lists are only supported in raw Djot mode.';
		default:
			return `Unsupported Djot block: ${tag}.`;
	}
}

function describeUnsupportedInline(tag: string): string {
	switch (tag) {
		case 'image':
			return 'Images are only supported in raw Djot mode.';
		case 'inline_math':
		case 'display_math':
			return 'Math is only supported in raw Djot mode.';
		case 'raw_inline':
			return 'Raw HTML is only supported in raw Djot mode.';
		case 'footnote_reference':
			return 'Footnotes are only supported in raw Djot mode.';
		case 'insert':
		case 'mark':
		case 'span':
		case 'subscript':
		case 'superscript':
		case 'double_quoted':
		case 'single_quoted':
			return `Djot feature "${tag}" is only supported in raw mode.`;
		default:
			return `Unsupported Djot inline: ${tag}.`;
	}
}

function toReason(error: unknown, fallback: string): string {
	return error instanceof Error && error.message ? error.message : fallback;
}
