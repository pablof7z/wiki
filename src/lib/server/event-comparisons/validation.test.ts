import { describe, expect, it } from 'vitest';
import { parseEventComparisonRequestBody } from './validation';

const EVENT_ID_A = 'a'.repeat(64);
const EVENT_ID_B = 'b'.repeat(64);
const EVENT_ID_C = 'c'.repeat(64);

describe('parseEventComparisonRequestBody', () => {
	it('accepts 2 or 3 unique hex event IDs and normalizes casing', () => {
		expect(
			parseEventComparisonRequestBody({
				eventIds: [EVENT_ID_A.toUpperCase(), ` ${EVENT_ID_B} `, EVENT_ID_C]
			})
		).toEqual([EVENT_ID_A, EVENT_ID_B, EVENT_ID_C]);
	});

	it('rejects invalid event counts', () => {
		expect(() => parseEventComparisonRequestBody({ eventIds: [EVENT_ID_A] })).toThrow(
			/exactly 2 or 3/
		);
		expect(() =>
			parseEventComparisonRequestBody({
				eventIds: [EVENT_ID_A, EVENT_ID_B, EVENT_ID_C, 'd'.repeat(64)]
			})
		).toThrow(/exactly 2 or 3/);
	});

	it('rejects duplicate event IDs after normalization', () => {
		expect(() =>
			parseEventComparisonRequestBody({
				eventIds: [EVENT_ID_A, EVENT_ID_A.toUpperCase()]
			})
		).toThrow(/must be unique/);
	});

	it('rejects non-hex event IDs', () => {
		expect(() =>
			parseEventComparisonRequestBody({
				eventIds: [EVENT_ID_A, 'not-a-valid-event-id']
			})
		).toThrow(/64-character hex/);
	});
});
