import { describe, expect, it } from 'vitest';
import { createComparisonCacheKey, createInMemoryComparisonCache } from './cache';

describe('createComparisonCacheKey', () => {
	it('normalizes cache keys for 2-entry comparisons', () => {
		const keyA = createComparisonCacheKey(['b'.repeat(64), 'a'.repeat(64)], 'event-comparisons:v1');
		const keyB = createComparisonCacheKey(['a'.repeat(64), 'b'.repeat(64)], 'event-comparisons:v1');

		expect(keyA).toBe(keyB);
	});

	it('normalizes cache keys for 3-entry comparisons', () => {
		const keyA = createComparisonCacheKey(
			['c'.repeat(64), 'a'.repeat(64), 'b'.repeat(64)],
			'event-comparisons:v1'
		);
		const keyB = createComparisonCacheKey(
			['b'.repeat(64), 'c'.repeat(64), 'a'.repeat(64)],
			'event-comparisons:v1'
		);

		expect(keyA).toBe(keyB);
	});

	it('stores and retrieves comparisons in the in-memory cache', async () => {
		const cache = createInMemoryComparisonCache({
			kind: 'memory',
			namespace: 'event-comparisons:test'
		});
		const eventIds = ['b'.repeat(64), 'a'.repeat(64)];

		await cache.set(eventIds, 'cached comparison');

		await expect(cache.get(['a'.repeat(64), 'b'.repeat(64)])).resolves.toBe('cached comparison');
	});
});
