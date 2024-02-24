import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';

import { writable } from "svelte/store"

export const ndk = writable(new NDKSvelte({
    cacheAdapter: new NDKCacheAdapterDexie({ dbName: 'higlighter' }),
    explicitRelayUrls: [
        "wss://purplepag.es",
        "wss://relay.nostr.band",
        "wss://nos.lol",
    ],
    enableOutboxModel: true
}));
