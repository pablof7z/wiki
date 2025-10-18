<script lang="ts">
	import { ndk } from "$lib/ndk.svelte";
	import {
		wot,
		wotSize,
		wotLoading,
		wotEnabled,
		wotDepth,
		wotMinScore,
		wotIncludeUnknown,
		wotRankAlgorithm
	} from "@/stores/wot";
	import * as Sheet from "@/components/ui/sheet";
	import { Button } from "@/components/ui/button";
	import { Input } from "@/components/ui/input";
	import { Gear, Trash } from "radix-icons-svelte";
	import { Separator } from "@/components/ui/separator";
	import { RelayList } from "@nostr-dev-kit/svelte";
	import { NDKEvent, type NostrEvent } from "@nostr-dev-kit/ndk";
	import * as Select from "@/components/ui/select";
	import { Label } from "@/components/ui/label";
	import { Switch } from "@/components/ui/switch";
	import { NDKWoT } from "@nostr-dev-kit/wot";

	let userFollows = $derived(ndk.$sessions?.follows ?? new Set());
	let relayListMap = $derived(ndk.$sessions?.relayList ?? new Map());
	let userRelays = $derived(Array.from(relayListMap.keys()));
	let userRelayEvent = $derived(ndk.$sessions?.getSessionEvent(10102));

	let newRelay = $state('');
	let savingNewRelay = $state(false);
	let showAdd = $state(false);

	async function save() {
		savingNewRelay = true;
		ndk.addExplicitRelay(newRelay);

		const e = new NDKEvent(ndk, { kind: 10102 } as NostrEvent);
		[...userRelays, newRelay].forEach(r => e.tags.push(["relay", r]));
		await e.publish();

		newRelay = '';
		savingNewRelay = false;
		showAdd = false;
	}

	function remove(relay: string) {
		ndk.pool.removeRelay(relay);

		const e = new NDKEvent(ndk, { kind: 10102 } as NostrEvent);
		userRelays.filter(r => r !== relay).forEach(r => e.tags.push(["relay", r]));
		e.publish();
	}

	async function rebuildWoT() {
		const activePubkey = ndk.$sessions?.pubkey;
		if (!activePubkey) return;

		wotLoading.set(true);
		try {
			const wotInstance = new NDKWoT(ndk, activePubkey);
			await wotInstance.load({
				depth: $wotDepth,
				maxFollows: 1000,
				timeout: 30000
			});
			wot.set(wotInstance);
			console.log(`WoT graph rebuilt with ${wotInstance.size} users`);
		} catch (error) {
			console.error("Failed to rebuild WoT graph:", error);
		} finally {
			wotLoading.set(false);
		}
	}
</script>

<Sheet.Root>
	<Sheet.Trigger>
		<button class="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
			<Gear class="h-5 w-5" />
			<span class="sr-only">Settings</span>
		</button>
	</Sheet.Trigger>
	<Sheet.Content class="w-full sm:max-w-md overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title>Settings</Sheet.Title>
			<Sheet.Description>
				Configure your Wikifreedia experience
			</Sheet.Description>
		</Sheet.Header>

		<div class="space-y-6 py-6">
			<!-- Web of Trust Section -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-lg font-semibold">Web of Trust</h3>
						<p class="text-sm text-muted-foreground">Filter content by your social graph</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						on:click={rebuildWoT}
						disabled={$wotLoading}
					>
						{#if $wotLoading}
							Rebuilding...
						{:else}
							Rebuild
						{/if}
					</Button>
				</div>

				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">Your follows</span>
						<span class="text-sm text-muted-foreground">{userFollows.size}</span>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">WoT network size</span>
						<span class="text-sm text-muted-foreground">
							{#if $wotLoading}
								Loading...
							{:else}
								{$wotSize}
							{/if}
						</span>
					</div>

					<div class="flex items-center justify-between gap-4">
						<Label for="wot-enabled" class="text-sm font-medium">Enable WoT filtering</Label>
						<Switch id="wot-enabled" bind:checked={$wotEnabled} />
					</div>

					{#if $wotEnabled}
						<div class="space-y-3 pl-4 border-l-2">
							<div class="flex items-center justify-between gap-4">
								<Label for="wot-depth" class="text-sm font-medium">
									Network depth
									<span class="text-xs text-muted-foreground block">
										{$wotDepth === 1 ? 'Direct follows only' :
										 $wotDepth === 2 ? 'Friends of friends' :
										 $wotDepth === 3 ? '3 hops' : `${$wotDepth} hops`}
									</span>
								</Label>
								<Input
									id="wot-depth"
									type="number"
									min="1"
									max="5"
									bind:value={$wotDepth}
									class="w-20"
								/>
							</div>

							<div class="flex items-center justify-between gap-4">
								<Label for="wot-min-score" class="text-sm font-medium">
									Minimum score
									<span class="text-xs text-muted-foreground block">0-1 scale</span>
								</Label>
								<Input
									id="wot-min-score"
									type="number"
									min="0"
									max="1"
									step="0.1"
									bind:value={$wotMinScore}
									class="w-20"
								/>
							</div>

							<div class="flex items-center justify-between gap-4">
								<Label for="wot-include-unknown" class="text-sm font-medium">Include unknown users</Label>
								<Switch id="wot-include-unknown" bind:checked={$wotIncludeUnknown} />
							</div>

							<div class="space-y-2">
								<Label for="wot-rank-algo" class="text-sm font-medium">Ranking algorithm</Label>
								<Select.Root bind:selected={$wotRankAlgorithm}>
									<Select.Trigger id="wot-rank-algo" class="w-full">
										<Select.Value placeholder="Select algorithm" />
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="distance">Distance (closer = higher)</Select.Item>
										<Select.Item value="score">Score (WoT score)</Select.Item>
										<Select.Item value="followers">Followers (popularity)</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<Separator />

			<!-- Wiki Relays Section -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-lg font-semibold">Your Wiki Relays</h3>
						<p class="text-sm text-muted-foreground">Manage your personal relay list</p>
					</div>
					<div class="flex gap-2">
						<Button variant="ghost" size="sm" on:click={() => showAdd = !showAdd}>
							{showAdd ? 'Cancel' : 'Add'}
						</Button>
						{#if userRelayEvent}
							<Button
								variant="ghost"
								size="sm"
								href="https://njump.me/{userRelayEvent.encode()}"
								target="_blank"
							>
								View
							</Button>
						{/if}
					</div>
				</div>

				{#if showAdd}
					<div class="flex gap-2">
						<Input
							type="text"
							bind:value={newRelay}
							placeholder="wss://relay.example.com"
							class="flex-1"
						/>
						<Button on:click={save} disabled={savingNewRelay}>
							{#if savingNewRelay}
								Saving...
							{:else}
								Save
							{/if}
						</Button>
					</div>
				{/if}

				{#if userRelays.length === 0}
					<p class="text-sm text-muted-foreground">No relays configured</p>
				{:else}
					<div class="space-y-2">
						{#each userRelays as relay (relay)}
							<div class="flex items-center gap-2 rounded-md border p-2">
								<span class="flex-1 truncate text-sm">{relay}</span>
								<Button
									on:click={() => remove(relay)}
									variant="ghost"
									size="icon"
									class="h-8 w-8 flex-shrink-0"
								>
									<Trash class="h-4 w-4" />
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<Separator />

			<!-- All Relays Section -->
			<div class="space-y-4">
				<div>
					<h3 class="text-lg font-semibold">All Relays</h3>
					<p class="text-sm text-muted-foreground">View connection status</p>
				</div>
				<RelayList ndk={ndk} />
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
