import {
	NDKSvelte as BaseNDKSvelte,
	createFetchUser
} from '../../../node_modules/@nostr-dev-kit/svelte/dist/index.js';
import Avatar from '$lib/components/NdkAvatar.svelte';

export * from '../../../node_modules/@nostr-dev-kit/svelte/dist/index.js';
export { Avatar };

export class NDKSvelte extends BaseNDKSvelte {
	$fetchUser(identifier: () => string | undefined) {
		return createFetchUser(this, identifier);
	}
}
