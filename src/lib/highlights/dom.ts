const BLOCK_TAGS = new Set([
	'ARTICLE',
	'ASIDE',
	'BLOCKQUOTE',
	'DIV',
	'FIGCAPTION',
	'FIGURE',
	'FOOTER',
	'H1',
	'H2',
	'H3',
	'H4',
	'H5',
	'H6',
	'HEADER',
	'LI',
	'MAIN',
	'NAV',
	'OL',
	'P',
	'PRE',
	'SECTION',
	'TD',
	'TH',
	'UL'
]);

const IGNORED_PARENT_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA']);

export type DomTextSegment = {
	node: Text;
	start: number;
	end: number;
	text: string;
};

type DomPosition = {
	node: Text;
	offset: number;
};

type DomTextCharacter =
	| {
			kind: 'text';
			block: HTMLElement;
			start: DomPosition;
			end: DomPosition;
	  }
	| {
			kind: 'separator';
	  };

export type DomTextIndex = {
	root: HTMLElement;
	text: string;
	characters: DomTextCharacter[];
	blockTexts: Map<HTMLElement, string>;
};

export type DomTextSelection = {
	text: string;
	context?: string;
};

function isTextNode(node: Node | null | undefined): node is Text {
	return node?.nodeType === Node.TEXT_NODE;
}

function isRangeInsideRoot(root: HTMLElement, range: Range): boolean {
	const startContainer =
		range.startContainer.nodeType === Node.ELEMENT_NODE
			? range.startContainer
			: range.startContainer.parentNode;
	const endContainer =
		range.endContainer.nodeType === Node.ELEMENT_NODE
			? range.endContainer
			: range.endContainer.parentNode;

	return Boolean(startContainer && endContainer && root.contains(startContainer) && root.contains(endContainer));
}

function isWhitespace(character: string): boolean {
	return /\s/.test(character);
}

export function normalizeFuzzyText(text: string): string {
	return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findNearestBlockAncestor(root: HTMLElement, node: Node): HTMLElement {
	let current: Node | null = node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;

	while (current && current !== root) {
		if (current instanceof HTMLElement && BLOCK_TAGS.has(current.tagName)) {
			return current;
		}

		current = current.parentNode;
	}

	return root;
}

function getNormalizedBlockText(block: HTMLElement, root: HTMLElement): string {
	const source = block === root ? root.textContent : block.textContent;
	return normalizeFuzzyText(source ?? '');
}

function appendNormalizedCharacter(
	characters: DomTextCharacter[],
	nextCharacter: DomTextCharacter,
	value: string
) {
	if (value === ' ' && (characters.length === 0 || characters[characters.length - 1]?.kind === 'separator')) {
		return;
	}

	characters.push(nextCharacter);
}

function buildRangeFromCharacterSpan(
	index: DomTextIndex,
	start: number,
	end: number
): Range | undefined {
	if (start < 0 || end <= start || end > index.characters.length) return undefined;

	const startCharacter = index.characters.slice(start, end).find((character) => character.kind === 'text');
	const endCharacter = [...index.characters.slice(start, end)]
		.reverse()
		.find((character) => character.kind === 'text');

	if (!startCharacter || !endCharacter || startCharacter.kind !== 'text' || endCharacter.kind !== 'text') {
		return undefined;
	}

	const range = document.createRange();
	range.setStart(startCharacter.start.node, startCharacter.start.offset);
	range.setEnd(endCharacter.end.node, endCharacter.end.offset);
	return range;
}

function buildNgrams(text: string, size = 3): string[] {
	if (!text) return [];
	if (text.length <= size) return [text];

	const grams: string[] = [];
	for (let index = 0; index <= text.length - size; index += 1) {
		grams.push(text.slice(index, index + size));
	}

	return grams;
}

function countOverlap(left: string[], right: string[]): number {
	const counts = new Map<string, number>();

	for (const value of left) {
		counts.set(value, (counts.get(value) ?? 0) + 1);
	}

	let overlap = 0;
	for (const value of right) {
		const remaining = counts.get(value) ?? 0;
		if (remaining <= 0) continue;

		overlap += 1;
		counts.set(value, remaining - 1);
	}

	return overlap;
}

function scoreContextSimilarity(targetContext: string | undefined, candidateContext: string): number {
	if (!targetContext) return 0;
	if (!candidateContext) return 0;
	if (targetContext === candidateContext) return 1_000_000;

	const targetTokens = targetContext.split(' ').filter(Boolean);
	const candidateTokens = candidateContext.split(' ').filter(Boolean);
	const tokenOverlap = countOverlap(targetTokens, candidateTokens);
	const tokenScore =
		targetTokens.length === 0 && candidateTokens.length === 0
			? 0
			: tokenOverlap / Math.max(targetTokens.length, candidateTokens.length, 1);

	const targetNgrams = buildNgrams(targetContext);
	const candidateNgrams = buildNgrams(candidateContext);
	const ngramOverlap = countOverlap(targetNgrams, candidateNgrams);
	const ngramScore =
		targetNgrams.length === 0 && candidateNgrams.length === 0
			? 0
			: ngramOverlap / Math.max(targetNgrams.length, candidateNgrams.length, 1);

	const containmentBonus =
		targetContext.includes(candidateContext) || candidateContext.includes(targetContext) ? 10 : 0;

	return containmentBonus + tokenScore * 100 + ngramScore * 1000;
}

export function buildDomTextIndex(root: HTMLElement): DomTextIndex {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const characters: DomTextCharacter[] = [];
	const blockTexts = new Map<HTMLElement, string>();
	let previousBlock: HTMLElement | undefined = undefined;

	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		if (!isTextNode(node)) continue;
		if (!node.data) continue;

		const parentTagName = node.parentElement?.tagName;
		if (parentTagName && IGNORED_PARENT_TAGS.has(parentTagName)) continue;

		const block = findNearestBlockAncestor(root, node);
		if (!blockTexts.has(block)) {
			blockTexts.set(block, getNormalizedBlockText(block, root));
		}

		if (previousBlock && previousBlock !== block && characters.length > 0) {
			appendNormalizedCharacter(characters, { kind: 'separator' }, ' ');
		}

		for (let index = 0; index < node.data.length; index += 1) {
			const character = node.data[index];
			if (isWhitespace(character)) {
				appendNormalizedCharacter(characters, { kind: 'separator' }, ' ');
				continue;
			}

			appendNormalizedCharacter(
				characters,
				{
					kind: 'text',
					block,
					start: { node, offset: index },
					end: { node, offset: index + 1 }
				},
				character
			);
		}

		previousBlock = block;
	}

	while (characters[0]?.kind === 'separator') {
		characters.shift();
	}

	while (characters[characters.length - 1]?.kind === 'separator') {
		characters.pop();
	}

	return {
		root,
		text: characters
			.map((character) => (character.kind === 'separator' ? ' ' : character.start.node.data[character.start.offset]?.toLowerCase() ?? ''))
			.join(''),
		characters,
		blockTexts
	};
}

export function getRangeContext(root: HTMLElement, range: Range): string | undefined {
	if (!isRangeInsideRoot(root, range)) return undefined;

	let current: Node | null =
		range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
			? range.commonAncestorContainer
			: range.commonAncestorContainer.parentNode;

	while (current && current !== root) {
		if (current instanceof HTMLElement && BLOCK_TAGS.has(current.tagName)) {
			const context = current.textContent?.trim();
			return context || undefined;
		}

		current = current.parentNode;
	}

	const fallback = root.textContent?.trim();
	return fallback || undefined;
}

export function getSelectionWithinRoot(root: HTMLElement): DomTextSelection | undefined {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return undefined;

	const range = selection.getRangeAt(0);
	if (!isRangeInsideRoot(root, range)) return undefined;

	const text = range.toString();
	if (!text.trim()) return undefined;

	return {
		text,
		context: getRangeContext(root, range)
	};
}

function findAllOccurrences(haystack: string, needle: string): number[] {
	if (!needle) return [];

	const occurrences: number[] = [];
	let offset = haystack.indexOf(needle);

	while (offset !== -1) {
		occurrences.push(offset);
		offset = haystack.indexOf(needle, offset + 1);
	}

	return occurrences;
}

export function findRangeByQuoteContext(
	index: DomTextIndex,
	quote: string,
	context?: string
): Range | undefined {
	const normalizedQuote = normalizeFuzzyText(quote);
	if (!normalizedQuote) return undefined;

	const normalizedContext = context ? normalizeFuzzyText(context) : undefined;
	const matches = findAllOccurrences(index.text, normalizedQuote);
	if (matches.length === 0) return undefined;

	const candidates = matches
		.map((start) => {
			const end = start + normalizedQuote.length;
			const blocks = new Set<HTMLElement>();

			for (const character of index.characters.slice(start, end)) {
				if (character.kind === 'text') {
					blocks.add(character.block);
				}
			}

			if (blocks.size === 0) return undefined;

			let score = 0;
			for (const block of blocks) {
				score = Math.max(score, scoreContextSimilarity(normalizedContext, index.blockTexts.get(block) ?? ''));
			}

			return { start, end, score };
		})
		.filter((candidate): candidate is { start: number; end: number; score: number } => Boolean(candidate));

	if (candidates.length === 0) return undefined;

	const bestScore = Math.max(...candidates.map((candidate) => candidate.score));
	const bestCandidates = candidates.filter((candidate) => candidate.score === bestScore);
	if (bestCandidates.length !== 1) return undefined;

	const [bestCandidate] = bestCandidates;
	return buildRangeFromCharacterSpan(index, bestCandidate.start, bestCandidate.end);
}
