import NDKCacheSqliteWasm from '@nostr-dev-kit/cache-sqlite-wasm';
import { NDKSvelte } from '@nostr-dev-kit/svelte';
import { LocalStorage } from '@nostr-dev-kit/sessions';
import { browser } from '$app/environment';
import { DEFAULT_RELAYS } from '$lib/config/nostr-relays';

const CACHE_INIT_TIMEOUT_MS = 8000;

// Initialize SQLite WASM cache with worker mode (browser only)
const cacheAdapter = browser
	? new NDKCacheSqliteWasm({
			dbName: 'wikifreedia-cache',
			workerUrl: '/worker.js'
		})
	: undefined;

// Initialize signature verification worker (only in browser)
let sigVerifyWorker: Worker | undefined;

console.log('[NDK] Creating NDK instance with relays:', DEFAULT_RELAYS);

export const ndk = new NDKSvelte({
	explicitRelayUrls: [...DEFAULT_RELAYS],
	autoConnectUserRelays: true,
	enableOutboxModel: false,
	clientName: 'wikifreedia',
	clientNip89:
		'31990:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:1716498133442',
	signatureVerificationWorker: sigVerifyWorker,
	initialValidationRatio: 1.0,
	lowestValidationRatio: 0.1,
	aiGuardrails: { skip: new Set(['ndk-no-cache']) },
	session: {
		storage: new LocalStorage(),
		autoSave: true,
		fetches: {
			follows: true,
			mutes: true,
			wallet: false,
			relayList: true
		}
	}
});

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) => {
			setTimeout(() => reject(new Error(message)), timeoutMs);
		})
	]);
}

async function initializeSignatureVerificationWorker() {
	try {
		const SigVerifyWorker = (await import('./sig-verify.worker.ts?worker')).default;
		sigVerifyWorker = new SigVerifyWorker();
		ndk.signatureVerificationWorker = sigVerifyWorker;
	} catch (error) {
		console.error('❌ Failed to initialize signature verification worker:', error);
	}
}

async function initializeCacheAdapter() {
	if (!cacheAdapter) return;

	const initialization = cacheAdapter
		.initializeAsync(ndk)
		.then(() => {
			ndk.cacheAdapter = cacheAdapter;
			console.log('✅ SQLite WASM cache initialized');
		})
		.catch((error) => {
			console.error('❌ Failed to initialize cache:', error);
		});

	try {
		await withTimeout(
			initialization,
			CACHE_INIT_TIMEOUT_MS,
			`SQLite WASM cache initialization timed out after ${CACHE_INIT_TIMEOUT_MS}ms`
		);
	} catch (error) {
		console.warn('⚠️ Cache initialization is slow; continuing without waiting for it:', error);
	}
}

// Initialize background workers and connect relays.
export const ndkReady = (async () => {
	if (!browser) return;

	await initializeSignatureVerificationWorker();

	void ndk.connect().catch((error) => {
		console.error('❌ Failed to connect to relays:', error);
	});

	await initializeCacheAdapter();
})();

/**
 * Session management - NDK handles this automatically via ndk.$sessions
 * Access session data directly from ndk.$sessions in components
 *
 * Example:
 *   const currentUser = ndk.$currentUser;
 *   const follows = ndk.$sessions?.follows;
 *   const relayList = ndk.$sessions?.relayList;
 */

export default ndk;
