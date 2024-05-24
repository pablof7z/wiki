<script lang="ts">
	import { page } from "$app/stores";
	import { ndk } from "$lib/ndk";
	import {type AddressPointer, decode} from "nostr-tools/nip19";
	import Button from "@/components/ui/button/button.svelte";
	import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
	import { onMount } from "svelte";
	import Editor from "../Editor.svelte";
	import { goto } from "$app/navigation";
	import type { NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
	import EventContent from "@/components/EventContent.svelte";
	import EntryCard from "@/components/EntryCard.svelte";

	export let naddr: string;

	let events: NDKEventStore<NDKEvent> | undefined;
	let event: NDKEvent;
	let newContent = false;
	let title: string;
	let category: string | undefined;
	let saving = false;

	let currentUser: NDKUser;
	$ndk.signer?.user().then((user) => {
		currentUser = user;
	});

	let mounted = false;
	onMount(() => mounted = true)

	$: if ($page.params.naddr !== naddr && mounted) {
		naddr = $page.params.naddr;

		const data = decode(naddr).data as AddressPointer;
		const filter = {
			kinds: [data.kind],
			"#d": [data.identifier],
			authors: [data.pubkey],
		};

		if (events) events.unsubscribe();

		events = $ndk.storeSubscribe(filter);
	}

	$: if ($events) {
		let _ = Array.from($events)
			.sort((a, b) => {
				const time = b.created_at! - a.created_at!
				if (time !== 0) return time
				return b.content.length - a.content.length
		})[0];
		if (_ && event?.id !== _.id) {
			event = _;
			content = event.content;
			title = event.tagValue("title") || event.dTag!;
			category = event.tagValue("c");
		}
	}

	async function save() {
		saving = true;
		const prevKey = event.pubkey;

		if (prevKey !== currentUser.pubkey) {
			event.removeTag("e");
			event.removeTag("a");
			event.tag(event, "fork");
		}

		try {
			event.id = "";
			event.sig = "";
			event.pubkey = "";
			event.created_at = undefined;
			event.removeTag("title");
			event.tags.push(["title", title]);
			event.removeTag("c");
			if (category) event.tags.push(["c", category]);
			event.removeTag("published_at");
			event.tags.push(["published_at", Math.floor(Date.now() / 1000).toString()]);
			await event.publish();
			goto(`/${event.dTag}/${event.pubkey.slice(0, 18)}`);
		} finally {
			saving = false;
		}
	}

	let content: string;
	let preview = false;

	function togglePreview() {
		preview = !preview;
	}
</script>

{#if event}
	<div class="grid w-full items-center gap-4">
		{#key content}
			{#if !preview}
				<Editor bind:content={event.content} baseEvent={event} bind:newContent bind:title bind:category />
			{:else}
				<EntryCard {event} skipEdit={true} />
			{/if}

			<div class="flex flex-row gap-4">
				<Button class="w-fit px-10" on:click={() => save()}>
					{#if saving}
						Saving...
					{:else}
						Save
					{/if}
				</Button>

				<Button variant="ghost" on:click={togglePreview}>Preview</Button>

				<Button href="/a/{naddr}" variant="link">Cancel</Button>
			</div>
		{/key}
	</div>
{:else}
	Looking for event
{/if}
