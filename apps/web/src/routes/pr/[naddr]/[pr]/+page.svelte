<script lang="ts">
    import EventContent from "@/components/EventContent.svelte";
	import EntryCard from '@/components/EntryCard.svelte';
	import { Avatar, Name } from '@nostr-dev-kit/ndk-svelte-components';
	import { page } from "$app/stores";
	import { ndk } from "@/ndk";
	import { NDKEvent, NDKSubscriptionCacheUsage, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { onDestroy, onMount } from "svelte";
	import { maxBodyWidth } from "@/stores/layout";
	import Button from "@/components/ui/button/button.svelte";
    import * as Card from "@/components/ui/card";
    import * as Alert from "$lib/components/ui/alert";
	import Editor from "../../../a/[naddr]/Editor.svelte";
	import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
	import RequestAccepted from "./RequestAccepted.svelte";

    export let naddr: string;
    export let pr: string;

    let originalEvent: NDKEvent | null | undefined;
    let prEvent: NDKEvent | null | undefined;
    let proposedVersion: NDKEvent | null | undefined;

    let results: NDKEventStore<NDKEvent> | undefined;

    $: if (originalEvent && prEvent && !results) {
        results = $ndk.storeSubscribe({
            kinds: [7, 819 as number],
            authors: [originalEvent.pubkey],
            ...prEvent.filter()
        });
    }

    $: if ($page.params.naddr !== naddr || $page.params.pr !== pr) {
        naddr = $page.params.naddr;
        pr = $page.params.pr;
        originalEvent = undefined;
        prEvent = undefined;
        proposedVersion = undefined;
        results?.unsubscribe(); results = undefined;

        $ndk.fetchEvent(naddr).then((event) => {
            originalEvent = event;
        });

        $ndk.fetchEvent(pr).then((event) => {
            prEvent = event;

            console.log(event.rawEvent());
            const eTagFork = event.getMatchingTags("e").find(t => t[3] === "fork")?.[1];
            console.log('asking for fork version', eTagFork);
            if (eTagFork) {
                console.log('fetching fork', eTagFork);
                $ndk.fetchEvents({ids: [eTagFork]}, {cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY}).then((event) => {
                    console.log('received fork', event);
                    proposedVersion = Array.from(event)?.[0];
                });
            }
        });
    }

    onMount(() => { $maxBodyWidth = "max-w-7xl"; })
    onDestroy(() => {
        $maxBodyWidth = "max-w-3xl";
        results?.unsubscribe();
    })

    let editView = false;
    let content: string;
    let title: string;

    function approve() {
        if (!proposedVersion) return;
        editView = true;
        content = proposedVersion.content;
        title = proposedVersion.tagValue("title") || proposedVersion.dTag!;
    }

    async function save() {
        console.log(originalEvent, prEvent, content, title);
        if (!originalEvent || !prEvent || !content || !title) return;

        originalEvent.id = "";
        originalEvent.sig = "";
        originalEvent.pubkey = "";
        originalEvent.created_at = undefined;
        originalEvent.content = content;
        originalEvent.removeTag("title");
        originalEvent.tags.push(["title", title]);
        originalEvent.removeTag("published_at");
        originalEvent.tags.push(["published_at", Math.floor(Date.now() / 1000).toString()]);
        await originalEvent.publish();

        const acceptedEvent = new NDKEvent($ndk, {
            kind: 819,
        } as NostrEvent);
        acceptedEvent.tags.push(["e", originalEvent.id, originalEvent.relay?.url ?? "", "result"]);
        acceptedEvent.tags.push(["e", prEvent.id, prEvent.relay?.url ?? "", "request"]);
        acceptedEvent.tags.push(["p", prEvent.pubkey]);
        await acceptedEvent.publish();
    }
</script>

originalEvent = {!!originalEvent}
prEvent = {!!prEvent}
proposedVersion = {!!proposedVersion}

{#if originalEvent && prEvent && proposedVersion}
    <h3 class="flex flex-row items-center gap-1 justify-center">
        <Avatar ndk={$ndk} pubkey={prEvent.pubkey} class="w-10 h-10 rounded-full object-cover" />
        <Name ndk={$ndk} pubkey={prEvent.pubkey} />
        proposing a change to your
        {originalEvent.dTag}
    </h3>

    {#if prEvent.content.length > 0}
        <Alert.Root class="max-w-prose mx-auto p-8 my-4">
            <Alert.Description>
                <blockquote class="italic text-xl text-muted-foreground">
                    {prEvent.content}
                </blockquote>
            </Alert.Description>
        </Alert.Root>
    {/if}

    {#if $results}
        {#each $results as result}
            {#if result.kind === 819}
                <RequestAccepted event={result} />
            {/if}
        {/each}
    {/if}

    <div class="flex flex-row gap-4 my-4">
        <Card.Root class="w-1/2">
            <Card.Header>
                <Card.Title>
                    Your Version
                </Card.Title>
            </Card.Header>

            <Card.Content>
                {#if !editView}
                    <EventContent event={originalEvent} />
                {:else}
                    <div class="grid w-full items-center gap-4">
                        <Editor bind:content={content} baseEvent={originalEvent} bind:title />

                        <Button class="w-fit px-10" on:click={save}>
                            Save
                        </Button>
                    </div>
                {/if}
            </Card.Content>
        </Card.Root>

        <Card.Root class="w-1/2">
            <Card.Header>
                <Card.Title>
                    <Name ndk={$ndk} pubkey={proposedVersion.pubkey} />'s
                    Version
                </Card.Title>
            </Card.Header>

            <Card.Content>
                <EventContent event={proposedVersion} />
            </Card.Content>
            <Card.Footer>
                <div class="flex flex-row gap-4">
                    <div class="w-1/2">
                        <Button on:click={approve}>Edit / Approve</Button>
                    </div>
                    <div class="w-1/2">
                        <Button on:click={() => {}} variant="secondary" class="w-full">Reject</Button>
                    </div>
                </div>
            </Card.Footer>
        </Card.Root>
    </div>
{:else}
    Loading....
{/if}