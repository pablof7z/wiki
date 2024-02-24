<script lang="ts">
	import { ndk } from "@/ndk";
	import type { NDKUser } from "@nostr-dev-kit/ndk";
    import * as Card from "$lib/components/ui/card";
	import { Avatar } from "@nostr-dev-kit/ndk-svelte-components";

    export let currentUser: NDKUser;

    const docs = $ndk.storeSubscribe([
        { kinds: [31111 as number], "#p": [currentUser.pubkey] },
        { kinds: [31111 as number], authors: [currentUser.pubkey] }
    ], { groupable: false });
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Documents</Card.Title>
		<Card.Description>Documents you are involved with</Card.Description>
	</Card.Header>

	<Card.Content>
		<div class="flex flex-col w-full">
            {#each $docs as doc, i (doc.tagId())}
                <a
                    class="
                        flex flex-row items-center gap-4 w-full p-2 rounded-lg
                        hover:bg-zinc-200
                        transition-colors duration-200 ease-in-out
                    "
                    class:bg-zinc-100={i%2===0}
                    href="/a/{doc.encode()}"
                >
                    <Avatar ndk={$ndk} user={doc.author} class="rounded-full w-10 h-10 object-cover" />

                    <div class="flex flex-col items-start grow">
                        <div class="font-semibold">
                            {doc.tagValue("title")??"Untitled"}
                        </div>

                        <div class="text-xs text-neutral-500">
                            Last edited {new Date(doc.created_at*1000).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="flex -space-x-4  place-self-end">
                        {#each doc.getMatchingTags("p") as pubkey}
                            <Avatar ndk={$ndk} pubkey={pubkey[1]} class="rounded-full w-8 h-8 object-cover" />
                        {/each}
                    </div>
                </a>
            {/each}
		</div>
	</Card.Content>
</Card.Root>