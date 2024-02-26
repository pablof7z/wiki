<script lang="ts">
	import { ndk } from "@/ndk";
	import { NDKEvent } from "@nostr-dev-kit/ndk";
    import EventContent from "@/components/EventContent.svelte";
	import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";
    import Button from "@/components/ui/button/button.svelte";
    import * as Card from "@/components/ui/card";

    export let topic: string;
    export let entry: NDKEvent;

    const wordCount = entry.content.split(" ").length;
</script>

<Card.Root>
    <Card.Header>
        <Card.Title class="flex flex-row items-center gap-2">
            <Avatar ndk={$ndk} pubkey={entry.pubkey} class="w-8 h-8 rounded-full object-cover" />
            <Name ndk={$ndk} pubkey={entry.pubkey} />
        </Card.Title>
        <Card.Description>
            {wordCount} words
        </Card.Description>
    </Card.Header>
    <Card.Content class="max-h-80 overflow-hidden">
        <EventContent event={entry} />
    </Card.Content>

    <Card.Footer class="gap-1 justify-between">
        <Button href="/{encodeURIComponent(topic)}/{entry.pubkey.slice(0,16)}">
            View
        </Button>

        <Button href="/a/{entry.encode()}/edit">
            Edit
        </Button>

        <Button on:click={() => entry.react("+")}>
            Like
        </Button>
    </Card.Footer>
</Card.Root>