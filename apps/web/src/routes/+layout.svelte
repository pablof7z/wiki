<script lang="ts">
    import { ndk } from "$lib/ndk";
	import Login from "./Login.svelte";
    import "../app.css";
	import { prepareSession } from "@/stores/session";
	import { Avatar, RelayList } from "@nostr-dev-kit/ndk-svelte-components";
	import { NDKEvent, type NDKUser, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { Button } from "@/components/ui/button";
	import { goto } from "$app/navigation";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { Input } from "@/components/ui/input";
	import { Circle, Plus } from "radix-icons-svelte";
	import { Globe } from "svelte-radix";

    let connected = false;
    let sessionStarted = false;
    let user: NDKUser | undefined;

    $ndk.connect(5000).then(() => {
        connected = true;
    });

    $: if (connected && !sessionStarted && $ndk.signer) {
        $ndk.signer.user().then((u) => {
            user = u;
            prepareSession($ndk, user).then(() => {
                sessionStarted = true;
            });
        });
        sessionStarted = true;
    }

    async function newEntry() {
		const title = prompt('Name of the concept (e.g. second world war)');
		if (!title) return;
		// normalize title, it should be all lower case, spaces should be replaced with dash
		const dTag = title?.toLowerCase().trim().replace(/ /g, '-')!;
		const event = new NDKEvent($ndk, {
			kind: 30818,
			tags: [ [ "d", dTag ], ]
		} as NostrEvent);
		await event.publish()
		goto(`/a/${event.encode()}/edit`);
	}

    let relay = '';
</script>

<div class="flex flex-row justify-between gap-6 items-center mb-8">
    <h2 class="text-orange-600"> <a href="/">Wikifreedia</a> </h2>

    <div class="flex flex-row gap-4">
        <div class="flex flex-row grow items-center gap-2">
            <Button href="/" variant="outline" class="max-sm:hidden">All Entries</Button>
            <Button on:click={newEntry} variant="outline" class="">
                <Plus class="w-4 h-4 sm:hidden" />
                <span class="hidden sm:block">New Entry</span>
            </Button>
        </div>

        <div class="flex flex-row gap-2 items-center">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button builders={[builder]} variant="outline">
                        <Globe class="w-4 h-4 sm:hidden" />
                        <span class="hidden sm:block">Relays</span>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="w-96">
                    <div class="flex flex-row gap-2 w-fit">
                        <Input type="text" bind:value={relay} class="" />
                        <Button on:click={() => $ndk.addExplicitRelay(relay)}>Add Relay</Button>

                    </div>
                    <RelayList ndk={$ndk} />
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            {#if user}
                <a href="/p/{user.npub}">
                    <Avatar ndk={$ndk} pubkey={user.pubkey} class="w-8 h-8 rounded-full object-cover" />
                </a>
            {:else}
                <Login />
            {/if}
        </div>
    </div>

</div>

{#if !connected}
    Connecting...
{:else if $ndk.signer && !sessionStarted}
    Preparing session...
{:else}
    <slot />
{/if}