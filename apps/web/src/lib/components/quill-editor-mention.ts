import { userFollows } from '$stores/session';
import { searchUser } from '$lib/utils/search/user';
import { get } from 'svelte/store';
import type NDK from '@nostr-dev-kit/ndk';

export default function(ndk: NDK) {
    return async (searchTerm, renderList) => {
        const $userFollows = get(userFollows);
        const result = await searchUser(searchTerm, ndk, $userFollows);
        renderList(result);
    };
}