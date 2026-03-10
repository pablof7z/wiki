<script lang="ts">
	import { ndk } from "$lib/ndk.svelte";
	import { getWoTScore, getWoTDistance } from "$lib/stores/wot";
	import { Avatar } from "@nostr-dev-kit/svelte";
	import Name from "$lib/components/Name.svelte";

    const { pubkey }: { pubkey: string } = $props();

    const wotScore = $derived(getWoTScore(pubkey));
    const wotDistance = $derived(getWoTDistance(pubkey));

    // Display distance if available (more meaningful), otherwise score
    const displayValue = $derived(wotDistance !== null ? `${wotDistance} hops` : (wotScore > 0 ? wotScore.toFixed(2) : ""));
</script>

<div class="flex flex-row items-center gap-2">
    <Avatar ndk={ndk} {pubkey} class="w-8 h-8 object-cover rounded-full flex-none" />
    <Name ndk={ndk} {pubkey} class="inline-block" />

    <div class="text-xs opacity-50">
        {displayValue}
    </div>
</div>
