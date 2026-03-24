import { createComparisonCache } from './cache';
import { getEventComparisonConfig } from './config';
import { createComparableEventFetcher } from './nostr';
import { createComparisonTextGenerator } from './provider';
import { buildEventComparisonPrompt } from './prompt';
import type {
	ComparableEventFetcher,
	ComparisonCache,
	ComparisonPromptBuilder,
	ComparisonTextGenerator,
	EventComparisonResult
} from './types';

type EventComparisonServiceDeps = {
	cache: ComparisonCache;
	fetchComparableEvents: ComparableEventFetcher;
	buildPrompt: ComparisonPromptBuilder;
	generator: ComparisonTextGenerator;
};

export function createEventComparisonService(deps: EventComparisonServiceDeps) {
	return {
		async compareEventIds(eventIds: string[]): Promise<EventComparisonResult> {
			const cachedComparison = await readCachedComparison(deps.cache, eventIds);
			if (cachedComparison) {
				return {
					eventIds,
					comparison: cachedComparison,
					cached: true
				};
			}

			const comparableEvents = await deps.fetchComparableEvents(eventIds);
			const prompt = deps.buildPrompt(comparableEvents);
			const comparison = await deps.generator.generateComparison(prompt);

			await writeCachedComparison(deps.cache, eventIds, comparison);

			return {
				eventIds,
				comparison,
				cached: false
			};
		}
	};
}

export function createDefaultEventComparisonService(
	env: Record<string, string | undefined> = process.env
) {
	const config = getEventComparisonConfig(env);

	return createEventComparisonService({
		cache: createComparisonCache(config.cache),
		fetchComparableEvents: createComparableEventFetcher({ relayUrls: config.relayUrls }),
		buildPrompt: buildEventComparisonPrompt,
		generator: createComparisonTextGenerator(config)
	});
}

async function readCachedComparison(
	cache: ComparisonCache,
	eventIds: string[]
): Promise<string | null> {
	try {
		return await cache.get(eventIds);
	} catch (error) {
		console.warn('[event-comparisons] cache read failed', error);
		return null;
	}
}

async function writeCachedComparison(
	cache: ComparisonCache,
	eventIds: string[],
	comparison: string
): Promise<void> {
	try {
		await cache.set(eventIds, comparison);
	} catch (error) {
		console.warn('[event-comparisons] cache write failed', error);
	}
}
