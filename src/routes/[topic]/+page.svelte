<script lang="ts">
	import { page } from "$app/stores";
	import { ndk } from "$lib/ndk.svelte";
	import { NDKArticle, NDKEvent } from "@nostr-dev-kit/ndk";
	import type { Subscription } from "@nostr-dev-kit/svelte";
	import { Avatar, EventContent } from "@nostr-dev-kit/svelte";
	import Name from "@/components/Name.svelte";
	import { onMount } from "svelte";
	import TopicEntry from "./TopicEntry.svelte";
	import EntriesList from "@/components/EntriesList.svelte";
	import TopicEntriesList from "@/components/TopicEntriesList.svelte";

    let { topic = $bindable("") }: { topic?: string } = $props();

    let mounted = $state(false);
    onMount(() => {
        mounted = true;
        topic = $page.params.topic;
    })

    const entries = ndk.$subscribe(() => {
        if (!mounted) return { filters: [] };

        const currentTopic = $page.params.topic;
        return {
            filters: [{ kinds: [ 30818 as number], "#d": [currentTopic] }],
            subId: 'entries'
        };
    });

</script>

<h1>{topic}</h1>

{#if entries && $entries}
    <h3 class="text-lg text-neutral-500 font-medium">
        There are {$entries.length} entries for this topic
    </h3>

    <TopicEntriesList {topic} {entries} />
{/if}