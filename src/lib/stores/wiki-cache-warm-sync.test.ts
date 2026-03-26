import { get } from 'svelte/store';
import type { NDKFilter } from '@nostr-dev-kit/ndk';
import type { NDKSyncOptions } from '@nostr-dev-kit/sync';
import { describe, expect, it, vi } from 'vitest';
import {
	WIKI_CACHE_WARM_RELAY_URL,
	createWikiCacheWarmSyncController
} from './wiki-cache-warm-sync';

type FakeRelay = {
	url: string;
	connected: boolean;
	listeners: Set<() => void>;
	once: (_event: string, listener: () => void) => FakeRelay;
	off: (_event: string, listener: () => void) => FakeRelay;
	connect: () => Promise<void>;
};

function createRelay(connected = true, url = WIKI_CACHE_WARM_RELAY_URL): FakeRelay {
	const listeners = new Set<() => void>();
	const relay: FakeRelay = {
		url,
		connected,
		listeners,
		once: (_event, listener) => {
			listeners.add(listener);
			return relay;
		},
		off: (_event, listener) => {
			listeners.delete(listener);
			return relay;
		},
		connect: async () => undefined
	};

	return relay;
}

function createController(options?: {
	relay?: FakeRelay;
	createSync?: any;
	now?: () => number;
	getCachedEventIds?: (filters: NDKFilter[]) => Promise<Set<string>>;
	runNegentropySync?: any;
	logError?: (message: string, error: unknown) => void;
}) {
	const relay = options?.relay ?? createRelay(true);

	return createWikiCacheWarmSyncController({
		ndk: {
			pool: {
				relays: new Map([[relay.url, relay as never]])
			},
			addExplicitRelay: vi.fn()
		},
		ndkReady: Promise.resolve(),
		createSync: options?.createSync as never,
		now: options?.now,
		getCachedEventIds: options?.getCachedEventIds,
		runNegentropySync: options?.runNegentropySync,
		logError: options?.logError
	});
}

describe('wiki cache warm sync controller', () => {
	it('updates state from negotiation progress and completes in negentropy mode', async () => {
		const controller = createController({
			now: () => 1000,
			createSync: () => ({
				async checkRelaySupport() {
					return true;
				},
				async sync(_filters: NDKFilter | NDKFilter[], opts?: NDKSyncOptions) {
					return {
						events: [],
						need: new Set(),
						have: new Set()
					};
				},
				async getRelayCapability() {
					return { supportsNegentropy: true };
				}
			}),
			runNegentropySync: async ({ onNegotiationProgress }: { onNegotiationProgress?: any }) => {
				await onNegotiationProgress?.(createRelay(true), {
					phase: 'reconciling',
					round: 2,
					needCount: 18,
					haveCount: 4,
					messageSize: 512,
					timestamp: 1000
				});

				const inFlight = get(controller.state);
				expect(inFlight.status).toBe('running');
				expect(inFlight.mode).toBe('negentropy');
				expect(inFlight.phase).toBe('reconciling');
				expect(inFlight.round).toBe(2);

				return {
					events: [{ id: 'evt-1' }, { id: 'evt-2' }],
					need: new Set(['evt-1', 'evt-2']),
					have: new Set(['evt-3'])
				};
			}
		});

		await controller.start();

		expect(get(controller.state)).toMatchObject({
			status: 'completed',
			mode: 'negentropy',
			phase: 'reconciling',
			round: 2,
			needCount: 2,
			haveCount: 1,
			fetchedCount: 2,
			error: null
		});
	});

	it('marks fallback syncs without negotiation progress as fetch fallback', async () => {
		const getCachedEventIds = vi
			.fn<() => Promise<Set<string>>>()
			.mockResolvedValueOnce(new Set())
			.mockResolvedValueOnce(new Set(['evt-1']));

		const controller = createController({
			getCachedEventIds,
			createSync: () => ({
				async checkRelaySupport() {
					return false;
				},
				async sync() {
					return {
						events: [{ id: 'evt-1' }],
						need: new Set(),
						have: new Set()
					};
				},
				async getRelayCapability() {
					return { supportsNegentropy: false };
				}
			})
		});

		await controller.start();

		expect(get(controller.state)).toMatchObject({
			status: 'completed',
			mode: 'fetch-fallback',
			phase: 'fetching',
			fetchedCount: 1,
			error: null
		});
	});

	it('reports fallback warm count as cache delta instead of total relay results', async () => {
		const getCachedEventIds = vi
			.fn<() => Promise<Set<string>>>()
			.mockResolvedValueOnce(new Set(['evt-1']))
			.mockResolvedValueOnce(new Set(['evt-1']));

		const controller = createController({
			getCachedEventIds,
			createSync: () => ({
				async sync() {
					return {
						events: [{ id: 'evt-1' }, { id: 'evt-2' }],
						need: new Set(),
						have: new Set()
					};
				},
				async getRelayCapability() {
					return { supportsNegentropy: false };
				}
			})
		});

		await controller.start();

		expect(get(controller.state)).toMatchObject({
			status: 'completed',
			mode: 'fetch-fallback',
			fetchedCount: 0
		});
	});

	it('moves into the error state when sync fails', async () => {
		const logError = vi.fn();
		const controller = createController({
			logError,
			createSync: () => ({
				async checkRelaySupport() {
					return false;
				},
				async sync() {
					throw new Error('sync exploded');
				},
				async getRelayCapability() {
					return undefined;
				}
			})
		});

		await expect(controller.start()).resolves.toMatchObject({
			status: 'error',
			error: 'sync exploded'
		});
		expect(logError).toHaveBeenCalled();
	});

	it('refreshes relay capability cache before syncing', async () => {
		const clearCapabilityCache = vi.fn(async () => undefined);
		const controller = createController({
			createSync: () => ({
				clearCapabilityCache,
				async checkRelaySupport() {
					return true;
				},
				async sync() {
					return {
						events: [],
						need: new Set(),
						have: new Set()
					};
				},
				async getRelayCapability() {
					return { supportsNegentropy: true };
				}
			}),
			runNegentropySync: async () => ({
				events: [],
				need: new Set(),
				have: new Set()
			})
		});

		await controller.start();

		expect(clearCapabilityCache).toHaveBeenCalledWith(WIKI_CACHE_WARM_RELAY_URL);
	});

	it('matches connected relays even when the pool stores a trailing slash', async () => {
		const relay = createRelay(true, `${WIKI_CACHE_WARM_RELAY_URL}/`);
			const controller = createController({
				relay,
				createSync: () => ({
					async checkRelaySupport() {
						return false;
					},
					async sync() {
						return {
							events: [],
						need: new Set(),
						have: new Set()
					};
				},
				async getRelayCapability() {
					return { supportsNegentropy: false };
				}
			})
		});

		await controller.start();

		expect(get(controller.state)).toMatchObject({
			status: 'completed',
			relayUrl: `${WIKI_CACHE_WARM_RELAY_URL}/`
		});
	});

	it('starts only once even when called repeatedly', async () => {
		const sync = vi.fn(async () => ({
			events: [],
			need: new Set(),
			have: new Set()
		}));

		const controller = createController({
			createSync: () => ({
				async checkRelaySupport() {
					return false;
				},
				sync,
				async getRelayCapability() {
					return { supportsNegentropy: false };
				}
			})
		});

		await Promise.all([controller.start(), controller.start(), controller.start()]);

		expect(sync).toHaveBeenCalledTimes(1);
	});
});
