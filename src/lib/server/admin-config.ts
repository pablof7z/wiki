import { Redis } from '@upstash/redis';

const ADMIN_CONFIG_KEY = 'admin:comparison-config';

export type AdminComparisonConfig = {
	model?: string;
	systemPrompt?: string;
};

let redis: Redis | null = null;

function getRedis(): Redis | null {
	const url = (process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL)?.trim();
	const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN)?.trim();
	if (!url || !token) return null;
	if (!redis) {
		redis = new Redis({ url, token, enableTelemetry: false });
	}
	return redis;
}

export async function getAdminComparisonConfig(): Promise<AdminComparisonConfig> {
	const client = getRedis();
	if (!client) return {};
	try {
		return (await client.get<AdminComparisonConfig>(ADMIN_CONFIG_KEY)) ?? {};
	} catch {
		return {};
	}
}

export async function setAdminComparisonConfig(config: AdminComparisonConfig): Promise<void> {
	const client = getRedis();
	if (!client) throw new Error('Redis not configured');
	await client.set(ADMIN_CONFIG_KEY, config);
}

export function isAdminTokenValid(token: string | undefined): boolean {
	const adminToken = process.env.ADMIN_TOKEN?.trim();
	return Boolean(adminToken && token === adminToken);
}
