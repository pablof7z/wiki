import { derived, get, writable } from "svelte/store";
import { networkFollows } from "./session";
import { NDKEvent, type Hexpubkey } from "@nostr-dev-kit/ndk";

// derived store where all user follows are present and network follows present in at least 3 follow lists
export const minimumScore = writable<number>(3);

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