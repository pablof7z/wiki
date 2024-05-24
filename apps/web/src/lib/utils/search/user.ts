import NDK, { type Hexpubkey, type NDKUserProfile, NDKUser, NDKRelaySet, NDKEvent, profileFromEvent } from "@nostr-dev-kit/ndk";
import { type UserSearchResult } from ".";

export async function searchUser(
    searchTerm: string,
    ndk: NDK,
    userFollows: Set<Hexpubkey>
) {
    const haveCache = !!ndk.cacheAdapter?.getProfiles;
    const result: UserSearchResult[] = [];
    const q = searchTerm.trim().toLowerCase();

    if (haveCache) {
        const res = await ndk.cacheAdapter!.getProfiles!(
            (pubkey: Hexpubkey, profile: NDKUserProfile) => {
                if (typeof profile.displayName === "string" && profile.displayName.toLowerCase().includes(q)) return true;
                if (typeof profile.name === "string" && profile.name.toLowerCase().includes(q)) return true;
                if (typeof profile.nip05 === "string" && profile.nip05.toLowerCase().includes(q)) return true;
                return false;
            });
        if (res) {
            res.forEach((profile: NDKUserProfile, pubkey: Hexpubkey) => {
                try {
                    const u = new NDKUser({pubkey});
                    result.push({
                        id: u.npub,
                        pubkey,
                        avatar: profile.image,
                        value: profile.displayName || profile.name,
                        nip05: profile.nip05,
                        profile,
                        followed: userFollows.has(pubkey)
                    });
                } catch (e) {
                    console.error(e);
                }
            });
        }
    }

    if (result.length === 0) {
        const relaySet = NDKRelaySet.fromRelayUrls([ "wss://cache2.primal.net/v1" ], ndk);

        const res = await ndk.fetchEvents({
            cache: [ "user_search", {query: searchTerm, limit: 10} ]
        }, { closeOnEose: true }, relaySet);

        Array.from(res).map((event: NDKEvent) => {
            const p = profileFromEvent(event);
            result.push({
                id: event.author.npub,
                avatar: p.image,
                value: p.displayName || p.name,
                nip05: p.nip05,
                profile: p,
                followed: userFollows.has(event.author.pubkey)
            });
        });
    }

    const orderedResult = result.sort((a, b) => {
        if (a.followed && !b.followed) return -1;
        if (!a.followed && b.followed) return 1;
        return 0;
    });

    return orderedResult;
}