import { Redis } from '@upstash/redis';

export type RedisConfig = {
	url: string;
	token: string;
};

let redis: Redis | null = null;
let checked = false;

export function getRedisConfig(): RedisConfig | null {
	const url = (process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL)?.trim();
	const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN)?.trim();

	if (!url || !token) return null;

	return { url, token };
}

export function getRedis(): Redis | null {
	if (redis) return redis;
	if (checked) return null;
	checked = true;

	const config = getRedisConfig();

	if (!config) return null;

	redis = new Redis({ ...config, enableTelemetry: false });
	return redis;
}
