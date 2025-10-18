import { writable, derived, get } from "svelte/store";
import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';
import { NDKWoT, filterByWoT, rankByWoT } from "@nostr-dev-kit/wot";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

/**
 * The WoT instance - built from user's perspective
 */
export const wot = writable<NDKWoT | null>(null);

/**
 * Whether WoT is currently loading
 */
export const wotLoading = writable<boolean>(false);

/**
 * Whether to enable WoT filtering
 */
export const wotEnabled = persist(writable<boolean>(false), createLocalStorage(), 'wot-enabled');

/**
 * Maximum depth for WoT filtering (1 = direct follows, 2 = friends of friends, etc.)
 */
export const wotDepth = persist(writable<number>(2), createLocalStorage(), 'wot-depth');

/**
 * Minimum WoT score for filtering (0-1 scale)
 */
export const wotMinScore = persist(writable<number>(0), createLocalStorage(), 'wot-min-score');

/**
 * Whether to include unknown users (users not in WoT)
 */
export const wotIncludeUnknown = persist(writable<boolean>(true), createLocalStorage(), 'wot-include-unknown');

/**
 * Ranking algorithm for WoT
 */
export const wotRankAlgorithm = persist(writable<"distance" | "score" | "followers">("distance"), createLocalStorage(), 'wot-rank-algorithm');

/**
 * Current WoT size (number of users in graph)
 */
export const wotSize = derived(wot, ($wot) => $wot?.size ?? 0);

/**
 * Filter events by WoT settings
 */
export function wotFilterEvents(events: NDKEvent[]): NDKEvent[] {
	const $wot = get(wot);
	const $wotEnabled = get(wotEnabled);
	const $wotDepth = get(wotDepth);
	const $wotMinScore = get(wotMinScore);
	const $wotIncludeUnknown = get(wotIncludeUnknown);

	// If WoT is disabled or not loaded, return all events
	if (!$wotEnabled || !$wot || !$wot.isLoaded()) {
		return events;
	}

	return filterByWoT($wot, events, {
		maxDepth: $wotDepth,
		minScore: $wotMinScore,
		includeUnknown: $wotIncludeUnknown
	});
}

/**
 * Rank events by WoT settings
 */
export function wotRankEvents(events: NDKEvent[]): NDKEvent[] {
	const $wot = get(wot);
	const $wotRankAlgorithm = get(wotRankAlgorithm);

	// If WoT is not loaded, return events as-is
	if (!$wot || !$wot.isLoaded()) {
		return events;
	}

	return rankByWoT($wot, events, {
		algorithm: $wotRankAlgorithm,
		unknownsLast: true
	});
}

/**
 * Filter and rank events by WoT
 */
export function wotFilterAndRankEvents(events: NDKEvent[]): NDKEvent[] {
	const filtered = wotFilterEvents(events);
	return wotRankEvents(filtered);
}

/**
 * Check if a pubkey is in the WoT
 */
export function isInWoT(pubkey: string): boolean {
	const $wot = get(wot);
	const $wotDepth = get(wotDepth);

	if (!$wot || !$wot.isLoaded()) {
		return false;
	}

	return $wot.includes(pubkey, { maxDepth: $wotDepth });
}

/**
 * Get WoT score for a pubkey (0-1, higher = closer)
 */
export function getWoTScore(pubkey: string): number {
	const $wot = get(wot);

	if (!$wot || !$wot.isLoaded()) {
		return 0;
	}

	return $wot.getScore(pubkey);
}

/**
 * Get WoT distance (hops) for a pubkey
 */
export function getWoTDistance(pubkey: string): number | null {
	const $wot = get(wot);

	if (!$wot || !$wot.isLoaded()) {
		return null;
	}

	return $wot.getDistance(pubkey);
}
