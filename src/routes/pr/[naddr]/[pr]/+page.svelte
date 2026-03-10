<script lang="ts">
    import EventContent from "$lib/components/EventContent.svelte";
	import EntryCard from '$lib/components/EntryCard.svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import Name from '$lib/components/Name.svelte';
	import { page } from "$app/stores";
	import { ndk } from "$lib/ndk.svelte";
	import { NDKEvent, NDKSubscriptionCacheUsage, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { maxBodyWidth } from "$lib/stores/layout";
	import Button from "$lib/components/ui/button/button.svelte";
    import * as Card from "$lib/components/ui/card";
    import * as Alert from "$lib/components/ui/alert";
	import Editor from "../../../a/[naddr]/Editor.svelte";
	import type { Subscription } from "@nostr-dev-kit/svelte";
	import RequestAccepted from "./RequestAccepted.svelte";
    import {diffLines} from "diff";

    let { naddr, pr }: { naddr: string; pr: string } = $props();

    let originalEvent = $state<NDKEvent | null | undefined>(undefined);
    let prEvent = $state<NDKEvent | null | undefined>(undefined);
    let proposedVersion = $state<NDKEvent | null | undefined>(undefined);

    let diff = $state<any>(undefined);
    let results = $state<Subscription<NDKEvent> | undefined>(undefined);

    $effect(() => {
        const currentOriginalEvent = originalEvent;
        const currentPrEvent = prEvent;

        if (currentOriginalEvent && currentPrEvent && !results) {
            results = ndk.$subscribe(() => ({
                filters: [{
                    kinds: [7, 819 as number],
                    authors: [currentOriginalEvent.pubkey],
                    ...currentPrEvent.filter()
                }]
            }));
        }
    });

    $effect(() => {
        if (!diff && originalEvent && proposedVersion) {
            diff = diffLines(originalEvent.content, proposedVersion.content);
            console.log({diff});
            if (!diff) diff = null;
        }
    });

    $effect(() => {
        const nextNaddr = $page.params.naddr;
        const nextPr = $page.params.pr;

        if (!nextNaddr || !nextPr) return;
        if (
            nextNaddr === naddr &&
            nextPr === pr &&
            (originalEvent !== undefined ||
                prEvent !== undefined ||
                proposedVersion !== undefined ||
                results !== undefined ||
                diff !== undefined)
        ) {
            return;
        }

        naddr = nextNaddr;
        diff = undefined;
        pr = nextPr;
        originalEvent = undefined;
        prEvent = undefined;
        proposedVersion = undefined;
        results?.stop();
        results = undefined;

        ndk.fetchEvent(naddr).then((event) => {
            originalEvent = event ?? null;
        });

        ndk.fetchEvent(pr).then((event) => {
            if (!event) {
                prEvent = null;
                return;
            }

            prEvent = event;

            console.log(event.rawEvent());
            const eTagFork = event.getMatchingTags("e").find((tag) => tag[3] === "fork")?.[1];
            console.log('asking for fork version', eTagFork);
            if (eTagFork) {
                console.log('fetching fork', eTagFork);
                ndk
                    .fetchEvents(
                        { ids: [eTagFork] },
                        { cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY }
                    )
                    .then((events) => {
                        proposedVersion = Array.from(events)[0];
                    });
            }
        });
    });

    $effect(() => {
        $maxBodyWidth = "max-w-7xl";
        return () => {
            $maxBodyWidth = "max-w-3xl";
            results?.stop();
        };
    });

    let editView = $state(false);
    let content = $state('');
    let title = $state('');

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

        const acceptedEvent = new NDKEvent(ndk, {
            kind: 819,
        } as NostrEvent);
        acceptedEvent.tags.push(["e", originalEvent.id, originalEvent.relay?.url ?? "", "result"]);
        acceptedEvent.tags.push(["e", prEvent.id, prEvent.relay?.url ?? "", "request"]);
        acceptedEvent.tags.push(["p", prEvent.pubkey]);
        await acceptedEvent.publish();
    }

    let showAll = $state(false);
</script>

{#if originalEvent && prEvent && proposedVersion}
    <h3 class="flex flex-row items-center gap-1 justify-center">
        <Avatar ndk={ndk} pubkey={prEvent.pubkey} class="w-10 h-10 rounded-full object-cover" />
        <Name ndk={ndk} pubkey={prEvent.pubkey} />
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

    {#if results?.events.length}
        {#each results.events as result}
            {#if result.kind === 819}
                <RequestAccepted event={result} />
            {/if}
        {/each}
    {/if}

    {#if diff}

        <Button onclick={() => showAll = !showAll}>
            Show All
        </Button>
        <div class="grid grid-cols-2 gap-4">
            {#each diff as part}
                <div class="p-4 bg-black/10 flex flex-row" class:col-span-2={!part.added && !part.removed} class:hidden={!part.added && !part.removed && !showAll}>
                    {#if part.added}
                        <pre class="text-green-500 whitespace-normal">{part.value}</pre>
                    {:else if part.removed}
                        <pre class="text-red-500 whitespace-normal">{part.value}</pre>
                    {:else if showAll}
                        <pre class="col-pre-2 overflow-x-auto">{part.value}</pre>
                    {/if}
                </div>
            {/each}
        </div>
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

                        <Button class="w-fit px-10" onclick={save}>
                            Save
                        </Button>
                    </div>
                {/if}
            </Card.Content>
        </Card.Root>

        <Card.Root class="w-1/2">
            <Card.Header>
                <Card.Title>
                    <Name ndk={ndk} pubkey={proposedVersion.pubkey} />'s
                    Version
                </Card.Title>
            </Card.Header>

            <Card.Content>
                <EventContent event={proposedVersion} />
            </Card.Content>
            <Card.Footer>
                <div class="flex flex-row gap-4">
                    <div class="w-1/2">
                        <Button onclick={approve}>Edit / Approve</Button>
                    </div>
                    <div class="w-1/2">
                        <Button onclick={() => {}} variant="secondary" class="w-full">Reject</Button>
                    </div>
                </div>
            </Card.Footer>
        </Card.Root>
    </div>
{:else}
    Loading....
{/if}
