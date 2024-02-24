<script lang="ts">
	import { ndk } from "@/ndk";
	import { NDKEvent, NDKPrivateKeySigner, NDKRelay, NDKRelaySet, type NDKSigner, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { type NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
	import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";
	import { onDestroy, onMount } from "svelte";
	import { derived, type Readable } from "svelte/store";

    export let aTag: string;
    export let relaySet: NDKRelaySet;

    let viewers: NDKEventStore<NDKEvent>;
    let viewingPubkeys: Readable<string[]>;

    let signer: NDKSigner | undefined;

    onMount(() => {
        const ago = Math.floor(Date.now() / 1000) - 15;
        viewers = $ndk.storeSubscribe({
            "#a": [aTag],
            since: ago
        }, { groupable: false, subId: 'viewers', relaySet });
        console.log({viewers});

        viewingPubkeys = derived(viewers, ($viewers) => {
            const pubkeys = new Set<string>();
            for (const e of $viewers) {
                // only if the event is within the last 15 seconds
                if (Date.now() - e.timestamp > 15000) continue;
                pubkeys.add(e.pubkey);
            }

            return Array.from(pubkeys);
        });

        signer = $ndk.signer;
        sendViewing();
    });

    async function sendViewing() {
        if (!signer) {
            signer = NDKPrivateKeySigner.generate();
        }

        const e = new NDKEvent($ndk, {
            kind: 24135,
            tags: [
                ["a", aTag]
            ]
        } as NostrEvent);
        try {
            await e.sign(signer);
        } catch (e) {
            signer = NDKPrivateKeySigner.generate();
        }
        await e.publish();
    }

    const interval = setInterval(sendViewing, 15000);

    onDestroy(() => {
        clearInterval(interval);
    });

</script>

{#if viewers}
<div class="flex flex-col items-start gap-2">
    {$viewingPubkeys.length} viewers
    <div class="flex -space-x-4">
        {#each $viewingPubkeys as pubkey (pubkey)}
            <Avatar ndk={$ndk} pubkey={pubkey} class="rounded-full w-8 h-8 object-cover" />
        {/each}
    </div>
</div>
{/if}