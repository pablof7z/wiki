<script lang="ts">
	import { page } from "$app/stores";
	import { ndk } from "@/ndk.svelte";
    import MergeRequestItem from "./MergeRequestItem.svelte";
	import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
	import Name from "@/components/Name.svelte";

    const id = $derived($page.params.id);
    let user = $state<NDKUser | undefined>(undefined);
    let error = $state<string | undefined>(undefined);

    $effect(() => {
        user = undefined;
        error = undefined;

        (async () => {
            try {
                const fetchedUser = await ndk.$fetchUser(id);
                if (!fetchedUser) {
                    error = "Unable to find user: " + id;
                    return;
                }
                user = fetchedUser;
                loadEventsForUser();
            } catch (e) {
                error = String(e);
            }
        })();
    });

    let entries = $state<NDKEvent[]>([]);
    let mergeRequests = $state<NDKEvent[]>([]);
    let entriesSub: ReturnType<typeof ndk.$subscribe> | undefined;
    let mergeRequestsSub: ReturnType<typeof ndk.$subscribe> | undefined;

    function loadEventsForUser() {
        entriesSub = ndk.$subscribe(() => ({
            filters: [{
                kinds: [30818 as number],
                authors: [user!.pubkey]
            }],
            subId: 'entries'
        }));

        entriesSub.on('event', (e: NDKEvent) => {
            entries = [...entries, e];
        });

        mergeRequestsSub = ndk.$subscribe(() => ({
            filters: [
                { kinds: [818 as number], "#p": [user!.pubkey] }
            ],
            subId: 'mergeRequests'
        }));

        mergeRequestsSub.on('event', (e: NDKEvent) => {
            mergeRequests = [...mergeRequests, e];
        });
    }

    $effect(() => {
        return () => {
            entriesSub?.stop();
            mergeRequestsSub?.stop();
        };
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
