import { derived, get, writable } from "svelte/store";
import { NDKEvent, type Hexpubkey } from "@nostr-dev-kit/ndk";
import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';
import { ndk } from "$lib/ndk.svelte";

// Minimum score for WoT inclusion
export const minimumScore = writable<number>(3);

/**
 * Whether to filter the events by the user's WoT
 */
export const wotFilter = persist( writable<boolean>(false), createLocalStorage(), 'wot-filter' );

/**
 * Network follows - for now just returns user's follows with score 1
 * In the future, this could fetch kind:3 events for all follows to build a real WoT graph
 */
export const networkFollows = writable<Map<Hexpubkey, number>>(new Map());

export const wot = derived([networkFollows, minimumScore], ([$networkFollows, $minimumScore]) => {
    const pubkeys = new Set<Hexpubkey>();

    $networkFollows.forEach((score, follow) => {
        if (score >= $minimumScore) pubkeys.add(follow);
    });

    return pubkeys;
});

export function wotFiltered(events: NDKEvent[]) {
    const $wot = get(wot);

    if ($wot.size < 1000) return events;

    const filteredEvents: NDKEvent[] = [];

    for (const e of events) {
        if ($wot.has(e.pubkey)) filteredEvents.push(e);
    }

    return filteredEvents;
}


