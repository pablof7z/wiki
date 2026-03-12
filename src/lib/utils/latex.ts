import type { AutoRenderOptions } from 'katex/contrib/auto-render';

type AutoRender = typeof import('katex/contrib/auto-render').default;

let autoRenderPromise: Promise<AutoRender> | undefined;

const MATH_RENDER_OPTIONS: AutoRenderOptions = {
	delimiters: [
		{ left: '$$', right: '$$', display: true },
		{ left: '\\begin{equation}', right: '\\end{equation}', display: true },
		{ left: '\\begin{align}', right: '\\end{align}', display: true },
		{ left: '\\begin{alignat}', right: '\\end{alignat}', display: true },
		{ left: '\\begin{gather}', right: '\\end{gather}', display: true },
		{ left: '\\begin{CD}', right: '\\end{CD}', display: true },
		{ left: '\\[', right: '\\]', display: true },
		{ left: '$', right: '$', display: false },
		{ left: '\\(', right: '\\)', display: false }
	],
	ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'],
	ignoredClasses: ['nostr-mention', 'nostr-event-ref', 'katex'],
	throwOnError: false,
	errorCallback: () => {},
	strict: 'ignore' as const
};

async function loadAutoRender() {
	autoRenderPromise ??= import('katex/contrib/auto-render').then((module) => module.default);

	return autoRenderPromise;
}

export async function renderLatexInElement(element: HTMLElement) {
	const renderMathInElement = await loadAutoRender();
	renderMathInElement(element, MATH_RENDER_OPTIONS);
}
