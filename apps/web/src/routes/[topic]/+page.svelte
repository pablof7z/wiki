<script lang="ts">
	import { page } from "$app/stores";
	import { ndk } from "$lib/ndk";
	import { NDKArticle, NDKEvent } from "@nostr-dev-kit/ndk";
	import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
	import { Avatar, EventContent, Name } from "@nostr-dev-kit/ndk-svelte-components";
	import { onMount } from "svelte";
	import TopicEntry from "./TopicEntry.svelte";
	import EntriesList from "@/components/EntriesList.svelte";
	import TopicEntriesList from "@/components/TopicEntriesList.svelte";

    export let topic: string;

    let mounted = false;
    onMount(() => mounted = true)

    let entries: NDKEventStore<NDKEvent> | undefined;

    $: if ($page.params.topic !== topic && mounted) {
        topic = $page.params.topic;
        entries = $ndk.storeSubscribe([
            { kinds: [ 30818 as number], "#d": [topic] }
        ], { subId: 'entries' });
    }

</script>

<h1>{topic}</h1>

{#if entries && $entries}
    <h3 class="text-lg text-neutral-500 font-medium">
        There are {$entries.length} entries for this topic
    </h3>

    <TopicEntriesList {topic} {entries} />
{/if}