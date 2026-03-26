// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import {
	buildDomTextIndex,
	findRangeByQuoteContext,
	getRangeContext,
	getSelectionWithinRoot
} from './dom';

function createArticleFixture(markup = `
	<article id="article">
		<p>Alpha beta gamma.</p>
		<p>Delta <strong>epsilon</strong> zeta.</p>
	</article>
`) {
	document.body.innerHTML = markup;
	return document.getElementById('article') as HTMLElement;
}

describe('highlight DOM helpers', () => {
	it('captures context from the nearest block element', () => {
		const root = createArticleFixture();
		const textNode = root.querySelectorAll('p')[1]?.childNodes[0] as Text;
		const range = document.createRange();

		range.setStart(textNode, 0);
		range.setEnd(textNode, 5);

		expect(getRangeContext(root, range)).toBe('Delta epsilon zeta.');
	});

	it('matches a quote after benign whitespace and paragraph edits', () => {
		const root = createArticleFixture(`
			<article id="article">
				<p>Bitcoin lets people send money without banks or intermediaries.</p>
				<p>Readers can still verify the same passage.</p>
			</article>
		`);
		const index = buildDomTextIndex(root);
		const range = findRangeByQuoteContext(
			index,
			'send money without banks',
			'Bitcoin lets people send money without banks.'
		);

		expect(range?.toString()).toBe('send money without banks');
	});

	it('resolves same-topic highlights from another article version inline', () => {
		const root = createArticleFixture(`
			<article id="article">
				<p>Alpha beta gamma.</p>
				<p>Bitcoin lets people send money without banks or intermediaries.</p>
			</article>
		`);
		const index = buildDomTextIndex(root);
		const range = findRangeByQuoteContext(
			index,
			'people send money without banks',
			'Bitcoin lets people send money without banks.'
		);

		expect(range?.toString()).toBe('people send money without banks');
	});

	it('uses context to pick the unique best duplicate quote match', () => {
		const root = createArticleFixture(`
			<article id="article">
				<p>Proof of work secures Bitcoin.</p>
				<p>Proof of work secures mining rewards.</p>
			</article>
		`);
		const index = buildDomTextIndex(root);
		const range = findRangeByQuoteContext(index, 'Proof of work', 'Proof of work secures mining rewards.');

		expect(range?.toString()).toBe('Proof of work');
		expect(range?.startContainer.parentElement?.closest('p')?.textContent).toBe(
			'Proof of work secures mining rewards.'
		);
	});

	it('suppresses inline rendering when the best fuzzy match is tied', () => {
		const root = createArticleFixture(`
			<article id="article">
				<p>Bitcoin uses proof of work.</p>
				<p>Bitcoin uses proof of work.</p>
			</article>
		`);
		const index = buildDomTextIndex(root);

		expect(findRangeByQuoteContext(index, 'proof of work', 'Bitcoin uses proof of work.')).toBeUndefined();
	});

	it('serializes a live selection inside the root with quote and context only', () => {
		const root = createArticleFixture();
		const textNode = root.querySelector('strong')?.firstChild as Text;
		const selection = window.getSelection();
		const range = document.createRange();

		range.setStart(textNode, 0);
		range.setEnd(textNode, textNode.data.length);
		selection?.removeAllRanges();
		selection?.addRange(range);

		expect(getSelectionWithinRoot(root)).toEqual({
			text: 'epsilon',
			context: 'Delta epsilon zeta.'
		});
	});
});
