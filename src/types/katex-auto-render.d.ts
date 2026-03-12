declare module 'katex/contrib/auto-render' {
	export type DelimiterSpec = {
		left: string;
		right: string;
		display: boolean;
	};

	export type AutoRenderOptions = {
		delimiters?: DelimiterSpec[];
		preProcess?: (math: string) => string;
		ignoredTags?: string[];
		ignoredClasses?: string[];
		errorCallback?: (message: string, error: Error) => void;
		displayMode?: boolean;
		macros?: Record<string, string>;
		throwOnError?: boolean;
		strict?: boolean | 'ignore' | 'warn' | 'error';
	};

	const renderMathInElement: (element: HTMLElement, options?: AutoRenderOptions) => void;

	export default renderMathInElement;
}
