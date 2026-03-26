import { describe, expect, it } from 'vitest';
import { getEventComparisonConfig } from './config';

describe('getEventComparisonConfig', () => {
	it('falls back to the in-memory cache in development when redis is not configured', () => {
		const config = getEventComparisonConfig({
			NODE_ENV: 'development',
			COMPARE_AI_PROVIDER: 'ollama',
			COMPARE_OLLAMA_BASE_URL: 'http://127.0.0.1:11434/api',
			COMPARE_OLLAMA_MODEL: 'gpt-oss:120b-cloud'
		});

		expect(config.cache).toEqual({
			kind: 'memory',
			namespace: 'event-comparisons:v1'
		});
		expect(config.ollama.headers).toEqual({});
	});

	it('falls back to the in-memory cache in production when redis is not configured', () => {
		const config = getEventComparisonConfig({
			NODE_ENV: 'production',
			COMPARE_AI_PROVIDER: 'ollama',
			COMPARE_OLLAMA_BASE_URL: 'http://127.0.0.1:11434/api',
			COMPARE_OLLAMA_MODEL: 'gpt-oss:120b-cloud'
		});

		expect(config.cache).toEqual({
			kind: 'memory',
			namespace: 'event-comparisons:v1'
		});
	});

	it('adds optional Ollama auth and custom headers', () => {
		const config = getEventComparisonConfig({
			COMPARE_AI_PROVIDER: 'ollama',
			COMPARE_OLLAMA_BASE_URL: 'https://ollama.example/api',
			COMPARE_OLLAMA_MODEL: 'gpt-oss:120b-cloud',
			COMPARE_OLLAMA_API_KEY: 'test-key',
			COMPARE_OLLAMA_HEADERS_JSON: '{"X-Test":"enabled"}'
		});

		expect(config.ollama.headers).toEqual({
			'X-Test': 'enabled',
			Authorization: 'Bearer test-key'
		});
	});
});
