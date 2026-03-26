import {
	NDKRelaySet,
	NDKSubscriptionCacheUsage,
	type NDKEvent,
	type NDKFilter,
	type NDKRelay
} from '@nostr-dev-kit/ndk';
import {
	NDKSync,
	NegentropyStorage,
	SyncSession,
	type NDKSyncOptions,
	type NDKSyncResult
} from '@nostr-dev-kit/sync';
import { readonly, writable, type Readable } from 'svelte/store';
import { ndk, ndkReady } from '$lib/ndk.svelte';

export const WIKI_CACHE_WARM_RELAY_URL = 'wss://relay.wikifreedia.xyz';
export const WIKI_CACHE_WARM_FILTERS: NDKFilter[] = [{ kinds: [30818] }];
export const WIKI_CACHE_WARM_READY_TIMEOUT_MS = 5000;
export const WIKI_CACHE_WARM_SYNC_TIMEOUT_MS = 30000;
export const WIKI_CACHE_QUERY_TIMEOUT_MS = 5000;

export type WikiCacheWarmSyncStatus = 'idle' | 'waiting' | 'running' | 'completed' | 'error';
export type WikiCacheWarmSyncMode = 'unknown' | 'negentropy' | 'fetch-fallback';
export type WikiCacheWarmSyncPhase = 'initiating' | 'reconciling' | 'closing' | 'fetching';

export type WikiCacheWarmSyncState = {
	status: WikiCacheWarmSyncStatus;
	relayUrl: string;
	mode: WikiCacheWarmSyncMode;
	phase: WikiCacheWarmSyncPhase | null;
	round: number;
	needCount: number;
	haveCount: number;
	fetchedCount: number;
	messageSize: number;
	startedAt: number | null;
	completedAt: number | null;
	error: string | null;
};

type NegotiationProgressHandler = NonNullable<NDKSyncOptions['onNegotiationProgress']>;
type NegotiationProgress = Parameters<NegotiationProgressHandler>[1];
type RelayCapability = Awaited<ReturnType<NDKSync['getRelayCapability']>>;

type RelayLike = Pick<NDKRelay, 'url' | 'connected' | 'once' | 'off' | 'connect'>;

type SyncLike = Pick<NDKSync, 'sync' | 'getRelayCapability' | 'checkRelaySupport'> & {
	clearCapabilityCache?: (relayUrl?: string) => Promise<void>;
};

type ControllerNdk = {
	pool: {
		relays: Map<string, RelayLike>;
	};
	addExplicitRelay?: (relayUrl: string) => void;
};

type CreateWikiCacheWarmSyncControllerOptions<TNdk extends ControllerNdk> = {
	ndk: TNdk;
	ndkReady: Promise<unknown>;
	relayUrl?: string;
	filters?: NDKFilter[];
	readyTimeoutMs?: number;
	syncTimeoutMs?: number;
	now?: () => number;
	createSync?: (ndk: TNdk) => SyncLike;
	getCachedEventIds?: (filters: NDKFilter[]) => Promise<Set<string>>;
	runNegentropySync?: (params: {
		relay: RelayLike;
		filter: NDKFilter;
		timeout: number;
		onNegotiationProgress?: (relay: RelayLike, progress: NegotiationProgress) => void;
	}) => Promise<NDKSyncResult>;
	logError?: (message: string, error: unknown) => void;
};

export type WikiCacheWarmSyncController = {
	state: Readable<WikiCacheWarmSyncState>;
	start: () => Promise<WikiCacheWarmSyncState>;
	getSnapshot: () => WikiCacheWarmSyncState;
};

export const initialWikiCacheWarmSyncState: WikiCacheWarmSyncState = {
	status: 'idle',
	relayUrl: WIKI_CACHE_WARM_RELAY_URL,
	mode: 'unknown',
	phase: null,
	round: 0,
	needCount: 0,
	haveCount: 0,
	fetchedCount: 0,
	messageSize: 0,
	startedAt: null,
	completedAt: null,
	error: null
};

function createState(relayUrl: string): WikiCacheWarmSyncState {
	return {
		...initialWikiCacheWarmSyncState,
		relayUrl
	};
}

function toErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function resolveMode(currentMode: WikiCacheWarmSyncMode, capability?: RelayCapability): WikiCacheWarmSyncMode {
	if (currentMode === 'negentropy') return currentMode;
	if (capability?.supportsNegentropy) return 'negentropy';
	return 'fetch-fallback';
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;

	const timeoutPromise = new Promise<T>((_, reject) => {
		timer = setTimeout(() => {
			reject(new Error(message));
		}, timeoutMs);
	});

	return Promise.race([promise, timeoutPromise]).finally(() => {
		if (timer) clearTimeout(timer);
	});
}

function normalizeRelayUrl(relayUrl: string): string {
	return relayUrl.trim().replace(/\/+$/, '');
}

function getRelayFromPool<TNdk extends ControllerNdk>(targetNdk: TNdk, relayUrl: string): RelayLike | undefined {
	const normalizedRelayUrl = normalizeRelayUrl(relayUrl);

	return Array.from(targetNdk.pool.relays.values()).find(
		(relay) => normalizeRelayUrl(relay.url) === normalizedRelayUrl
	);
}

function ensureRelay<TNdk extends ControllerNdk>(targetNdk: TNdk, relayUrl: string): RelayLike | undefined {
	let relay = getRelayFromPool(targetNdk, relayUrl);
	if (relay) return relay;

	targetNdk.addExplicitRelay?.(relayUrl);
	relay = getRelayFromPool(targetNdk, relayUrl);
	return relay;
}

function waitForRelayReady(relay: RelayLike, timeoutMs: number): Promise<boolean> {
	if (relay.connected) return Promise.resolve(true);

	return new Promise((resolve) => {
		let settled = false;
		let timer: ReturnType<typeof setTimeout> | undefined;

		const finish = (ready: boolean) => {
			if (settled) return;
			settled = true;
			if (timer) clearTimeout(timer);
			relay.off('ready', onReady);
			resolve(ready);
		};

		const onReady = () => finish(true);

		relay.once('ready', onReady);
		void Promise.resolve(relay.connect?.(timeoutMs)).catch(() => undefined);

		timer = setTimeout(() => finish(false), timeoutMs);
	});
}

async function queryCachedEventIds(filters: NDKFilter[]): Promise<Set<string>> {
	if (!ndk.cacheAdapter) return new Set();

	const ids = new Set<string>();

	return new Promise((resolve) => {
		const sub = ndk.subscribe(filters, {
			cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
			closeOnEose: true,
			onEvents: (events) => {
				for (const event of events) {
					if (event.id) ids.add(event.id);
				}
			},
			onEvent: (event) => {
				if (event.id) ids.add(event.id);
			},
			onEose: () => {
				resolve(ids);
			}
		});

		setTimeout(() => {
			sub.stop();
			resolve(ids);
		}, WIKI_CACHE_QUERY_TIMEOUT_MS);
	});
}

async function queryCachedEvents(filters: NDKFilter[]): Promise<NDKEvent[]> {
	if (!ndk.cacheAdapter) return [];

	const eventMap = new Map<string, NDKEvent>();

	return new Promise((resolve) => {
		const sub = ndk.subscribe(filters, {
			cacheUsage: NDKSubscriptionCacheUsage.ONLY_CACHE,
			closeOnEose: true,
			onEvents: (events) => {
				for (const event of events) {
					if (event.id) eventMap.set(event.id, event);
				}
			},
			onEvent: (event) => {
				if (event.id) eventMap.set(event.id, event);
			},
			onEose: () => {
				resolve(Array.from(eventMap.values()));
			}
		});

		setTimeout(() => {
			sub.stop();
			resolve(Array.from(eventMap.values()));
		}, WIKI_CACHE_QUERY_TIMEOUT_MS);
	});
}

async function saveEventsToCache(events: NDKEvent[], filters: NDKFilter[], relay: RelayLike): Promise<void> {
	for (const event of events) {
		await ndk.cacheAdapter?.setEvent?.(event, filters, relay as NDKRelay);
	}
}

async function fetchEventsFromRelay(filters: NDKFilter | NDKFilter[], relay: RelayLike): Promise<NDKEvent[]> {
	const relaySet = NDKRelaySet.fromRelayUrls([relay.url], ndk);
	const events = await ndk.guardrailOff('fetch-events-usage').fetchEvents(filters, {
		relaySet,
		groupable: false,
		subId: 'wiki-cache-warm-fetch'
	});

	return Array.from(events);
}

async function syncSingleFilterWithNegentropy(params: {
	relay: RelayLike;
	filter: NDKFilter;
	timeout: number;
	onNegotiationProgress?: (relay: RelayLike, progress: NegotiationProgress) => void;
}): Promise<NDKSyncResult> {
	const cachedEvents = await queryCachedEvents([params.filter]);
	const storage = NegentropyStorage.fromEvents(cachedEvents);
	const session = new SyncSession(params.relay as NDKRelay, params.filter as never, storage, {
		timeout: params.timeout
	});

	params.onNegotiationProgress &&
		session.on('progress', (progress) => {
			params.onNegotiationProgress?.(params.relay, progress as NegotiationProgress);
		});

	const { need, have } = await session.start();
	let events: NDKEvent[] = [];

	if (need.size > 0) {
		params.onNegotiationProgress?.(params.relay, {
			phase: 'fetching',
			round: 0,
			needCount: need.size,
			haveCount: have.size,
			messageSize: 0,
			timestamp: Date.now()
		});

		events = await fetchEventsFromRelay({ ids: Array.from(need) }, params.relay);
		await saveEventsToCache(events, [params.filter], params.relay);
	}

	return {
		events,
		need,
		have
	};
}

export function createWikiCacheWarmSyncController<TNdk extends ControllerNdk>(
	options: CreateWikiCacheWarmSyncControllerOptions<TNdk>
): WikiCacheWarmSyncController {
	const relayUrl = options.relayUrl ?? WIKI_CACHE_WARM_RELAY_URL;
	const filters = options.filters ?? WIKI_CACHE_WARM_FILTERS;
	const readyTimeoutMs = options.readyTimeoutMs ?? WIKI_CACHE_WARM_READY_TIMEOUT_MS;
	const syncTimeoutMs = options.syncTimeoutMs ?? WIKI_CACHE_WARM_SYNC_TIMEOUT_MS;
	const now = options.now ?? Date.now;
	const createSync = options.createSync ?? ((targetNdk: TNdk) => new NDKSync(targetNdk as never));
	const getCachedEventIds = options.getCachedEventIds ?? (async () => new Set<string>());
	const runNegentropySync = options.runNegentropySync ?? syncSingleFilterWithNegentropy;
	const logError = options.logError ?? ((message: string, error: unknown) => console.error(message, error));

	const store = writable<WikiCacheWarmSyncState>(createState(relayUrl));
	let currentState = createState(relayUrl);
	let startPromise: Promise<WikiCacheWarmSyncState> | undefined;

	const setState = (patch: Partial<WikiCacheWarmSyncState>) => {
		currentState = {
			...currentState,
			...patch
		};
		store.set(currentState);
	};

	const fail = (error: unknown): WikiCacheWarmSyncState => {
		const message = toErrorMessage(error);
		logError('[wiki-cache-sync] Failed to warm wiki cache:', error);
		setState({
			status: 'error',
			completedAt: now(),
			error: message
		});
		return currentState;
	};

	const start = async (): Promise<WikiCacheWarmSyncState> => {
		if (startPromise) return startPromise;

		startPromise = (async () => {
			try {
				setState({
					status: 'waiting',
					mode: 'unknown',
					phase: null,
					round: 0,
					needCount: 0,
					haveCount: 0,
					fetchedCount: 0,
					messageSize: 0,
					startedAt: now(),
					completedAt: null,
					error: null
				});

				await options.ndkReady;

				const relay = ensureRelay(options.ndk, relayUrl);
				if (!relay) {
					throw new Error(`Relay ${relayUrl} is not available in the NDK pool`);
				}

				setState({ relayUrl: relay.url });
				await waitForRelayReady(relay, readyTimeoutMs);
				setState({ status: 'running' });

				let relayError: Error | undefined;
				const cachedEventIdsBefore = await getCachedEventIds(filters);
				const sync = createSync(options.ndk);
				await sync.clearCapabilityCache?.(relay.url);
				const supportsNegentropy = (await sync.checkRelaySupport?.(relay as NDKRelay)) ?? false;
				const handleNegotiationProgress = (_relay: RelayLike, progress: NegotiationProgress) => {
					setState({
						status: 'running',
						mode: 'negentropy',
						phase: progress.phase,
						round: progress.round,
						needCount: progress.needCount,
						haveCount: progress.haveCount,
						messageSize: progress.messageSize
					});
				};

				const result = supportsNegentropy
					? await runNegentropySync({
							relay,
							filter: filters[0],
							timeout: syncTimeoutMs,
							onNegotiationProgress: handleNegotiationProgress
						})
					: await withTimeout(
							sync.sync(filters, {
								relayUrls: [relay.url],
								onRelayError: (_relay, error) => {
									relayError = error;
								},
								onNegotiationProgress: (_relay, progress: NegotiationProgress) => {
									handleNegotiationProgress(relay, progress);
								}
							}),
							syncTimeoutMs,
							`Wiki cache sync timed out after ${syncTimeoutMs}ms`
						);

				if (relayError) throw relayError;

				const capability = await sync.getRelayCapability(relay.url);
				const mode = resolveMode(currentState.mode, capability);
				const phase =
					currentState.phase ?? (mode === 'fetch-fallback' ? 'fetching' : currentState.phase);
				const cachedEventIdsAfter =
					mode === 'fetch-fallback' ? await getCachedEventIds(filters) : cachedEventIdsBefore;
				const fetchedCount =
					mode === 'fetch-fallback'
						? Math.max(0, cachedEventIdsAfter.size - cachedEventIdsBefore.size)
						: result.events.length;

				setState({
					status: 'completed',
					mode,
					phase,
					needCount: result.need.size || currentState.needCount,
					haveCount: result.have.size || currentState.haveCount,
					fetchedCount,
					completedAt: now(),
					error: null
				});

				return currentState;
			} catch (error) {
				return fail(error);
			}
		})();

		return startPromise;
	};

	return {
		state: readonly(store),
		start,
		getSnapshot: () => currentState
	};
}

const wikiCacheWarmSyncController = createWikiCacheWarmSyncController({
	ndk,
	ndkReady,
	getCachedEventIds: queryCachedEventIds
});

export const wikiCacheWarmSync = wikiCacheWarmSyncController.state;

export function startWikiCacheWarmSync(): Promise<WikiCacheWarmSyncState> {
	return wikiCacheWarmSyncController.start();
}
