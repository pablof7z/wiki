import { afterEach, describe, expect, it, vi } from 'vitest';
import { createComparisonTextGenerator } from './provider';
import type { ComparisonRuntimeConfig } from './config';

const TEST_CONFIG: ComparisonRuntimeConfig = {
	provider: 'ollama',
	relayUrls: [],
	ollama: {
		baseURL: 'https://ollama.example/api/',
		model: 'llama3.2',
		headers: {}
	},
	cache: {
		kind: 'memory',
		namespace: 'event-comparisons:test'
	}
};

const TEST_PROMPT = {
	system: 'system prompt',
	prompt: 'prompt body'
};

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe('createComparisonTextGenerator', () => {
	it('posts a minimal Ollama generate request', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ response: '  generated comparison  ' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);
		const generator = createComparisonTextGenerator(TEST_CONFIG, fetchMock as typeof fetch);

		await expect(generator.generateComparison(TEST_PROMPT)).resolves.toBe('generated comparison');
		expect(fetchMock).toHaveBeenCalledWith(
			'https://ollama.example/api/generate',
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					'content-type': 'application/json'
				}),
				body: JSON.stringify({
					model: 'llama3.2',
					system: 'system prompt',
					prompt: 'prompt body',
					stream: false
				})
			})
		);
	});

	it('falls back to /api/generate when the configured base URL points at the tunnel root', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response('<html>not found</html>', {
					status: 404,
					headers: { 'content-type': 'text/html' }
				})
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ response: 'comparison' }), {
					status: 200,
					headers: { 'content-type': 'application/json' }
				})
			);
		const generator = createComparisonTextGenerator(
			{
				...TEST_CONFIG,
				ollama: {
					...TEST_CONFIG.ollama,
					baseURL: 'https://835fa4556c15.ngrok.app'
				}
			},
			fetchMock as typeof fetch
		);

		await expect(generator.generateComparison(TEST_PROMPT)).resolves.toBe('comparison');
		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			'https://835fa4556c15.ngrok.app/generate',
			expect.any(Object)
		);
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			'https://835fa4556c15.ngrok.app/api/generate',
			expect.any(Object)
		);
	});

	it('forwards configured Ollama headers', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ response: 'comparison' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);
		const generator = createComparisonTextGenerator(
			{
				...TEST_CONFIG,
				ollama: {
					...TEST_CONFIG.ollama,
					headers: {
						Authorization: 'Bearer test-key',
						'X-Test': 'enabled'
					}
				}
			},
			fetchMock as typeof fetch
		);

		await generator.generateComparison(TEST_PROMPT);
		expect(fetchMock).toHaveBeenCalledWith(
			'https://ollama.example/api/generate',
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: 'Bearer test-key',
					'X-Test': 'enabled'
				})
			})
		);
	});

	it('converts credentials in the Ollama base URL into a basic auth header', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ response: 'comparison' }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);
		const generator = createComparisonTextGenerator(
			{
				...TEST_CONFIG,
				ollama: {
					...TEST_CONFIG.ollama,
					baseURL: 'https://vercel:secret-token@835fa4556c15.ngrok.app/api/'
				}
			},
			fetchMock as typeof fetch
		);

		await generator.generateComparison(TEST_PROMPT);
		expect(fetchMock).toHaveBeenCalledWith(
			'https://835fa4556c15.ngrok.app/api/generate',
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: `Basic ${Buffer.from('vercel:secret-token').toString('base64')}`
				})
			})
		);
	});

	it('wraps Ollama HTTP failures as generation errors', async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ error: 'unauthorized' }), {
				status: 401,
				headers: { 'content-type': 'application/json' }
			})
		);
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const generator = createComparisonTextGenerator(TEST_CONFIG, fetchMock as typeof fetch);

		await expect(generator.generateComparison(TEST_PROMPT)).rejects.toMatchObject({
			status: 502,
			code: 'generation_failed'
		});
		expect(consoleError).toHaveBeenCalled();
	});

	it('aborts slow Ollama requests before the function times out', async () => {
		vi.useFakeTimers();

		const fetchMock = vi.fn(
			(_input: RequestInfo | URL, init?: RequestInit) =>
				new Promise<Response>((_resolve, reject) => {
					init?.signal?.addEventListener('abort', () =>
						reject(new DOMException('Aborted', 'AbortError'))
					);
				})
		);
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const generator = createComparisonTextGenerator(TEST_CONFIG, fetchMock as typeof fetch);
		const comparisonPromise = generator.generateComparison(TEST_PROMPT);
		const expectation = expect(comparisonPromise).rejects.toMatchObject({
			status: 502,
			code: 'generation_failed'
		});

		await vi.advanceTimersByTimeAsync(20_000);

		await expectation;
		expect(consoleError).toHaveBeenCalled();
	});
});
