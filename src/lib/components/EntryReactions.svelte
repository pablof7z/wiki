<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import { NDKEvent, type Hexpubkey, type NDKEventId } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import type { Subscription } from '@nostr-dev-kit/svelte';
	import Button from './ui/button/button.svelte';

	let {
		event,
		reactions,
		reactionCount = $bindable()
	}: {
		event: NDKEvent;
		reactions: Subscription<NDKEvent>;
		reactionCount?: number | undefined;
	} = $props();

	let currentUser = $derived(ndk.$currentUser);
	let deletedId = $state(undefined as NDKEventId | undefined);

	const reactionsArray = $derived(Array.from(reactions.events ?? []));

	const currentUserHasReacted = $derived.by(() => {
		if (!currentUser) return false;
		return reactionsArray.some((r) => r.pubkey === currentUser.pubkey);
	});

	const grupedReactions = $derived.by(() => {
		const map: Record<string, Set<Hexpubkey>> = {
			'+': new Set(),
			'-': new Set()
		};

		for (const reaction of reactionsArray) {
			if (reaction.id === deletedId) continue;
			const type = reaction.content;
			if (!map[type]) map[type] = new Set();
			map[type].add(reaction.pubkey);
		}

		return map;
	});

	$effect(() => {
		reactionCount = new Set(reactionsArray.map((r) => r.pubkey)).size;
	});

	function prettifyReaction(r: string) {
		if (r === '+') return '👍';
		if (r === '-') return '👎';
		return r;
	}

	async function react(type: string) {
		await event.react(type);
	}

	function deleteUserReaction() {
		if (!currentUser) return;
		const reaction = reactionsArray.find((r) => r.pubkey === currentUser.pubkey);
		if (!reaction) return;
		reaction.delete();
		deletedId = reaction.id;
	}
</script>

<div class="flex flex-wrap items-center gap-2.5">
	{#each Object.keys(grupedReactions) as type}
		<div class="chrome-pill flex items-center gap-2 rounded-full border border-white/8 px-1.5 py-1.5">
			{#if !currentUserHasReacted}
				<Button
					onclick={() => react(type)}
					variant="ghost"
					size="icon"
					class="h-9 w-9 rounded-full bg-white/[0.04] text-base hover:bg-white/[0.08]"
				>
					{prettifyReaction(type)}
				</Button>
			{:else}
				<div
					class="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-base"
				>
					{prettifyReaction(type)}
				</div>
			{/if}

			<div class="flex flex-row flex-wrap items-center gap-1.5 pr-1 transition-all duration-300">
				{#if grupedReactions[type].size === 0}
					<span class="pr-1 text-xs font-medium text-muted-foreground">0</span>
				{/if}

				{#each Array.from(grupedReactions[type]) as pubkey (pubkey)}
					{#if pubkey === currentUser?.pubkey}
						<button onclick={deleteUserReaction} class="rounded-full">
							<Avatar
								{ndk}
								{pubkey}
								class="h-8 w-8 rounded-full border-2 border-amber-500/80 object-cover"
							/>
						</button>
					{:else}
						<Avatar
							{ndk}
							{pubkey}
							class="h-8 w-8 rounded-full border-2 border-white/10 object-cover"
						/>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
