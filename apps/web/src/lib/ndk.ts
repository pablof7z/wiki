import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';

import { writable } from "svelte/store"
import { browser } from "$app/environment";

const _ndk = new NDKSvelte({
    explicitRelayUrls: [
        "wss://purplepag.es",
        "wss://relay.nostr.band",
        "wss://nos.lol",
        "wss://relay.wikifreedia.xyz",
    ],
    enableOutboxModel: false,
    clientName: "wikifreedia",
    clientNip89: "31990:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:1716498133442",
});

if (browser && window.indexedDB) {
    _ndk.cacheAdapter = new NDKCacheAdapterDexie({ dbName: 'wiki' });
}


export const ndk = writable(_ndk); 
