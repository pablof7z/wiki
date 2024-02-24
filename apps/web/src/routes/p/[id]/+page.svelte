<script lang="ts">
	import { page } from "$app/stores";
	import { ndk } from "@/ndk";
	import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
	import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
	import { Name } from "@nostr-dev-kit/ndk-svelte-components";
	import TopicEntry from "../../[topic]/TopicEntry.svelte";

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

    function loadEventsForUser() {
        entries = $ndk.storeSubscribe([{
            kinds: [30818 as number],
            authors: [user!.pubkey]
        }], { subId: 'entries' });
    }
</script>

<h1>
    <Name {user} />
</h1>

{#if $entries}
	{$entries.length} entries

	{#each $entries as entry, i (entry.id)}
		<div class="flex flex-row items-start gap-2 w-full p-2" class:bg-zinc-100={i%2===0}>
			<a href="/{entry.dTag}/{entry.pubkey.slice(0, 18)}" class="grow flex flex-col items-start">
				{entry.dTag}
				<div class="text-xs text-neutral-500">
					{entry.onRelays?.map(r => r.url).join(", ")}
				</div>
			</a>

            <div class="text-sm text-neutral-500 flex flex-col justify-end text-right">
                <span>{entry.created_at}</span>
                <span>{entry.content.split(" ").length} words</span>
            </div>
		</div>
	{/each}
{/if}
