<script lang="ts">
	import { ndk } from "@/ndk";
	import type { NDKEvent } from "@nostr-dev-kit/ndk";
	import { Name } from "@nostr-dev-kit/ndk-svelte-components";
	import RequestAccepted from "../../pr/[naddr]/[pr]/RequestAccepted.svelte";

    export let mergeRequest: NDKEvent;

    const aTag = mergeRequest.tagValue("a");
    console.log(aTag);
    const [_, pubkey, topic] = aTag.split(":") ?? [];

    const responses = $ndk.storeSubscribe({
        kinds: [7, 819 as number], ...mergeRequest.filter()
    });
</script>

<div class="
">
    <a href="/p/{mergeRequest.pubkey}" class="font-bold">
        <Name ndk={$ndk} pubkey={mergeRequest.pubkey} />
    </a>
    sent a merge request of <Name ndk={$ndk} pubkey={pubkey} />'s 
    <a href="/{topic}/{pubkey}"><b>{topic}</b></a>
    
    {#if mergeRequest.content.length > 0}
        <blockquote class="text-xl p-6">{mergeRequest.content}</blockquote>
    {/if}

    {#each $responses as response, i (response.id)}
        {#if response.kind === 819}
            <RequestAccepted event={response} />
        {/if}
    {/each}
</div>