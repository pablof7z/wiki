import { derived, get, writable, readable } from "svelte/store";
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
 * Network follows - built from NDK's session follows
 * This is a reactive store that tracks follows-of-follows
 */
export const networkFollows = readable(new Map<Hexpubkey, number>(), (set) => {
    let currentMap = new Map<Hexpubkey, number>();

    // Watch for changes in user follows and rebuild network
    const unsubscribe = $effect.root(() => {
        $effect(() => {
            const follows = ndk.$sessions?.follows;
            if (!follows || follows.size === 0) {
                currentMap = new Map();
                set(currentMap);
                return;
            }

            // In a real implementation, we'd fetch kind:3 events for all follows
            // For now, just expose the follows as network with score 1
            currentMap = new Map(Array.from(follows).map(f => [f, 1]));
            set(currentMap);
        });
    });

    return unsubscribe;
});

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


