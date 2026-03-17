import NDKCacheSqliteWasm from "@nostr-dev-kit/cache-sqlite-wasm";
import { NDKSvelte } from '@nostr-dev-kit/svelte';
import { LocalStorage } from '@nostr-dev-kit/sessions';
import { browser } from '$app/environment';
import { derived, writable, type Readable } from 'svelte/store';
import type { NDKUser, NDKEvent } from '@nostr-dev-kit/ndk';

const DEFAULT_RELAYS = [
    'wss://purplepag.es',
    'wss://nos.lol',
    'wss://relay.primal.net',
    'wss://custom.fiatjaf.com',
    'wss://relay.wikifreedia.xyz',
];

// Initialize SQLite WASM cache with worker mode (browser only)
const cacheAdapter = browser ? new NDKCacheSqliteWasm({
  dbName: "wikifreedia-cache",
  workerUrl: "/worker.js",
}) : undefined;

// Initialize signature verification worker (only in browser)
let sigVerifyWorker: Worker | undefined;

console.log('[NDK] Creating NDK instance with relays:', DEFAULT_RELAYS);

export const ndk = new NDKSvelte({
  explicitRelayUrls: DEFAULT_RELAYS,
  autoConnectUserRelays: true,
  enableOutboxModel: false,
  clientName: "wikifreedia",
  clientNip89: "31990:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:1716498133442",
  cacheAdapter,
  signatureVerificationWorker: sigVerifyWorker,
  initialValidationRatio: 1.0,
  lowestValidationRatio: 0.1,
  aiGuardrails: true,
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

// Initialize the cache and connect
export const ndkReady = (async () => {
  if (!browser) return;

  try {
    // Initialize worker
    const SigVerifyWorker = (await import('./sig-verify.worker.ts?worker')).default;
    sigVerifyWorker = new SigVerifyWorker();
    ndk.signatureVerificationWorker = sigVerifyWorker;
  } catch (error) {
    console.error("❌ Failed to initialize signature verification worker:", error);
  }

  try {
    // Initialize cache
    if (cacheAdapter) {
      await cacheAdapter.initializeAsync(ndk);
      console.log("✅ SQLite WASM cache initialized");
    }
  } catch (error) {
    console.error("❌ Failed to initialize cache:", error);
  }

  void ndk.connect().catch((error) => {
    console.error("❌ Failed to connect to relays:", error);
  });
})();

/**
 * Session management - NDK handles this automatically via ndk.$sessions
 * Access session data directly from ndk.$sessions in components
 *
 * Example:
 *   const currentUser = ndk.$sessions?.currentUser;
 *   const follows = ndk.$sessions?.follows;
 *   const relayList = ndk.$sessions?.relayList;
 */

export default ndk;
