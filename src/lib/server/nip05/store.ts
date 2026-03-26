import { getRedis } from '../redis';

const NAMESPACE = 'nip05';
const memoryStore = new Map<string, string>();

function redisKey(name: string): string {
	return `${NAMESPACE}:${name.toLowerCase()}`;
}

export async function getNip05Pubkey(name: string): Promise<string | null> {
	const redis = getRedis();
	if (redis) {
		return redis.get<string>(redisKey(name));
	}
	return memoryStore.get(name.toLowerCase()) ?? null;
}

export async function setNip05(name: string, pubkey: string): Promise<void> {
	const redis = getRedis();
	if (redis) {
		await redis.set(redisKey(name), pubkey);
		return;
	}
	memoryStore.set(name.toLowerCase(), pubkey);
}
