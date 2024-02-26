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
    Merge request of <Name ndk={$ndk} pubkey={pubkey} />'s  <b>{topic}</b>
    <blockquote class="text-xl p-6">{mergeRequest.content}</blockquote>

    {#each $responses as response, i (response.id)}
        {#if response.kind === 819}
            <RequestAccepted event={response} />
        {/if}
    {/each}
</div>