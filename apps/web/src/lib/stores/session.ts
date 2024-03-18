import { writable, get as getStore, type Writable, get } from 'svelte/store';
import {
	NDKEvent,
	NDKSubscriptionCacheUsage,
	type NDKFilter,
	type NDKTag,
	type Hexpubkey,
	NDKRelaySet,
    NDKUser,
} from '@nostr-dev-kit/ndk';
import type NDKSvelte from '@nostr-dev-kit/ndk-svelte';
import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';

export const debugMode = writable<boolean>(false);

export const currentUser = writable<NDKUser | undefined>(undefined);

export const userRelays = persist(
	writable<string[]>([]),
	createLocalStorage(),
	'user-relays'
);

export const userRelayEvent = writable<NDKEvent | undefined>(undefined);

export const followRelays = persist(
	writable<string[]>([]),
	createLocalStorage(),
	'follow-relays'
);

/**
 * Current user's follows
 */
export const userFollows = persist(
	writable<Set<string>>(new Set()),
	createLocalStorage(),
	'user-follows'
);

/**
 * The user's extended network
 */
export const networkFollows = persist(
	writable<Map<Hexpubkey, number>>(new Map()),
	createLocalStorage(),
	'network-follows-map'
);

export const networkFollowsUpdatedAt = persist(
	writable<number>(0),
	createLocalStorage(),
	'network-follows-updated-at'
)

/**
 * Main entry point to prepare the session.
 */
export async function prepareSession(ndk: NDKSvelte, user: NDKUser): Promise<void> {
	return new Promise((resolve) => {
		fetchData('user', ndk, [user.pubkey], {
			followsStore: userFollows,
			relaysStore: userRelays,
			relayEventStore: userRelayEvent,
			waitUntilEoseToResolve: true,
		}).then(() => {
			const $userFollows = getStore(userFollows);

			// check if the relay list is empty, if it is, add wss://relay.wikifreedia.xyz
			const $userRelays = getStore(userRelays);
			if ($userRelays.length === 0) {
				userRelays.update((relays) => {
					relays.push('wss://relay.wikifreedia.xyz');
					return relays;
				});
			}

			fetchData('relays', ndk, Array.from($userFollows), {
				relaysStore: followRelays,
				closeOnEose: true
			}).then(resolve);

			const $networkFollows = get(networkFollows);
			const $networkFollowsUpdatedAt = get(networkFollowsUpdatedAt);
			const twoWeeksAgo = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 14;

			if ($networkFollows.size < 1000 || $networkFollowsUpdatedAt < twoWeeksAgo) {
				const kind3RelaySet = NDKRelaySet.fromRelayUrls(["wss://purplepag.es"], ndk);

				fetchData('wot', ndk, Array.from($userFollows), {
					followsStore: networkFollows,
					closeOnEose: true
				}, kind3RelaySet).then(() => {
					networkFollowsUpdatedAt.set(Math.floor(Date.now() / 1000));
				})

			}
		});
	});
}

interface IFetchDataOptions {
	followsStore?: Writable<Set<Hexpubkey>> | Writable<Map<Hexpubkey, number>>;
	relaysStore?: Writable<string[]>;
	relayEventStore?: Writable<NDKEvent | undefined>;
	closeOnEose?: boolean;
	waitUntilEoseToResolve?: boolean;
}

/**
 * Fetches the information regarding the current user.
 * At this stage, we still don't know the user's network.
 *
 * * Protects from receiving multiple duplicated events
 * * Protects from unnecessarily calling updateFollows if the
 * * eventId is not different than something already processed
 */
async function fetchData(
	name: string,
	ndk: NDKSvelte,
	authors: string[],
	opts: IFetchDataOptions,
	relaySet?: NDKRelaySet
): Promise<void> {
	// set defaults
	opts.waitUntilEoseToResolve ??= true;
	opts.closeOnEose ??= false;

	const mostRecentEvents: Map<string, NDKEvent> = new Map();
	const processedIdForKind: Record<number, string> = {};

	const processEvent = (event: NDKEvent) => {
		const dedupKey = event.deduplicationKey();
		const existingEvent = mostRecentEvents.get(dedupKey);

		if (existingEvent && event.created_at! < existingEvent.created_at!) {
			return;
		}

		mostRecentEvents.set(dedupKey, event);

		if (event.kind === 3 && opts.followsStore) {
			processContactList(event, opts.followsStore);
		}

		if (event.kind === 10008 && opts.relaysStore) {
			processRelayList(event, opts.relaysStore, opts.relayEventStore);
		}
	};

	const processRelayList = (event: NDKEvent, store: Writable<string[]>, relayEventStore?: Writable<NDKEvent | undefined>) => {
		if (relayEventStore) {
			const $relayEventStore = getStore(relayEventStore);

			if (!$relayEventStore || event.created_at! > $relayEventStore.created_at!) {
				relayEventStore.set(event);
			} else {
				return;
			}
		}

		const relays = event.tags.filter((t: NDKTag) => t[0] === 'relay').map((t: NDKTag) => t[1]);

		store.update((existingRelays: string[]) => {
			relays.forEach((r) => {
				if (!existingRelays.includes(r)) {
					existingRelays.push(r);
				}
			});
			return existingRelays;
		});
	}

	/**
	 * Called when a newer event of kind 3 is received.
	 */
	const processContactList = (event: NDKEvent, store: Writable<Set<Hexpubkey> | Map<Hexpubkey, number>>) => {
		if (event.id !== processedIdForKind[event.kind!]) {
			processedIdForKind[event.kind!] = event.id;
			updateFollows(event, store);
		}
	};

	const updateFollows = (event: NDKEvent, store: Writable<Set<Hexpubkey> | Map<Hexpubkey, number>>) => {
		const follows = event.tags.filter((t: NDKTag) => t[0] === 'p').map((t: NDKTag) => t[1]);

		// if authors has more than one, add the current data, otherwise replace
		if (authors.length > 1) {
			opts.followsStore!.update((existingFollows: Set<Hexpubkey> | Map<Hexpubkey, number>) => {
				follows.forEach((f) => {
					if (existingFollows instanceof Map) {
						const current = existingFollows.get(f) || 0;
						existingFollows.set(f, current + 1);
					} else if (existingFollows instanceof Set) {
						existingFollows.add(f)
					}
				});
				return existingFollows;
			});
		} else {
			const $store = getStore(store);
			const val = $store instanceof Map ? new Map(follows.map((f) => [f, 1])) : new Set(follows);
			store!.set(val);
		}
	};

	return new Promise((resolve) => {
		const kinds: number[] = [];
		let authorPubkeyLength = 64;
		if (authors.length > 10) {
			authorPubkeyLength -= Math.floor(authors.length / 10);

			if (authorPubkeyLength < 5) authorPubkeyLength = 18;
		}

		const authorPrefixes = authors.map((f) => f.slice(0, authorPubkeyLength))
			.filter((f) => /^[0-9a-fA-F]+$/.test(f));

		const filters: NDKFilter[] = [];

		if (kinds.length > 0) {
			filters.push({ kinds, authors: authorPrefixes, limit: 10 });
		}

		if (opts.followsStore) {
			filters.push({ kinds: [3], authors: authorPrefixes });
		}

		if (opts.relaysStore) {
			filters.push({ kinds: [10008 as number], authors: authorPrefixes });
		}

		const userDataSubscription = ndk.subscribe(filters, {
			closeOnEose: opts.closeOnEose!,
			groupable: false,
			cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
			subId: `session:${name}`
		}, relaySet);

		userDataSubscription.on('event', processEvent);

		userDataSubscription.on('eose', () => {
			if (opts.waitUntilEoseToResolve) {
				resolve();
			}
		});

		if (!opts.waitUntilEoseToResolve) {
			resolve();
		}
	});
}
