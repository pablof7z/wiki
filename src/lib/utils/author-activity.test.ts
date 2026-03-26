import { describe, expect, it } from 'vitest';
import {
	ACTIVE_AUTHOR_MAX_AGE_DAYS,
	calculateAuthorActivityScore,
	calculateRecencyWeight,
	isRecentlyActive
} from './author-activity';

const SECONDS_PER_DAY = 24 * 60 * 60;
const NOW = 1_700_000_000;

describe('author activity helpers', () => {
	it('gives full weight to fresh activity', () => {
		expect(calculateRecencyWeight(NOW, { now: NOW })).toBeCloseTo(1, 5);
	});

	it('heavily discounts stale activity', () => {
		const yearOldTimestamp = NOW - 365 * SECONDS_PER_DAY;
		expect(calculateRecencyWeight(yearOldTimestamp, { now: NOW })).toBeLessThan(0.001);
	});

	it('drops authors outside the active window', () => {
		const staleTimestamp = NOW - (ACTIVE_AUTHOR_MAX_AGE_DAYS + 1) * SECONDS_PER_DAY;
		expect(isRecentlyActive(staleTimestamp, { now: NOW })).toBe(false);
		expect(calculateAuthorActivityScore([staleTimestamp], { now: NOW })).toBe(0);
	});

	it('prefers one recent article over many old ones', () => {
		const recentScore = calculateAuthorActivityScore([NOW - 7 * SECONDS_PER_DAY], { now: NOW });
		const oldArticleTimestamps = Array.from({ length: 50 }, () => NOW - 200 * SECONDS_PER_DAY);
		const historicalScore = calculateAuthorActivityScore(oldArticleTimestamps, { now: NOW });

		expect(recentScore).toBeGreaterThan(historicalScore);
	});
});
