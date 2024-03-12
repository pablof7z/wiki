import { writable, get as getStore, type Writable, get } from 'svelte/store';
import {
	NDKEvent,
	NDKSubscriptionCacheUsage,
	type NDKFilter,
	type NDKTag,
	NDKKind,
	type Hexpubkey,
	NDKRelaySet,
    NDKUser,
} from '@nostr-dev-kit/ndk';
import type NDKSvelte from '@nostr-dev-kit/ndk-svelte';
import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';

export const debugMode = writable<boolean>(false);

export const currentUser = writable<NDKUser | undefined>(undefined);

export const explicitRelays = persist(
	writable<string[]>([]),
	createLocalStorage(),
	'explicit-relays'
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
 * Current user app handlers
 */
type AppHandlerType = string;
type Nip33EventPointer = string;
export const userAppHandlers = persist(
	writable<Map<number, Map<AppHandlerType, Nip33EventPointer>>>(new Map()),
	createLocalStorage(),
	'user-app-handlers'
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
		const alreadyKnowFollows = getStore(userFollows).size > 0;

		fetchData('user', ndk, [user.pubkey], {
			followsStore: userFollows,
			appHandlersStore: userAppHandlers,
			waitUntilEoseToResolve: !alreadyKnowFollows,
		}).then(() => {
			const $userFollows = getStore(userFollows);

			resolve();

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
	appHandlersStore?: Writable<Map<number, Map<AppHandlerType, Nip33EventPointer>>>;
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
		} else if (event.kind === NDKKind.AppRecommendation) {
			processAppRecommendation(event);
		}
	};

	const processAppRecommendation = (event: NDKEvent) => {
		opts.appHandlersStore!.update((appHandlersStore) => {
			if (!event.dTag) return appHandlersStore;
			const handlerKind = parseInt(event.dTag!);
			const val = appHandlersStore.get(handlerKind) || new Map();

			for (const tag of event.getMatchingTags('a')) {
				const [, eventPointer, , handlerType] = tag;
				val.set(handlerType || 'default', eventPointer);
			}

			appHandlersStore.set(handlerKind, val);

			return appHandlersStore;
		});
	};

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
		} else store!.set(new Set(follows));
	};

	return new Promise((resolve) => {
		const kinds: number[] = [];
		let authorPubkeyLength = 64;
		if (authors.length > 10) {
			authorPubkeyLength -= Math.floor(authors.length / 10);

			if (authorPubkeyLength < 5) authorPubkeyLength = 12;
		}

		const authorPrefixes = authors.map((f) => f.slice(0, authorPubkeyLength))
			.filter((f) => /^[0-9a-fA-F]+$/.test(f));

		const filters: NDKFilter[] = [];

		if (kinds.length > 0) {
			filters.push({ kinds, authors: authorPrefixes, limit: 10 });
		}

		if (opts.appHandlersStore) kinds.push(NDKKind.AppRecommendation);

		if (opts.followsStore) {
			filters.push({ kinds: [3], authors: authorPrefixes });
		}

		console.log('fetchData', name, filters, relaySet);
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
