<script lang="ts">
    import * as Card from "@/components/ui/card";
	import { NDKEvent, type NostrEvent } from "@nostr-dev-kit/ndk";
    import { nip19 } from "nostr-tools";

    export let event: NDKEvent;

    const versionTag = event.getMatchingTags("e").find(t => t[3] !== "fork")?.[1];
    const pointer = nip19.neventEncode({
        id: versionTag,
    });
</script>

<Card.Root class="max-w-prose mx-auto p-8 my-4">
    <Card.Header>
        <Card.Title>
            This request was accepted
            {#if pointer}
                <a href="/a/{pointer}" class="text-zinc-400">View the accepted version</a>
            {/if}
        </Card.Title>
    </Card.Header>
</Card.Root>