import NDK, { NDKUser, type Hexpubkey } from "@nostr-dev-kit/ndk";
import { looksLikeNip05 } from "./nip05";
import { get } from "svelte/store";
import { ndk } from "@/ndk";
import { prettifyNip05 } from "@nostr-dev-kit/ndk-svelte-components";
import { replaceState } from "$app/navigation";

export async function getPubkeyFromUserId(userId: string): Promise<Hexpubkey> {
    const $ndk = get(ndk);
    let user: NDKUser | undefined | null;

    if (looksLikeNip05(userId)) {
        user = await NDKUser.fromNip05(userId, $ndk);
        if (!user) {
            throw "Unable to find a user with that information: " + userId;
        }
    } else if (userId.startsWith('npub1')) {
        user = $ndk.getUser({npub: userId});
    }

    if (!user) {
        try { user = $ndk.getUser({pubkey: userId}); } catch {}
    }

    if (!user) throw "Unable to find a user with that information: " + userId;
    

    return user.pubkey;
}

export async function attemptToGetNip05(pubkey: Hexpubkey) {
    const $ndk = get(ndk);
    const user = $ndk.getUser({pubkey});

    // fetch the profile
    const userProfile = await user.fetchProfile();
    if (!userProfile?.nip05) return;

    const nip05 = prettifyNip05(userProfile.nip05);

    // validate nip05
    const nip05User = await NDKUser.fromNip05(nip05, $ndk);
    if (nip05User?.pubkey !== user.pubkey) return;

    return nip05;
}

export async function maybePrettifyUrl(
    userId: string,
    pubkey: Hexpubkey,
    urlTemplate: string,
) {
    if (userId.startsWith('npub1') || userId.length === 18) { // 18 because we've been doing partial pubkeys for a while
        const nip05 = await attemptToGetNip05(pubkey);
        if (!nip05) return;

        urlTemplate = urlTemplate.replace('<userId>', nip05);
        replaceState(urlTemplate, {});
    }
}