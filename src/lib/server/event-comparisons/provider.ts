import { EventComparisonError } from './errors';
import type { ComparisonRuntimeConfig } from './config';
import type { ComparisonPrompt, ComparisonTextGenerator } from './types';

const OLLAMA_REQUEST_TIMEOUT_MS = 20_000;

type OllamaGenerateResponse = {
	response?: unknown;
	message?: {
		content?: unknown;
	} | null;
	error?: unknown;
};

export function createComparisonTextGenerator(
	config: ComparisonRuntimeConfig,
	fetchFn: typeof fetch = fetch
): ComparisonTextGenerator {
	const { requestUrls, requestHeaders } = resolveOllamaRequest(config);

	return {
		async generateComparison(prompt: ComparisonPrompt): Promise<string> {
			try {
				const { rawResponse } = await executeOllamaRequest(
					requestUrls,
					requestHeaders,
					config.ollama.model,
					prompt,
					fetchFn
				);

				const payload = parseOllamaResponse(rawResponse);
				if (typeof payload.error === 'string' && payload.error.trim()) {
					throw new Error(payload.error.trim());
				}

				const comparison = extractComparisonText(payload)?.trim();
				if (!comparison) {
					throw new Error('The comparison model returned an empty response.');
				}

				return comparison;
			} catch (error) {
				console.error('[event-comparisons] model generation failed', error);
				throw new EventComparisonError(
					502,
					'generation_failed',
					'Failed to generate the event comparison.'
				);
			}
		}
	};
}

function resolveOllamaRequest(config: ComparisonRuntimeConfig): {
	requestUrls: string[];
	requestHeaders: Record<string, string>;
} {
	const url = new URL(config.ollama.baseURL);
	const requestHeaders: Record<string, string> = {
		'content-type': 'application/json',
		...config.ollama.headers
	};

	if ((url.username || url.password) && !hasHeader(requestHeaders, 'authorization')) {
		const username = decodeURIComponent(url.username);
		const password = decodeURIComponent(url.password);
		requestHeaders.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
	}

	url.username = '';
	url.password = '';

	const normalizedPathname = url.pathname.replace(/\/+$/, '');
	return {
		requestUrls: buildOllamaGenerateUrls(url, normalizedPathname),
		requestHeaders
	};
}

async function executeOllamaRequest(
	requestUrls: string[],
	requestHeaders: Record<string, string>,
	model: string,
	prompt: ComparisonPrompt,
	fetchFn: typeof fetch
): Promise<{ rawResponse: string }> {
	let lastFailureMessage = 'Ollama request failed.';

	for (const [index, requestUrl] of requestUrls.entries()) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), OLLAMA_REQUEST_TIMEOUT_MS);
		let response: Response;
		let rawResponse = '';

		try {
			response = await fetchFn(requestUrl, {
				method: 'POST',
				headers: requestHeaders,
				body: JSON.stringify({
					model,
					system: prompt.system,
					prompt: prompt.prompt,
					stream: false
				}),
				signal: controller.signal
			});
			rawResponse = await response.text();
		} catch (error) {
			if (isAbortError(error)) {
				throw new Error(
					`Ollama request timed out after ${Math.floor(OLLAMA_REQUEST_TIMEOUT_MS / 1000)} seconds.`
				);
			}

			throw error;
		} finally {
			clearTimeout(timeoutId);
		}

		if (response.ok) {
			return { rawResponse };
		}

		lastFailureMessage = buildOllamaFailureMessage(response.status, rawResponse);
		const hasFallback = index < requestUrls.length - 1;
		if (response.status === 404 && hasFallback) {
			continue;
		}

		throw new Error(lastFailureMessage);
	}

	throw new Error(lastFailureMessage);
}

function buildOllamaGenerateUrls(url: URL, normalizedPathname: string): string[] {
	const pathCandidates = new Set<string>();
	pathCandidates.add(`${normalizedPathname || ''}/generate`);

	if (!normalizedPathname.endsWith('/api')) {
		pathCandidates.add(`${normalizedPathname || ''}/api/generate`);
	}

	return Array.from(pathCandidates).map((pathname) => {
		const candidateUrl = new URL(url.toString());
		candidateUrl.pathname = pathname;
		return candidateUrl.toString();
	});
}

function parseOllamaResponse(rawResponse: string): OllamaGenerateResponse {
	try {
		return JSON.parse(rawResponse) as OllamaGenerateResponse;
	} catch {
		throw new Error('Ollama returned invalid JSON.');
	}
}

function extractComparisonText(payload: OllamaGenerateResponse): string | null {
	if (typeof payload.response === 'string') {
		return payload.response;
	}

	if (typeof payload.message?.content === 'string') {
		return payload.message.content;
	}

	return null;
}

function buildOllamaFailureMessage(status: number, rawResponse: string): string {
	const fallbackMessage = `Ollama request failed with status ${status}.`;

	if (!rawResponse.trim()) {
		return fallbackMessage;
	}

	try {
		const payload = JSON.parse(rawResponse) as { error?: unknown; message?: unknown };
		const errorMessage =
			typeof payload.error === 'string'
				? payload.error
				: typeof payload.message === 'string'
					? payload.message
					: undefined;

		return errorMessage ? `${fallbackMessage} ${errorMessage}` : fallbackMessage;
	} catch {
		return `${fallbackMessage} ${truncateForLog(rawResponse)}`;
	}
}

function truncateForLog(value: string, maxLength = 240): string {
	if (value.length <= maxLength) {
		return value;
	}

	return `${value.slice(0, maxLength - 3)}...`;
}

function hasHeader(headers: Record<string, string>, headerName: string): boolean {
	return Object.keys(headers).some((name) => name.toLowerCase() === headerName.toLowerCase());
}

function isAbortError(error: unknown): boolean {
	return error instanceof DOMException
		? error.name === 'AbortError'
		: error instanceof Error && error.name === 'AbortError';
}
