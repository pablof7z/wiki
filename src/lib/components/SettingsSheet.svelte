<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import {
		wot,
		wotSize,
		wotLoading,
		wotEnabled,
		wotDepth,
		wotMinScore,
		wotIncludeUnknown,
		wotRankAlgorithm
	} from '$lib/stores/wot';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Gear, Trash } from 'radix-icons-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { NDKEvent, type NostrEvent } from '@nostr-dev-kit/ndk';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { NDKWoT } from '@nostr-dev-kit/wot';

	let userFollows = $derived(ndk.$sessions?.follows ?? new Set());
	let currentUser = $derived(ndk.$sessions?.currentUser);
	let relayListMap = $derived(ndk.$sessions?.relayList ?? new Map());
	let userRelays = $derived(Array.from(relayListMap.keys()));
	let userRelayEvent = $derived(ndk.$sessions?.getSessionEvent(10102 as any));
	let allRelays = $derived.by(() =>
		Array.from(ndk.$pool?.relays.values() ?? []).sort((a, b) => a.url.localeCompare(b.url))
	);

	let newRelay = $state('');
	let savingNewRelay = $state(false);
	let showAdd = $state(false);
	const rankAlgorithmOptions: Array<{ value: string; label: string }> = [
		{ value: 'distance', label: 'Distance (closer = higher)' },
		{ value: 'score', label: 'Score (WoT score)' },
		{ value: 'followers', label: 'Followers (popularity)' }
	];
	const selectedRankAlgorithmLabel = $derived(
		rankAlgorithmOptions.find((option) => option.value === $wotRankAlgorithm)?.label ??
			'Select algorithm'
	);

	async function save() {
		if (!currentUser) return;

		const relayUrl = newRelay.trim();
		if (!relayUrl) return;

		savingNewRelay = true;
		try {
			ndk.addExplicitRelay(relayUrl);

			const e = new NDKEvent(ndk, { kind: 10102 } as NostrEvent);
			Array.from(new Set([...userRelays, relayUrl])).forEach((r) => e.tags.push(['relay', r]));
			await e.publish();

			newRelay = '';
			showAdd = false;
		} finally {
			savingNewRelay = false;
		}
	}

	function remove(relay: string) {
		if (!currentUser) return;

		ndk.pool.removeRelay(relay);

		const e = new NDKEvent(ndk, { kind: 10102 } as NostrEvent);
		userRelays.filter((r) => r !== relay).forEach((r) => e.tags.push(['relay', r]));
		e.publish();
	}

	async function rebuildWoT() {
		const activePubkey = ndk.$sessions?.currentUser?.pubkey;
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
			console.error('Failed to rebuild WoT graph:', error);
		} finally {
			wotLoading.set(false);
		}
	}

	function copyRelayUrl(url: string) {
		navigator.clipboard.writeText(url);
	}
</script>

<Sheet.Root>
	<Sheet.Trigger>
		<button
			class="chrome-pill inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 transition-colors hover:bg-white/[0.08] hover:text-accent-foreground"
		>
			<Gear class="h-5 w-5" />
			<span class="sr-only">Settings</span>
		</button>
	</Sheet.Trigger>
	<Sheet.Content class="w-full sm:max-w-md overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title>Settings</Sheet.Title>
			<Sheet.Description>Configure your Wikifreedia experience</Sheet.Description>
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
						onclick={rebuildWoT}
						disabled={!currentUser || $wotLoading}
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
										{$wotDepth === 1
											? 'Direct follows only'
											: $wotDepth === 2
												? 'Friends of friends'
												: $wotDepth === 3
													? '3 hops'
													: `${$wotDepth} hops`}
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
								<Label for="wot-include-unknown" class="text-sm font-medium"
									>Include unknown users</Label
								>
								<Switch id="wot-include-unknown" bind:checked={$wotIncludeUnknown} />
							</div>

							<div class="space-y-2">
								<Label for="wot-rank-algo" class="text-sm font-medium">Ranking algorithm</Label>
								<Select.Root
									type="single"
									items={rankAlgorithmOptions}
									bind:value={$wotRankAlgorithm}
								>
									<Select.Trigger id="wot-rank-algo" class="w-full">
										{selectedRankAlgorithmLabel}
									</Select.Trigger>
									<Select.Content>
										{#each rankAlgorithmOptions as option}
											<Select.Item value={option.value} label={option.label}>
												{option.label}
											</Select.Item>
										{/each}
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
					{#if currentUser}
						<div class="flex gap-2">
							<Button variant="ghost" size="sm" onclick={() => (showAdd = !showAdd)}>
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
					{/if}
				</div>

				{#if !currentUser}
					<p class="text-sm text-muted-foreground">Log in to manage your personal relay list.</p>
				{:else if showAdd}
					<div class="flex gap-2">
						<Input
							type="text"
							bind:value={newRelay}
							placeholder="wss://relay.example.com"
							class="flex-1"
						/>
						<Button onclick={save} disabled={savingNewRelay}>
							{#if savingNewRelay}
								Saving...
							{:else}
								Save
							{/if}
						</Button>
					</div>
				{/if}

				{#if currentUser && userRelays.length === 0}
					<p class="text-sm text-muted-foreground">No relays configured</p>
				{:else if userRelays.length > 0}
					<div class="space-y-2">
						{#each userRelays as relay (relay)}
							<div class="flex items-center gap-2 rounded-md border p-2">
								<span class="flex-1 truncate text-sm">{relay}</span>
								<Button
									onclick={() => remove(relay)}
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
				{#if allRelays.length === 0}
					<p class="text-sm text-muted-foreground">No relays connected</p>
				{:else}
					<div class="space-y-2">
						{#each allRelays as relay (relay.url)}
							<div class="rounded-md border p-3">
								<div class="flex items-start gap-3">
									<div class="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full {relay.status === 'connected'
										? 'bg-emerald-500'
										: relay.status === 'connecting'
											? 'bg-amber-500'
											: relay.status === 'reconnecting'
												? 'bg-sky-500'
												: 'bg-muted-foreground/40'}"></div>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-medium">{relay.url}</p>
										<p class="text-xs text-muted-foreground capitalize">
											{relay.status}
											{#if relay.connectionStats.success > 0}
												· {relay.connectionStats.success} successful connection{relay.connectionStats.success ===
												1
													? ''
													: 's'}
											{/if}
										</p>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onclick={() => copyRelayUrl(relay.url)}
									>
										Copy
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
