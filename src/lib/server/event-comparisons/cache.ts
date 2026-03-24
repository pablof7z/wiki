import { Redis } from '@upstash/redis';
import { sortEventIdsForComparison } from './validation';
import type { ComparisonCache } from './types';
import type {
	ComparisonCacheConfig,
	InMemoryComparisonCacheConfig,
	UpstashComparisonCacheConfig
} from './config';

type StoredComparison = {
	comparison: string;
	eventIds: string[];
	createdAt: string;
};

const redisClients = new Map<string, Redis>();
const inMemoryComparisonCaches = new Map<string, Map<string, string>>();

export function createComparisonCacheKey(eventIds: string[], namespace: string): string {
	return `${namespace}:${sortEventIdsForComparison(eventIds).join(':')}`;
}

export function createComparisonCache(config: ComparisonCacheConfig): ComparisonCache {
	if (config.kind === 'memory') {
		return createInMemoryComparisonCache(config);
	}

	return createUpstashComparisonCache(config);
}

export function createUpstashComparisonCache(
	config: UpstashComparisonCacheConfig
): ComparisonCache {
	const redis = getRedisClient(config);

	return {
		async get(eventIds: string[]): Promise<string | null> {
			const cachedValue = await redis.get<StoredComparison | string>(
				createComparisonCacheKey(eventIds, config.namespace)
			);

			if (typeof cachedValue === 'string') {
				return cachedValue;
			}

			if (
				cachedValue &&
				typeof cachedValue === 'object' &&
				typeof cachedValue.comparison === 'string'
			) {
				return cachedValue.comparison;
			}

			return null;
		},

		async set(eventIds: string[], comparison: string): Promise<void> {
			const cachedValue: StoredComparison = {
				comparison,
				eventIds: sortEventIdsForComparison(eventIds),
				createdAt: new Date().toISOString()
			};

			await redis.set(createComparisonCacheKey(eventIds, config.namespace), cachedValue);
		}
	};
}

export function createInMemoryComparisonCache(
	config: InMemoryComparisonCacheConfig
): ComparisonCache {
	const cacheStore = getInMemoryComparisonStore(config.namespace);

	return {
		async get(eventIds: string[]): Promise<string | null> {
			return cacheStore.get(createComparisonCacheKey(eventIds, config.namespace)) ?? null;
		},

		async set(eventIds: string[], comparison: string): Promise<void> {
			cacheStore.set(createComparisonCacheKey(eventIds, config.namespace), comparison);
		}
	};
}

function getRedisClient(config: UpstashComparisonCacheConfig): Redis {
	const clientKey = `${config.url}|${config.token}`;
	const cachedClient = redisClients.get(clientKey);
	if (cachedClient) {
		return cachedClient;
	}

	const redis = new Redis({
		url: config.url,
		token: config.token,
		enableTelemetry: false
	});

	redisClients.set(clientKey, redis);
	return redis;
}

function getInMemoryComparisonStore(namespace: string): Map<string, string> {
	const existingStore = inMemoryComparisonCaches.get(namespace);
	if (existingStore) {
		return existingStore;
	}

	const store = new Map<string, string>();
	inMemoryComparisonCaches.set(namespace, store);
	return store;
}
