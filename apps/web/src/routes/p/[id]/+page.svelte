<script lang="ts">
	import { page } from "$app/stores";
	import { ndk } from "@/ndk";
    import MergeRequestItem from "./MergeRequestItem.svelte";
	import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
	import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
	import { Name } from "@nostr-dev-kit/ndk-svelte-components";
	import { onDestroy } from "svelte";

    let id: string;
    let user: NDKUser | undefined;

    $: if (id !== $page.params.id) {
        id = $page.params.id;

        if (id.startsWith('npub1')) {
            user = $ndk.getUser({npub: id});
            if (user) loadEventsForUser();
        }
    }

    let entries: NDKEventStore<NDKEvent> | undefined;
    let mergeRequests: NDKEventStore<NDKEvent> | undefined;

    function loadEventsForUser() {
        entries = $ndk.storeSubscribe([{
            kinds: [30818 as number],
            authors: [user!.pubkey]
        }], { subId: 'entries' });

        mergeRequests = $ndk.storeSubscribe([
            { kinds: [818 as number], authors: [user!.pubkey] },
        ], { subId: 'mergeRequests' });
    }

    onDestroy(() => {
        entries?.unsubscribe();
        mergeRequests?.unsubscribe();
    });
</script>

<h1>
    <Name {user} />
</h1>

{#if mergeRequests && $mergeRequests}
    {#each $mergeRequests as mergeRequest, i (mergeRequest.id)}
    <div class="
        flex flex-row items-start gap-2 w-full p-2
        {i%2===0 ? 'bg-black/10' : 'dark:bg-black/20'}
    ">
        <MergeRequestItem {mergeRequest} />
    </div>

    {/each}
{/if}

{#if entries && $entries}
	{$entries.length} entries

	{#each $entries as entry, i (entry.id)}
		<div class="
            flex flex-row items-start gap-2 w-full p-2
            {i%2===0 ? 'bg-black/10' : 'dark:bg-black/20'}
        ">
			<a href="/{entry.dTag}/{entry.pubkey.slice(0, 18)}" class="grow flex flex-col items-start">
				{entry.dTag}
				<div class="text-xs text-neutral-500">
					{entry.onRelays?.map(r => r.url).join(", ")}
				</div>
			</a>

            {#if entry.getMatchingTags("a").find(t => t[3] === "defer")}
                <div class="text-xs text-orange-500 font-medium">
                    Defered
                </div>
            {:else}
                <div class="text-sm text-neutral-500 flex flex-col justify-end text-right">
                    <span>{entry.created_at}</span>
                    <span>{entry.content.split(" ").length} words</span>
                </div>
            {/if}
		</div>
	{/each}
{/if}
