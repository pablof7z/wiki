import { describe, expect, it, vi } from 'vitest';
import { EventComparisonError } from './errors';
import { createDefaultEventComparisonService, createEventComparisonService } from './service';
import type {
	ComparableEntry,
	ComparisonCache,
	ComparisonPrompt,
	ComparisonTextGenerator
} from './types';

const EVENT_IDS = ['a'.repeat(64), 'b'.repeat(64)];
const SAMPLE_EVENTS: ComparableEntry[] = [
	{
		eventId: EVENT_IDS[0],
		authorName: 'Alice',
		authorPubkey: '1'.repeat(64),
		title: 'Version A',
		createdAt: 1_710_000_000,
		kind: 30818,
		content: 'Alice says the story starts here.'
	},
	{
		eventId: EVENT_IDS[1],
		authorName: 'Bob',
		authorPubkey: '2'.repeat(64),
		title: 'Version B',
		createdAt: 1_710_000_100,
		kind: 30818,
		content: 'Bob says the story starts elsewhere.'
	}
];
const SAMPLE_PROMPT: ComparisonPrompt = {
	system: 'system prompt',
	prompt: 'prompt body'
};

describe('createEventComparisonService', () => {
	it('returns cached comparisons without regenerating them', async () => {
		const cache: ComparisonCache = {
			get: vi.fn().mockResolvedValue('cached comparison'),
			set: vi.fn().mockResolvedValue(undefined)
		};
		const fetchComparableEvents = vi.fn();
		const buildPrompt = vi.fn();
		const generator: ComparisonTextGenerator = {
			generateComparison: vi.fn()
		};

		const service = createEventComparisonService({
			cache,
			fetchComparableEvents,
			buildPrompt,
			generator
		});

		await expect(service.compareEventIds(EVENT_IDS)).resolves.toEqual({
			eventIds: EVENT_IDS,
			comparison: 'cached comparison',
			cached: true
		});
		expect(fetchComparableEvents).not.toHaveBeenCalled();
		expect(buildPrompt).not.toHaveBeenCalled();
		expect(generator.generateComparison).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
	});

	it('generates and caches a comparison on a cache miss', async () => {
		const cache: ComparisonCache = {
			get: vi.fn().mockResolvedValue(null),
			set: vi.fn().mockResolvedValue(undefined)
		};
		const fetchComparableEvents = vi.fn().mockResolvedValue(SAMPLE_EVENTS);
		const buildPrompt = vi.fn().mockReturnValue(SAMPLE_PROMPT);
		const generator: ComparisonTextGenerator = {
			generateComparison: vi.fn().mockResolvedValue('fresh comparison')
		};

		const service = createEventComparisonService({
			cache,
			fetchComparableEvents,
			buildPrompt,
			generator
		});

		await expect(service.compareEventIds(EVENT_IDS)).resolves.toEqual({
			eventIds: EVENT_IDS,
			comparison: 'fresh comparison',
			cached: false
		});
		expect(fetchComparableEvents).toHaveBeenCalledWith(EVENT_IDS);
		expect(buildPrompt).toHaveBeenCalledWith(SAMPLE_EVENTS);
		expect(generator.generateComparison).toHaveBeenCalledWith(SAMPLE_PROMPT);
		expect(cache.set).toHaveBeenCalledWith(EVENT_IDS, 'fresh comparison');
	});

	it('surfaces missing events as 404 errors', async () => {
		const service = createEventComparisonService({
			cache: {
				get: vi.fn().mockResolvedValue(null),
				set: vi.fn().mockResolvedValue(undefined)
			},
			fetchComparableEvents: vi
				.fn()
				.mockRejectedValue(new EventComparisonError(404, 'event_not_found', 'missing event')),
			buildPrompt: vi.fn(),
			generator: { generateComparison: vi.fn() }
		});

		await expect(service.compareEventIds(EVENT_IDS)).rejects.toMatchObject({ status: 404 });
	});

	it('surfaces invalid comparable entries as 422 errors', async () => {
		const service = createEventComparisonService({
			cache: {
				get: vi.fn().mockResolvedValue(null),
				set: vi.fn().mockResolvedValue(undefined)
			},
			fetchComparableEvents: vi
				.fn()
				.mockRejectedValue(new EventComparisonError(422, 'invalid_event_kind', 'bad event')),
			buildPrompt: vi.fn(),
			generator: { generateComparison: vi.fn() }
		});

		await expect(service.compareEventIds(EVENT_IDS)).rejects.toMatchObject({ status: 422 });
	});

	it('surfaces provider failures as 502 errors', async () => {
		const service = createEventComparisonService({
			cache: {
				get: vi.fn().mockResolvedValue(null),
				set: vi.fn().mockResolvedValue(undefined)
			},
			fetchComparableEvents: vi.fn().mockResolvedValue(SAMPLE_EVENTS),
			buildPrompt: vi.fn().mockReturnValue(SAMPLE_PROMPT),
			generator: {
				generateComparison: vi
					.fn()
					.mockRejectedValue(
						new EventComparisonError(502, 'generation_failed', 'generation failed')
					)
			}
		});

		await expect(service.compareEventIds(EVENT_IDS)).rejects.toMatchObject({ status: 502 });
	});

	it('surfaces provider misconfiguration as a 503 error', () => {
		expect(() => createDefaultEventComparisonService({})).toThrowError(
			/COMPARE_AI_PROVIDER is required/
		);
	});
});
