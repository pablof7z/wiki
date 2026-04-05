import NDKCacheUpstashAdapter from '@nostr-dev-kit/cache-upstash';
import NDK, {
	NDKRelaySet,
	NDKSubscriptionCacheUsage,
	type NDKEvent,
	type NDKUser,
	type NDKUserProfile
} from '@nostr-dev-kit/ndk';
import { DEFAULT_RELAYS, normalizeRelayUrls } from '$lib/config/nostr-relays';
import { getRedis, getRedisConfig } from '$lib/server/redis';
import {
	applyCachedNip05ToProfile,
	getCachedPubkeyForNip05,
	rememberUserProfileNip05
} from '$lib/utils/nip05-cache';
import { looksLikeNip05, prettifyNip05 } from '$lib/utils/nip05';
import { nip19 } from 'nostr-tools';

const NDK_CONNECT_TIMEOUT_MS = 2500;
const EVENT_FETCH_TIMEOUT_MS = 4000;
const NIP05_FETCH_TIMEOUT_MS = 2500;
const PROFILE_FETCH_TIMEOUT_MS = 1200;
const PROFILE_EVENT_FETCH_TIMEOUT_MS = 4000;
const DEFAULT_CACHE_NAMESPACE = 'wikifreedia:ssr:v1';
const DEFAULT_CACHE_EXPIRATION_SECONDS = 3600;
const CACHE_DEBUG_PATCHED = Symbol('wikifreedia.ssr-cache.debug-patched');

const ndkClients = new Map<string, Promise<NDK>>();
let serverCacheAdapter: NDKCacheUpstashAdapter | null | undefined;
let cacheWarningLogged = false;

export async function getServerNdk(relayUrls: readonly string[] = DEFAULT_RELAYS): Promise<NDK> {
	const relayKey = relayUrls.join(',');
	const existingClient = ndkClients.get(relayKey);
	if (existingClient) {
		return existingClient;
	}

	const clientPromise = (async () => {
		const ndk = new NDK({
			explicitRelayUrls: [...relayUrls],
			enableOutboxModel: false,
			clientName: 'wikifreedia',
			cacheAdapter: getServerCacheAdapter()
		});

		await ndk.connect(NDK_CONNECT_TIMEOUT_MS);
		return ndk;
	})();

	ndkClients.set(relayKey, clientPromise);

	try {
		return await clientPromise;
	} catch (error) {
		ndkClients.delete(relayKey);
		throw error;
	}
}

export async function fetchUserWithProfile(
	identifier: string,
	relayUrls: readonly string[] = DEFAULT_RELAYS
): Promise<{ user?: NDKUser; profile?: NDKUserProfile }> {
	const ndk = await getServerNdk(relayUrls);
	const resolvedPubkey = await resolvePubkeyFromIdentifier(identifier);
	const user = resolvedPubkey ? ndk.getUser({ pubkey: resolvedPubkey }) : await ndk.fetchUser(identifier);
	if (!user) {
		return {};
	}

	user.profile = applyCachedNip05ToProfile(user.pubkey, user.profile);
	rememberUserProfileNip05(user.pubkey, user.profile);

	const profile = await loadUserProfile(user);

	return {
		user,
		profile
	};
}

export async function fetchEventByAddress(
	address: string,
	relayUrls: readonly string[] = DEFAULT_RELAYS
): Promise<NDKEvent | undefined> {
	const pointer = decodeAddressPointer(address);
	const candidateRelayUrls = normalizeRelayUrls([
		...relayUrls,
		...(pointer?.relays ?? []),
		...DEFAULT_RELAYS
	]);
	const ndk = await getServerNdk(candidateRelayUrls);
	const relaySet =
		candidateRelayUrls.length > 0 ? NDKRelaySet.fromRelayUrls(candidateRelayUrls, ndk, true) : undefined;
	const attempts = [
		() => withTimeout(ndk.fetchEvent(address, { closeOnEose: true }, relaySet), EVENT_FETCH_TIMEOUT_MS),
		pointer
			? () =>
					withTimeout(
						ndk.fetchEvent(addressFilter(pointer), { closeOnEose: true }, relaySet),
						EVENT_FETCH_TIMEOUT_MS
					)
			: undefined,
		() =>
			withTimeout(
				ndk.fetchEvent(
					address,
					{
						closeOnEose: true,
						cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
					},
					relaySet
				),
				EVENT_FETCH_TIMEOUT_MS
			),
		pointer
			? () =>
					withTimeout(
						ndk.fetchEvent(
							addressFilter(pointer),
							{
								closeOnEose: true,
								cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
							},
							relaySet
						),
						EVENT_FETCH_TIMEOUT_MS
					)
			: undefined
	].filter((attempt): attempt is () => Promise<NDKEvent | undefined | null> => Boolean(attempt));

	for (const attempt of attempts) {
		const event = await attempt();
		if (event) {
			return event;
		}
	}

	return undefined;
}

export async function loadUserProfile(user: NDKUser): Promise<NDKUserProfile | undefined> {
	try {
		if (user.profile) {
			user.profile = applyCachedNip05ToProfile(user.pubkey, user.profile);
			rememberUserProfileNip05(user.pubkey, user.profile);
			return user.profile;
		}

		const profile =
			(await withTimeout(
				user.fetchProfile({ closeOnEose: true }, true),
				PROFILE_FETCH_TIMEOUT_MS
			)) ??
			user.profile ??
			undefined;
		const nextProfile = applyCachedNip05ToProfile(user.pubkey, profile);
		rememberUserProfileNip05(user.pubkey, nextProfile);
		return nextProfile;
	} catch {
		const fallbackProfile = applyCachedNip05ToProfile(user.pubkey, user.profile ?? undefined);
		rememberUserProfileNip05(user.pubkey, fallbackProfile);
		return fallbackProfile;
	}
}

export async function fetchProfileByPubkey(
	pubkey: string,
	relayUrls: readonly string[] = DEFAULT_RELAYS
): Promise<NDKUserProfile | undefined> {
	const ndk = await getServerNdk(relayUrls);
	const fetchedProfiles = await withTimeout(
		ndk.fetchEvents(
			{
				kinds: [0],
				authors: [pubkey]
			},
			{ closeOnEose: true }
		),
		PROFILE_EVENT_FETCH_TIMEOUT_MS
	);

	let latestProfileEvent: NDKEvent | undefined;
	for (const event of Array.from(fetchedProfiles ?? [])) {
		if (!latestProfileEvent || (event.created_at ?? 0) > (latestProfileEvent.created_at ?? 0)) {
			latestProfileEvent = event;
		}
	}

	if (!latestProfileEvent) return undefined;

	try {
		const parsedProfile = JSON.parse(latestProfileEvent.content) as unknown;
		if (!parsedProfile || typeof parsedProfile !== 'object' || Array.isArray(parsedProfile)) {
			return undefined;
		}

		const profile = applyCachedNip05ToProfile(pubkey, parsedProfile as NDKUserProfile);
		rememberUserProfileNip05(pubkey, profile);
		return profile;
	} catch {
		return undefined;
	}
}

export function shortenHexPubkey(pubkey: string): string {
	if (pubkey.length <= 16) return pubkey;

	return `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`;
}

export function getPreferredDisplayName(
	profile: NDKUserProfile | undefined,
	fallback: string
): string {
	const authorName =
		profile?.displayName || profile?.name || prettifyNip05(profile?.nip05 ?? '') || fallback;

	return authorName.trim() || fallback;
}

function getServerCacheAdapter(): NDKCacheUpstashAdapter | undefined {
	if (serverCacheAdapter !== undefined) {
		return serverCacheAdapter ?? undefined;
	}

	const redisConfig = getRedisConfig();
	if (!redisConfig) {
		serverCacheAdapter = null;
		return undefined;
	}

	try {
		const redis = getRedis();
		const namespace = getCacheNamespace();
		const expirationTime = getCacheExpirationSeconds();
		serverCacheAdapter = new NDKCacheUpstashAdapter({
			redis: redis ?? undefined,
			url: redis ? undefined : redisConfig.url,
			token: redis ? undefined : redisConfig.token,
			namespace,
			expirationTime
		});
		withServerCacheDebugLogging(serverCacheAdapter, {
			namespace,
			expirationTime,
			source: redis ? 'redis-client' : 'credentials'
		});
		return serverCacheAdapter;
	} catch (error) {
		logCacheWarning('Failed to initialize the SSR NDK cache adapter; continuing without cache.', error);
		serverCacheAdapter = null;
		return undefined;
	}
}

function getCacheNamespace(): string {
	return process.env.NDK_SSR_CACHE_NAMESPACE?.trim() || DEFAULT_CACHE_NAMESPACE;
}

function getCacheExpirationSeconds(): number {
	const rawValue = process.env.NDK_SSR_CACHE_EXPIRATION_SECONDS?.trim();
	if (!rawValue) return DEFAULT_CACHE_EXPIRATION_SECONDS;

	const parsedValue = Number.parseInt(rawValue, 10);
	if (Number.isFinite(parsedValue) && parsedValue > 0) {
		return parsedValue;
	}

	logCacheWarning(
		`Invalid NDK_SSR_CACHE_EXPIRATION_SECONDS="${rawValue}". Falling back to ${DEFAULT_CACHE_EXPIRATION_SECONDS}.`
	);

	return DEFAULT_CACHE_EXPIRATION_SECONDS;
}

function logCacheWarning(message: string, error?: unknown): void {
	if (cacheWarningLogged) return;
	cacheWarningLogged = true;

	if (error) {
		console.warn(`[ndk:ssr-cache] ${message}`, error);
		return;
	}

	console.warn(`[ndk:ssr-cache] ${message}`);
}

type CacheDebugContext = {
	namespace: string;
	expirationTime: number;
	source: 'credentials' | 'redis-client';
};

type ProfileCapableCacheAdapter = NDKCacheUpstashAdapter & {
	fetchProfile?: (pubkey: string) => Promise<unknown>;
	saveProfile?: (pubkey: string, profile: unknown) => Promise<void> | void;
};

type DebuggableCacheAdapter = NDKCacheUpstashAdapter & {
	[CACHE_DEBUG_PATCHED]?: true;
};

function withServerCacheDebugLogging(
	adapter: NDKCacheUpstashAdapter,
	context: CacheDebugContext
): NDKCacheUpstashAdapter {
	if (!isCacheDebugEnabled()) return adapter;

	const debuggableAdapter = adapter as DebuggableCacheAdapter;
	if (debuggableAdapter[CACHE_DEBUG_PATCHED]) return adapter;
	debuggableAdapter[CACHE_DEBUG_PATCHED] = true;

	const originalQuery = adapter.query.bind(adapter) as NDKCacheUpstashAdapter['query'];
	debuggableAdapter.query = (async (
		...args: Parameters<NDKCacheUpstashAdapter['query']>
	): Promise<Awaited<ReturnType<NDKCacheUpstashAdapter['query']>>> => {
		const [subscription] = args;
		const filters = getSubscriptionFilters(subscription);
		const startedAt = Date.now();
		const events = await originalQuery(...args);
		logCacheDebug(
			`query ${events.length > 0 ? 'hit' : 'miss'} filters=${summarizeFilters(filters)} events=${events.length} durationMs=${Date.now() - startedAt}`
		);
		return events;
	}) as NDKCacheUpstashAdapter['query'];

	const originalSetEvent = adapter.setEvent.bind(adapter) as NDKCacheUpstashAdapter['setEvent'];
	debuggableAdapter.setEvent = (async (
		...args: Parameters<NDKCacheUpstashAdapter['setEvent']>
	): Promise<Awaited<ReturnType<NDKCacheUpstashAdapter['setEvent']>>> => {
		const [event, filters, relay] = args;
		const result = await originalSetEvent(...args);
		logCacheDebug(
			`store event=${summarizeEventId(getEventId(event))} filters=${summarizeFilters(filters)} relay=${summarizeRelay(relay)}`
		);
		return result;
	}) as NDKCacheUpstashAdapter['setEvent'];

	const originalSetEventDup = adapter.setEventDup.bind(adapter) as NDKCacheUpstashAdapter['setEventDup'];
	debuggableAdapter.setEventDup = (async (
		...args: Parameters<NDKCacheUpstashAdapter['setEventDup']>
	): Promise<Awaited<ReturnType<NDKCacheUpstashAdapter['setEventDup']>>> => {
		const [event, relay] = args;
		const result = await originalSetEventDup(...args);
		logCacheDebug(
			`dup event=${summarizeEventId(getEventId(event))} relay=${summarizeRelay(relay)}`
		);
		return result;
	}) as NDKCacheUpstashAdapter['setEventDup'];

	const originalLoadNip05 = adapter.loadNip05.bind(adapter) as NDKCacheUpstashAdapter['loadNip05'];
	debuggableAdapter.loadNip05 = (async (
		...args: Parameters<NDKCacheUpstashAdapter['loadNip05']>
	): Promise<Awaited<ReturnType<NDKCacheUpstashAdapter['loadNip05']>>> => {
		const [identifier] = args;
		const result = await originalLoadNip05(...args);
		logCacheDebug(
			`nip05 ${result === 'missing' ? 'miss' : 'hit'} identifier=${identifier} pointer=${summarizeNip05Pointer(result)}`
		);
		return result;
	}) as NDKCacheUpstashAdapter['loadNip05'];

	const originalSaveNip05 = adapter.saveNip05.bind(adapter) as NDKCacheUpstashAdapter['saveNip05'];
	debuggableAdapter.saveNip05 = (async (
		...args: Parameters<NDKCacheUpstashAdapter['saveNip05']>
	): Promise<Awaited<ReturnType<NDKCacheUpstashAdapter['saveNip05']>>> => {
		const [identifier, pointer] = args;
		const result = await originalSaveNip05(...args);
		logCacheDebug(`save-nip05 identifier=${identifier} pointer=${summarizeNip05Pointer(pointer)}`);
		return result;
	}) as NDKCacheUpstashAdapter['saveNip05'];

	const profileCapableAdapter = debuggableAdapter as DebuggableCacheAdapter & ProfileCapableCacheAdapter;
	if (typeof profileCapableAdapter.fetchProfile === 'function') {
		const originalFetchProfile = profileCapableAdapter.fetchProfile.bind(profileCapableAdapter);
		profileCapableAdapter.fetchProfile = (async (pubkey: string): Promise<unknown> => {
			const result = await originalFetchProfile(pubkey);
			logCacheDebug(
				`profile ${result ? 'hit' : 'miss'} pubkey=${summarizeEventId(pubkey)} fields=${summarizeProfileFields(result)}`
			);
			return result;
		}) as ProfileCapableCacheAdapter['fetchProfile'];
	}

	if (typeof profileCapableAdapter.saveProfile === 'function') {
		const originalSaveProfile = profileCapableAdapter.saveProfile.bind(profileCapableAdapter);
		profileCapableAdapter.saveProfile = (async (pubkey: string, profile: unknown): Promise<void> => {
			await originalSaveProfile(pubkey, profile);
			logCacheDebug(
				`save-profile pubkey=${summarizeEventId(pubkey)} fields=${summarizeProfileFields(profile)}`
			);
		}) as ProfileCapableCacheAdapter['saveProfile'];
	}

	logCacheDebug(
		`enabled namespace=${context.namespace} expirationSeconds=${context.expirationTime} source=${context.source}`
	);

	return adapter;
}

function isCacheDebugEnabled(): boolean {
	const value = process.env.NDK_SSR_CACHE_DEBUG?.trim().toLowerCase();
	return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}

function logCacheDebug(message: string): void {
	console.info(`[ndk:ssr-cache] ${message}`);
}

function getSubscriptionFilters(subscription: Parameters<NDKCacheUpstashAdapter['query']>[0]): unknown[] {
	const maybeFilters = (subscription as { filters?: unknown }).filters;
	return Array.isArray(maybeFilters) ? maybeFilters : [];
}

function summarizeFilters(filters: unknown[] | undefined): string {
	if (!filters || filters.length === 0) return 'none';
	return filters.map((filter) => summarizeFilter(filter)).join(';');
}

function summarizeFilter(filter: unknown): string {
	if (!filter || typeof filter !== 'object') return 'unknown';

	const record = filter as Record<string, unknown>;
	if (isStringArray(record.ids)) {
		return `ids:${record.ids.length}`;
	}

	if (isNumberArray(record.kinds) && isStringArray(record['#d'])) {
		return `kinds:${record.kinds.join(',')}|d:${record['#d'].length}`;
	}

	if (isStringArray(record.authors) && isNumberArray(record.kinds)) {
		const dTags = record['#d'];
		if (isStringArray(dTags)) {
			return `authors:${record.authors.length}|kinds:${record.kinds.join(',')}|d:${dTags.length}`;
		}

		return `authors:${record.authors.length}|kinds:${record.kinds.join(',')}`;
	}

	const keys = Object.keys(record).sort();
	return keys.length > 0 ? `unsupported:${keys.join(',')}` : 'empty';
}

function summarizeEventId(eventId: string | undefined): string {
	if (!eventId) return 'unknown';
	if (eventId.length <= 12) return eventId;
	return `${eventId.slice(0, 8)}...${eventId.slice(-4)}`;
}

function getEventId(event: Parameters<NDKCacheUpstashAdapter['setEvent']>[0]): string | undefined {
	const eventWithId = event as { id?: unknown; rawEvent?: () => { id?: unknown } };
	if (typeof eventWithId.id === 'string' && eventWithId.id.length > 0) {
		return eventWithId.id;
	}

	const rawEventId = eventWithId.rawEvent?.().id;
	return typeof rawEventId === 'string' && rawEventId.length > 0 ? rawEventId : undefined;
}

function summarizeRelay(relay: unknown): string {
	const relayUrl = (relay as { url?: unknown } | undefined)?.url;
	return typeof relayUrl === 'string' && relayUrl.length > 0 ? relayUrl : 'none';
}

function summarizeNip05Pointer(pointer: Awaited<ReturnType<NDKCacheUpstashAdapter['loadNip05']>>): string {
	if (pointer === 'missing') return 'missing';
	if (!pointer || typeof pointer !== 'object') return 'unknown';

	const pubkey = (pointer as { pubkey?: unknown }).pubkey;
	if (typeof pubkey === 'string' && pubkey.length > 0) {
		return `pubkey:${summarizeEventId(pubkey)}`;
	}

	return 'object';
}

function summarizeProfileFields(profile: unknown): string {
	if (!profile || typeof profile !== 'object') return 'none';

	const keys = Object.keys(profile as Record<string, unknown>)
		.filter((key) => key !== 'cachedAt')
		.sort();

	return keys.length > 0 ? keys.join(',') : 'none';
}

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isNumberArray(value: unknown): value is number[] {
	return Array.isArray(value) && value.every((entry) => typeof entry === 'number');
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | undefined> {
	return Promise.race([
		promise,
		new Promise<undefined>((resolve) => {
			setTimeout(resolve, timeoutMs);
		})
	]);
}

type AddressPointer = {
	pubkey: string;
	identifier: string;
	kind: number;
	relays: string[];
};

async function resolvePubkeyFromIdentifier(identifier: string): Promise<string | undefined> {
	const cachedPubkey = getCachedPubkeyForNip05(identifier);
	if (cachedPubkey) return cachedPubkey;

	const normalizedIdentifier = identifier.trim();
	if (/^[0-9a-f]{64}$/i.test(normalizedIdentifier)) {
		return normalizedIdentifier.toLowerCase();
	}

	if (normalizedIdentifier.startsWith('npub1')) {
		try {
			const decoded = nip19.decode(normalizedIdentifier);
			if (decoded.type === 'npub' && typeof decoded.data === 'string') {
				return decoded.data.toLowerCase();
			}
		} catch {
			return undefined;
		}
	}

	if (!looksLikeNip05(normalizedIdentifier)) {
		return undefined;
	}

	return resolveNip05Pubkey(normalizedIdentifier);
}

async function resolveNip05Pubkey(identifier: string): Promise<string | undefined> {
	const prettyIdentifier = prettifyNip05(identifier).trim().toLowerCase();
	if (!prettyIdentifier) return undefined;

	const [namePart, domain] = prettyIdentifier.includes('@')
		? prettyIdentifier.split('@', 2)
		: ['_', prettyIdentifier];
	if (!domain) return undefined;

	const name = namePart || '_';
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), NIP05_FETCH_TIMEOUT_MS);

	try {
		const response = await fetch(
			`https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`,
			{
				headers: { accept: 'application/json' },
				signal: controller.signal
			}
		);
		if (!response.ok) return undefined;

		const payload = (await response.json()) as { names?: Record<string, unknown> };
		const pubkey = payload.names?.[name];
		return typeof pubkey === 'string' && /^[0-9a-f]{64}$/i.test(pubkey)
			? pubkey.toLowerCase()
			: undefined;
	} catch {
		return undefined;
	} finally {
		clearTimeout(timeoutId);
	}
}

function decodeAddressPointer(address: string): AddressPointer | undefined {
	try {
		const decoded = nip19.decode(address);
		if (decoded.type !== 'naddr') return undefined;

		return {
			pubkey: decoded.data.pubkey,
			identifier: decoded.data.identifier,
			kind: decoded.data.kind,
			relays: decoded.data.relays ?? []
		};
	} catch {
		return undefined;
	}
}

function addressFilter(pointer: AddressPointer): { authors: string[]; kinds: number[]; '#d': string[] } {
	return {
		authors: [pointer.pubkey],
		kinds: [pointer.kind],
		'#d': [pointer.identifier]
	};
}
