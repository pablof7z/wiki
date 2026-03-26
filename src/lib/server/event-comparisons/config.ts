import { DEFAULT_RELAYS, normalizeRelayUrls, parseRelayUrls } from '$lib/config/nostr-relays';
import { EventComparisonError } from './errors';

export type UpstashComparisonCacheConfig = {
	kind: 'upstash';
	url: string;
	token: string;
	namespace: string;
};

export type InMemoryComparisonCacheConfig = {
	kind: 'memory';
	namespace: string;
};

export type ComparisonCacheConfig = UpstashComparisonCacheConfig | InMemoryComparisonCacheConfig;

export type ComparisonRuntimeConfig = {
	provider: 'ollama';
	relayUrls: string[];
	ollama: {
		baseURL: string;
		model: string;
		headers: Record<string, string>;
	};
	cache: ComparisonCacheConfig;
};

const DEFAULT_CACHE_NAMESPACE = 'event-comparisons:v1';

export function getEventComparisonConfig(
	env: Record<string, string | undefined> = process.env
): ComparisonRuntimeConfig {
	const provider = requireEnv(env, 'COMPARE_AI_PROVIDER').toLowerCase();
	if (provider !== 'ollama') {
		throw new EventComparisonError(
			503,
			'unsupported_provider',
			'COMPARE_AI_PROVIDER must be set to "ollama".'
		);
	}

	const relayOverride = env.COMPARE_NOSTR_RELAY_URLS;
	const relayUrls =
		relayOverride !== undefined
			? parseRelayUrls(relayOverride)
			: normalizeRelayUrls(DEFAULT_RELAYS);

	if (relayOverride !== undefined && relayUrls.length === 0) {
		throw new EventComparisonError(
			503,
			'invalid_relay_config',
			'COMPARE_NOSTR_RELAY_URLS must include at least one relay URL when it is set.'
		);
	}

	return {
		provider: 'ollama',
		relayUrls,
		ollama: {
			baseURL: requireEnv(env, 'COMPARE_OLLAMA_BASE_URL'),
			model: requireEnv(env, 'COMPARE_OLLAMA_MODEL'),
			headers: resolveOllamaHeaders(env)
		},
		cache: resolveCacheConfig(env)
	};
}

function resolveCacheConfig(env: Record<string, string | undefined>): ComparisonCacheConfig {
	const namespace =
		(env.COMPARISON_CACHE_NAMESPACE || DEFAULT_CACHE_NAMESPACE).trim() || DEFAULT_CACHE_NAMESPACE;
	const redisUrl = (env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL)?.trim();
	const redisToken = (env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN)?.trim();

	if (redisUrl && redisToken) {
		return {
			kind: 'upstash',
			url: redisUrl,
			token: redisToken,
			namespace
		};
	}

	if (redisUrl || redisToken) {
		throw new EventComparisonError(
			503,
			'missing_config',
			'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be provided together.'
		);
	}

	return {
		kind: 'memory',
		namespace
	};
}

function resolveOllamaHeaders(env: Record<string, string | undefined>): Record<string, string> {
	const headers = parseHeaderRecord(env.COMPARE_OLLAMA_HEADERS_JSON);
	const apiKey = env.COMPARE_OLLAMA_API_KEY?.trim();

	if (apiKey && !hasHeader(headers, 'authorization')) {
		headers.Authorization = `Bearer ${apiKey}`;
	}

	return headers;
}

function parseHeaderRecord(rawHeaders: string | undefined): Record<string, string> {
	if (!rawHeaders?.trim()) {
		return {};
	}

	let parsedHeaders: unknown;

	try {
		parsedHeaders = JSON.parse(rawHeaders);
	} catch {
		throw new EventComparisonError(
			503,
			'invalid_ollama_headers',
			'COMPARE_OLLAMA_HEADERS_JSON must be valid JSON.'
		);
	}

	if (!parsedHeaders || Array.isArray(parsedHeaders) || typeof parsedHeaders !== 'object') {
		throw new EventComparisonError(
			503,
			'invalid_ollama_headers',
			'COMPARE_OLLAMA_HEADERS_JSON must be a JSON object of header names to string values.'
		);
	}

	const headers: Record<string, string> = {};

	for (const [name, value] of Object.entries(parsedHeaders)) {
		const normalizedName = name.trim();

		if (!normalizedName || typeof value !== 'string' || !value.trim()) {
			throw new EventComparisonError(
				503,
				'invalid_ollama_headers',
				'COMPARE_OLLAMA_HEADERS_JSON must contain only non-empty string header names and values.'
			);
		}

		headers[normalizedName] = value.trim();
	}

	return headers;
}

function hasHeader(headers: Record<string, string>, headerName: string): boolean {
	return Object.keys(headers).some((name) => name.toLowerCase() === headerName.toLowerCase());
}

function requireEnv(env: Record<string, string | undefined>, key: string): string {
	const value = env[key]?.trim();
	if (!value) {
		throw new EventComparisonError(
			503,
			'missing_config',
			`${key} is required for event comparisons.`
		);
	}

	return value;
}
