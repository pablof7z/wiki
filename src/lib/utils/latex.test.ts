import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { renderLatexInElement } from './latex';

function installDomGlobals(window: Window & typeof globalThis) {
	globalThis.document = window.document;
	globalThis.Node = window.Node;
	globalThis.NodeFilter = window.NodeFilter;
}

describe('renderLatexInElement', () => {
	it('renders inline latex expressions', async () => {
		const dom = new JSDOM(
			'<!doctype html><div>Latex support: $\\\\frac{\\\\infty}{21,000,000} = \\\\infty$</div>'
		);
		const element = dom.window.document.querySelector('div');
		if (!element) {
			throw new Error('Expected test element');
		}

		installDomGlobals(dom.window);
		await renderLatexInElement(element);

		expect(element.innerHTML).toContain('class="katex"');
		expect(element.textContent).toContain('Latex support:');
		expect(element.textContent).toContain('21,000,000');
	});

	it('skips latex markers inside code blocks', async () => {
		const dom = new JSDOM('<!doctype html><div><code>$\\\\alpha$</code></div>');
		const element = dom.window.document.querySelector('div');
		if (!element) {
			throw new Error('Expected test element');
		}

		installDomGlobals(dom.window);
		await renderLatexInElement(element);

		expect(element.innerHTML).not.toContain('class="katex"');
		expect(element.querySelector('code')?.textContent).toBe('$\\\\alpha$');
	});
});
