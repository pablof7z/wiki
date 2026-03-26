import { beforeEach, describe, expect, it, vi } from 'vitest';

const connect = vi.fn(async () => undefined);
const ndkConstructor = vi.fn();
const cacheAdapterConstructor = vi.fn();
const cacheAdapterQuery = vi.fn<(...args: unknown[]) => Promise<unknown[]>>(async () => []);
const cacheAdapterSetEvent = vi.fn<(...args: unknown[]) => Promise<void>>(async () => undefined);
const cacheAdapterSetEventDup = vi.fn<(...args: unknown[]) => Promise<void>>(async () => undefined);
const cacheAdapterLoadNip05 = vi.fn<(...args: unknown[]) => Promise<unknown>>(async () => 'missing');
const cacheAdapterSaveNip05 = vi.fn<(...args: unknown[]) => Promise<void>>(async () => undefined);
const getRedis = vi.fn<() => unknown | null>(() => null);
const getRedisConfig = vi.fn<() => { url: string; token: string } | null>(() => null);

vi.mock('@nostr-dev-kit/ndk', () => {
	class MockNDK {
		constructor(options: unknown) {
			ndkConstructor(options);
		}

		connect = connect;
	}

	return {
		default: MockNDK
	};
});

vi.mock('@nostr-dev-kit/cache-upstash', () => {
	class MockCacheAdapter {
		constructor(options: unknown) {
			cacheAdapterConstructor(options);
		}

		query = cacheAdapterQuery;
		setEvent = cacheAdapterSetEvent;
		setEventDup = cacheAdapterSetEventDup;
		loadNip05 = cacheAdapterLoadNip05;
		saveNip05 = cacheAdapterSaveNip05;
	}

	return {
		default: MockCacheAdapter
	};
});

vi.mock('$lib/server/redis', () => ({
	getRedis,
	getRedisConfig
}));

vi.mock('$lib/config/nostr-relays', () => ({
	DEFAULT_RELAYS: ['wss://relay.example']
}));

vi.mock('$lib/utils/nip05', () => ({
	prettifyNip05: (value: string) => value
}));

describe('getServerNdk', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		vi.useRealTimers();
		getRedis.mockReset();
		getRedis.mockReturnValue(null);
		getRedisConfig.mockReset();
		getRedisConfig.mockReturnValue(null);
		cacheAdapterQuery.mockReset();
		cacheAdapterQuery.mockResolvedValue([]);
		cacheAdapterSetEvent.mockReset();
		cacheAdapterSetEvent.mockResolvedValue(undefined);
		cacheAdapterSetEventDup.mockReset();
		cacheAdapterSetEventDup.mockResolvedValue(undefined);
		cacheAdapterLoadNip05.mockReset();
		cacheAdapterLoadNip05.mockResolvedValue('missing');
		cacheAdapterSaveNip05.mockReset();
		cacheAdapterSaveNip05.mockResolvedValue(undefined);
		delete process.env.NDK_SSR_CACHE_NAMESPACE;
		delete process.env.NDK_SSR_CACHE_EXPIRATION_SECONDS;
		delete process.env.NDK_SSR_CACHE_DEBUG;
	});

	it('attaches the upstash cache adapter when redis config is present', async () => {
		getRedisConfig.mockReturnValue({
			url: 'https://redis.example',
			token: 'secret'
		});

		const { getServerNdk } = await import('./nostr');
		await getServerNdk();

		expect(cacheAdapterConstructor).toHaveBeenCalledWith({
			redis: undefined,
			url: 'https://redis.example',
			token: 'secret',
			namespace: 'wikifreedia:ssr:v1',
			expirationTime: 3600
		});
		expect(ndkConstructor).toHaveBeenCalledWith(
			expect.objectContaining({
				cacheAdapter: expect.anything()
			})
		);
	});

	it('reuses an existing redis client when available', async () => {
		const redis = { kind: 'redis-client' };
		getRedisConfig.mockReturnValue({
			url: 'https://redis.example',
			token: 'secret'
		});
		getRedis.mockReturnValue(redis);
		process.env.NDK_SSR_CACHE_NAMESPACE = 'custom:ssr:v2';
		process.env.NDK_SSR_CACHE_EXPIRATION_SECONDS = '900';

		const { getServerNdk } = await import('./nostr');
		await getServerNdk();

		expect(cacheAdapterConstructor).toHaveBeenCalledWith({
			redis,
			url: undefined,
			token: undefined,
			namespace: 'custom:ssr:v2',
			expirationTime: 900
		});
	});

	it('fails open when cache configuration is absent or invalid', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		getRedisConfig.mockReturnValue({
			url: 'https://redis.example',
			token: 'secret'
		});
		cacheAdapterConstructor.mockImplementationOnce(() => {
			throw new Error('boom');
		});
		process.env.NDK_SSR_CACHE_EXPIRATION_SECONDS = 'invalid';

		const { getServerNdk } = await import('./nostr');
		await getServerNdk();

		expect(warn).toHaveBeenCalled();
		expect(ndkConstructor).toHaveBeenCalledWith(
			expect.objectContaining({
				cacheAdapter: undefined
			})
		);

		warn.mockRestore();
	});

	it('logs cache activity when SSR cache debug is enabled', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		getRedisConfig.mockReturnValue({
			url: 'https://redis.example',
			token: 'secret'
		});
		process.env.NDK_SSR_CACHE_DEBUG = 'true';
		cacheAdapterQuery.mockResolvedValueOnce([]);
		cacheAdapterQuery.mockResolvedValueOnce([{ id: 'event-1' }]);
		cacheAdapterLoadNip05.mockResolvedValueOnce('missing');
		cacheAdapterLoadNip05.mockResolvedValueOnce({
			pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52'
		});

		const { getServerNdk } = await import('./nostr');
		await getServerNdk();

		const options = ndkConstructor.mock.calls[0]?.[0] as {
			cacheAdapter: {
				query: (subscription: unknown) => Promise<unknown[]>;
				loadNip05: (identifier: string) => Promise<unknown>;
			};
		};

		await options.cacheAdapter.query({ filters: [{ ids: ['event-1'] }] });
		await options.cacheAdapter.query({ filters: [{ ids: ['event-1'] }] });
		await options.cacheAdapter.loadNip05('_@f7z.io');
		await options.cacheAdapter.loadNip05('_@f7z.io');

		expect(info).toHaveBeenCalledWith(
			expect.stringContaining(
				'[ndk:ssr-cache] enabled namespace=wikifreedia:ssr:v1 expirationSeconds=3600 source=credentials'
			)
		);
		expect(info).toHaveBeenCalledWith(
			expect.stringContaining('[ndk:ssr-cache] query miss filters=ids:1 events=0')
		);
		expect(info).toHaveBeenCalledWith(
			expect.stringContaining('[ndk:ssr-cache] query hit filters=ids:1 events=1')
		);
		expect(info).toHaveBeenCalledWith(
			expect.stringContaining('[ndk:ssr-cache] nip05 miss identifier=_@f7z.io pointer=missing')
		);
		expect(info).toHaveBeenCalledWith(
			expect.stringContaining('[ndk:ssr-cache] nip05 hit identifier=_@f7z.io pointer=pubkey:fa984bd7...8f52')
		);

		info.mockRestore();
	});

	it('fails open when a profile fetch hangs', async () => {
		vi.useFakeTimers();

		const { loadUserProfile } = await import('./nostr');
		const user = {
			profile: undefined,
			fetchProfile: vi.fn(() => new Promise<never>(() => undefined))
		};

		const profilePromise = loadUserProfile(user as never);
		await vi.advanceTimersByTimeAsync(1200);

		await expect(profilePromise).resolves.toBeUndefined();
	});
});
