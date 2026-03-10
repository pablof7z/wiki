<script lang="ts">
	import { ndk } from "$lib/ndk.svelte";
	import { NDKEvent, NDKPrivateKeySigner, NDKRelay, NDKRelaySet, type NDKSigner, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { type Subscription } from "@nostr-dev-kit/svelte";
	import { Avatar } from "@nostr-dev-kit/svelte";

    let { aTag, relaySet }: { aTag: string; relaySet: NDKRelaySet } = $props();

    let viewers = $state<Subscription<NDKEvent> | undefined>(undefined);
    const viewingPubkeys = $derived.by(() => {
        const pubkeys = new Set<string>();

        for (const event of viewers?.events ?? []) {
            if (Date.now() - (event.created_at ?? 0) * 1000 > 15000) continue;
            pubkeys.add(event.pubkey);
        }

        return Array.from(pubkeys);
    });

    let signer: NDKSigner | undefined;
    let interval: ReturnType<typeof setInterval>;

    $effect(() => {
        const ago = Math.floor(Date.now() / 1000) - 15;
        viewers = ndk.$subscribe(() => ({
            filters: [{
                "#a": [aTag],
                since: ago
            }],
            groupable: false,
            subId: 'viewers',
            relaySet
        }));

        signer = ndk.signer;
        sendViewing();

        interval = setInterval(sendViewing, 15000);

        return () => {
            clearInterval(interval);
        };
    });

    async function sendViewing() {
        if (!signer) {
            signer = NDKPrivateKeySigner.generate();
        }

        const e = new NDKEvent(ndk, {
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

</script>

{#if viewers}
<div class="flex flex-col items-start gap-2">
    {viewingPubkeys.length} viewers
    <div class="flex -space-x-4">
        {#each viewingPubkeys as pubkey (pubkey)}
            <Avatar ndk={ndk} pubkey={pubkey} class="rounded-full w-8 h-8 object-cover" />
        {/each}
    </div>
</div>
{/if}
