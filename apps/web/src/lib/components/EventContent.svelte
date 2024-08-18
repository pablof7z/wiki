<script lang="ts">
	import { goto } from '$app/navigation';
	import { ndk } from '@/ndk';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { EventContent } from '@nostr-dev-kit/ndk-svelte-components';

    export let event: NDKEvent;

    function clicked(e: CustomEvent | MouseEvent) {
        if (e.detail?.type === 'profile') {
            if (e.detail.nip05) {
                goto(`/p/${e.detail.nip05}`);
            } else {
                goto(`/p/${e.detail.npub}`);
            }
        } else if (e.detail?.type === 'wikilink') {
            goto(`/${e.detail.target}`);
        }
    }

</script>

<div class="prose items-start gap-4 text-zinc-600 dark:text-zinc-400 font-serif text-lg leading-9">
    <EventContent ndk={$ndk} {event} on:click={clicked} />
</div>
