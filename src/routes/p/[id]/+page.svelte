<script lang="ts">
	import { page } from "$app/stores";
	import { ndk } from "@/ndk.svelte";
    import MergeRequestItem from "./MergeRequestItem.svelte";
	import type { Hexpubkey, NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
	import type { Subscription } from "@nostr-dev-kit/svelte";
	import Name from "@/components/Name.svelte";
	import { onDestroy } from "svelte";
	import { getPubkeyFromUserId, maybePrettifyUrl } from "@/utils/userId-loader";

    let id: string;
    let user: NDKUser | undefined;
    let error: string;
    
    async function preparePage(userId: string) {
        getPubkeyFromUserId(userId)
            .then(async (pubkey: Hexpubkey) => {
                user = ndk.getUser({pubkey});
                if (user) loadEventsForUser();

                // if the userId was an npub or a partial pubkey, try to prettify the URL
                maybePrettifyUrl(userId, pubkey, `/p/<userId>`);
            })
            .catch((e) => { error = e; });
    }

    $: if (id !== $page.params.id) {
        id = $page.params.id;

        preparePage(id);
    }

    let entries = $state<NDKEvent[]>([]);
    let mergeRequests = $state<NDKEvent[]>([]);
    let entriesSub: ReturnType<typeof ndk.subscribe> | undefined;
    let mergeRequestsSub: ReturnType<typeof ndk.subscribe> | undefined;

    function loadEventsForUser() {
        entriesSub = ndk.subscribe([{
            kinds: [30818 as number],
            authors: [user!.pubkey]
        }], { subId: 'entries' });

        entriesSub.on('event', (e: NDKEvent) => {
            entries = [...entries, e];
        });

        mergeRequestsSub = ndk.subscribe([
            { kinds: [818 as number], "#p": [user!.pubkey] },
        ], { subId: 'mergeRequests' });

        mergeRequestsSub.on('event', (e: NDKEvent) => {
            mergeRequests = [...mergeRequests, e];
        });
    }

    onDestroy(() => {
        entriesSub?.stop();
        mergeRequestsSub?.stop();
    });
</script>

<h1>
    <Name {user} />
</h1>

{#if mergeRequests.length > 0}
    {#each mergeRequests as mergeRequest, i (mergeRequest.id)}
    <div class="
        flex flex-row items-start gap-2 w-full p-2
        {i%2===0 ? 'bg-black/10' : 'dark:bg-black/20'}
    ">
        <MergeRequestItem {mergeRequest} />
    </div>

    {/each}
{/if}

{#if entries.length > 0}
	{entries.length} entries

	{#each entries as entry, i (entry.id)}
		<div class="
            flex flex-row items-start gap-2 w-full p-2
            {i%2===0 ? 'bg-black/10' : 'dark:bg-black/20'}
        ">
			<a href="/{entry.dTag}/{entry.author.npub}" class="grow flex flex-col items-start">
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
