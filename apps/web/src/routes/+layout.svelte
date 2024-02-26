<script lang="ts">
    import { ndk } from "$lib/ndk";
	import Login from "./Login.svelte";
    import "../app.css";
    import { ModeWatcher } from "mode-watcher";
	import { currentUser, networkFollows, prepareSession, userFollows } from "@/stores/session";
	import { Avatar, RelayList } from "@nostr-dev-kit/ndk-svelte-components";
	import { NDKEvent, type NDKUser, type NostrEvent } from "@nostr-dev-kit/ndk";
	import { Button } from "@/components/ui/button";
	import { goto } from "$app/navigation";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { Input } from "@/components/ui/input";
	import { Circle, Gear, Plus } from "radix-icons-svelte";
	import { Globe } from "svelte-radix";
	import { minimumScore, wot } from "@/stores/wot";
	import { maxBodyWidth } from "@/stores/layout";
    import Sun from "svelte-radix/Sun.svelte";
    import Moon from "svelte-radix/Moon.svelte";
    import { toggleMode } from "mode-watcher";

    let connected = false;
    let sessionStarted = false;
    let user: NDKUser | undefined;

    $ndk.connect(5000).then(() => {
        connected = true;
    });

    $: if (connected && !sessionStarted && $ndk.signer) {
        $ndk.signer.user().then((u) => {
            $currentUser = u;
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

<ModeWatcher />

<div class="flex flex-row justify-between gap-6 items-center mb-8 {$maxBodyWidth} mx-auto">
    <h2 class="text-orange-600">
        <a href="/">Wikifreedia</a>
        <a href="/wikifreedia/fa984bd7dbb282f0" class="text-base font-normal">
            v0.0.3
        </a>
    </h2>

    <div class="flex flex-row gap-4">
        <div class="flex flex-row grow items-center gap-2">
            <Button href="/" variant="outline" class="max-sm:hidden">All Entries</Button>
            <Button on:click={newEntry} variant="outline" class="">
                <Plus class="w-4 h-4 sm:hidden" />
                <span class="hidden sm:block">New Entry</span>
            </Button>
        </div>

        <div class="flex flex-row gap-2 items-center">
            <Button on:click={toggleMode} variant="outline" size="icon" class="max-sm:hidden">
                <Sun
                  class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                />
                <Moon
                  class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                />
                <span class="sr-only">Toggle theme</span>
            </Button>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                    <Button builders={[builder]} variant="outline">
                        <Globe class="w-4 h-4 sm:hidden" />
                        <span class="hidden sm:block">
                            <Gear class="w-4 h-4" />
                        </span>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content class="w-96 p-6">
                    <h3>Filtering</h3>
                    <div class="title">Web-of-trust</div>
                    <table class="table">
                        <tr>
                            <td>Follows</td>
                            <td>{$userFollows.size}</td>
                        </tr>
                        <tr>
                            <td>Network size</td>
                            <td>{$networkFollows.size}</td>
                        </tr>
                        <tr>
                            <td>WOT size</td>
                            <td>{$wot.size}</td>
                        </tr>
                        <tr>
                            <td>WOT required score</td>
                            <td>
                                <input type="number" bind:value={$minimumScore} class="input w-24" />
                            </td>
                        </tr>
                    </table>

                    <hr class="my-6">

                    <h3>Relays</h3>
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
    <div class="mx-auto {$maxBodyWidth}">
        <slot />
    </div>
{/if}