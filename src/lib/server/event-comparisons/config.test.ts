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
	});

	it('requires redis in production when redis is not configured', () => {
		expect(() =>
			getEventComparisonConfig({
				NODE_ENV: 'production',
				COMPARE_AI_PROVIDER: 'ollama',
				COMPARE_OLLAMA_BASE_URL: 'http://127.0.0.1:11434/api',
				COMPARE_OLLAMA_MODEL: 'gpt-oss:120b-cloud'
			})
		).toThrow(/required for event comparisons in production/);
	});
});
