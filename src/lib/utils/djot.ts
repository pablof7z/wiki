/**
 * Djot format utilities for Tiptap editor
 * Djot is a light markup syntax similar to markdown but with better consistency
 * Spec: https://htmlpreview.github.io/?https://github.com/jgm/djot/blob/master/doc/syntax.html
 */

import type { JSONContent } from '@tiptap/core';

/**
 * Convert Tiptap JSON to Djot format
 */
export function tiptapToDjot(json: JSONContent): string {
	if (!json) return '';

	return serializeNode(json);
}

function serializeNode(node: JSONContent, inList = false): string {
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
						text = `*${text}*`;
						break;
					case 'italic':
					case 'em':
						text = `_${text}_`;
						break;
					case 'code':
						text = `\`${text}\``;
						break;
					case 'strike':
						text = `{-${text}-}`;
						break;
					case 'link':
						text = `[${text}](${mark.attrs?.href || ''})`;
						break;
				}
			}
		}

		return text;
	}

	const content = node.content?.map(child => serializeNode(child, node.type === 'bulletList' || node.type === 'orderedList')).join('') || '';

	switch (node.type) {
		case 'doc':
			return content;

		case 'paragraph':
			return inList ? content : content + '\n\n';

		case 'heading':
			const level = node.attrs?.level || 1;
			return '#'.repeat(level) + ' ' + content + '\n\n';

		case 'bulletList':
			return content + '\n';

		case 'orderedList':
			return content + '\n';

		case 'listItem':
			return '- ' + content + '\n';

		case 'codeBlock':
			const lang = node.attrs?.language || '';
			return '``` ' + lang + '\n' + content + '\n```\n\n';

		case 'blockquote':
			return '> ' + content.trim().split('\n').join('\n> ') + '\n\n';

		case 'horizontalRule':
			return '---\n\n';

		case 'hardBreak':
			return '\n';

		case 'image':
			const src = node.attrs?.src || '';
			const alt = node.attrs?.alt || '';
			return `![${alt}](${src})\n\n`;

		// Nostr-specific nodes
		case 'nprofile':
		case 'nevent':
		case 'naddr':
		case 'npub':
		case 'note':
			const bech32 = node.attrs?.bech32 || node.attrs?.[node.type] || '';
			return `nostr:${bech32}`;

		default:
			return content;
	}
}

/**
 * Parse Djot format to Tiptap JSON
 * This is a simplified parser - for production use a proper Djot parser
 */
export function djotToTiptap(djot: string): JSONContent {
	if (!djot) return { type: 'doc', content: [] };

	const lines = djot.split('\n');
	const content: JSONContent[] = [];
	let currentParagraph: JSONContent | null = null;
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// Skip empty lines
		if (!line.trim()) {
			if (currentParagraph && currentParagraph.content && currentParagraph.content.length > 0) {
				content.push(currentParagraph);
				currentParagraph = null;
			}
			i++;
			continue;
		}

		// Headings
		if (line.match(/^#{1,6}\s/)) {
			if (currentParagraph) {
				content.push(currentParagraph);
				currentParagraph = null;
			}
			const match = line.match(/^(#{1,6})\s+(.+)$/);
			if (match) {
				content.push({
					type: 'heading',
					attrs: { level: match[1].length },
					content: [{ type: 'text', text: match[2] }]
				});
			}
			i++;
			continue;
		}

		// Code blocks
		if (line.startsWith('```')) {
			if (currentParagraph) {
				content.push(currentParagraph);
				currentParagraph = null;
			}
			const lang = line.slice(3).trim();
			let code = '';
			i++;
			while (i < lines.length && !lines[i].startsWith('```')) {
				code += lines[i] + '\n';
				i++;
			}
			content.push({
				type: 'codeBlock',
				attrs: lang ? { language: lang } : {},
				content: [{ type: 'text', text: code.slice(0, -1) }]
			});
			i++;
			continue;
		}

		// Blockquotes
		if (line.startsWith('> ')) {
			if (currentParagraph) {
				content.push(currentParagraph);
				currentParagraph = null;
			}
			let quote = line.slice(2);
			i++;
			while (i < lines.length && lines[i].startsWith('> ')) {
				quote += '\n' + lines[i].slice(2);
				i++;
			}
			content.push({
				type: 'blockquote',
				content: [{ type: 'paragraph', content: [{ type: 'text', text: quote }] }]
			});
			continue;
		}

		// Horizontal rule
		if (line.match(/^---+$/)) {
			if (currentParagraph) {
				content.push(currentParagraph);
				currentParagraph = null;
			}
			content.push({ type: 'horizontalRule' });
			i++;
			continue;
		}

		// Lists
		if (line.match(/^-\s/)) {
			if (currentParagraph) {
				content.push(currentParagraph);
				currentParagraph = null;
			}
			const items: JSONContent[] = [];
			while (i < lines.length && lines[i].match(/^-\s/)) {
				items.push({
					type: 'listItem',
					content: [{ type: 'paragraph', content: parseInlineContent(lines[i].slice(2)) }]
				});
				i++;
			}
			content.push({ type: 'bulletList', content: items });
			continue;
		}

		// Regular paragraph
		if (!currentParagraph) {
			currentParagraph = { type: 'paragraph', content: [] };
		}

		if (currentParagraph.content) {
			if (currentParagraph.content.length > 0) {
				currentParagraph.content.push({ type: 'hardBreak' });
			}
			currentParagraph.content.push(...parseInlineContent(line));
		}

		i++;
	}

	if (currentParagraph && currentParagraph.content && currentParagraph.content.length > 0) {
		content.push(currentParagraph);
	}

	return { type: 'doc', content };
}

function parseInlineContent(text: string): JSONContent[] {
	const content: JSONContent[] = [];
	let current = '';
	let i = 0;

	while (i < text.length) {
		// Bold
		if (text[i] === '*' && text[i + 1] !== ' ') {
			if (current) {
				content.push({ type: 'text', text: current });
				current = '';
			}
			i++;
			let boldText = '';
			while (i < text.length && text[i] !== '*') {
				boldText += text[i];
				i++;
			}
			content.push({ type: 'text', text: boldText, marks: [{ type: 'bold' }] });
			i++;
			continue;
		}

		// Italic
		if (text[i] === '_' && text[i + 1] !== ' ') {
			if (current) {
				content.push({ type: 'text', text: current });
				current = '';
			}
			i++;
			let italicText = '';
			while (i < text.length && text[i] !== '_') {
				italicText += text[i];
				i++;
			}
			content.push({ type: 'text', text: italicText, marks: [{ type: 'italic' }] });
			i++;
			continue;
		}

		// Code
		if (text[i] === '`') {
			if (current) {
				content.push({ type: 'text', text: current });
				current = '';
			}
			i++;
			let codeText = '';
			while (i < text.length && text[i] !== '`') {
				codeText += text[i];
				i++;
			}
			content.push({ type: 'text', text: codeText, marks: [{ type: 'code' }] });
			i++;
			continue;
		}

		// Links
		if (text[i] === '[') {
			if (current) {
				content.push({ type: 'text', text: current });
				current = '';
			}
			i++;
			let linkText = '';
			while (i < text.length && text[i] !== ']') {
				linkText += text[i];
				i++;
			}
			i++; // Skip ]
			if (text[i] === '(') {
				i++;
				let href = '';
				while (i < text.length && text[i] !== ')') {
					href += text[i];
					i++;
				}
				content.push({ type: 'text', text: linkText, marks: [{ type: 'link', attrs: { href } }] });
				i++;
				continue;
			}
		}

		// Nostr references
		if (text.slice(i, i + 6) === 'nostr:') {
			if (current) {
				content.push({ type: 'text', text: current });
				current = '';
			}
			i += 6;
			let bech32 = '';
			while (i < text.length && /[a-z0-9]/.test(text[i])) {
				bech32 += text[i];
				i++;
			}

			// Determine nostr entity type from prefix
			if (bech32.startsWith('nprofile1')) {
				content.push({ type: 'nprofile', attrs: { bech32: `nostr:${bech32}` } });
			} else if (bech32.startsWith('nevent1')) {
				content.push({ type: 'nevent', attrs: { bech32: `nostr:${bech32}` } });
			} else if (bech32.startsWith('naddr1')) {
				content.push({ type: 'naddr', attrs: { bech32: `nostr:${bech32}` } });
			}
			continue;
		}

		current += text[i];
		i++;
	}

	if (current) {
		content.push({ type: 'text', text: current });
	}

	return content.length > 0 ? content : [{ type: 'text', text: '' }];
}
