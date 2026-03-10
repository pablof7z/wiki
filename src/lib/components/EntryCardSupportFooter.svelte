<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import Button from '@/components/ui/button/button.svelte';
	import { NDKEvent, type NostrEvent } from '@nostr-dev-kit/ndk';
	import { maxBodyWidth } from '@/stores/layout';

	let { event }: { event: NDKEvent } = $props();

	let currentUser = $derived(ndk.$sessions?.currentUser);

	// Get entries written by the current user on this topic
	const currentUserEntries = ndk.$subscribe(() => {
		if (!currentUser?.pubkey) return undefined;

		return {
			filters: [
				{
					kinds: [30818 as number],
					authors: [currentUser.pubkey],
					'#d': [event.dTag!]
				}
			],
			subId: 'currentUsersEntry'
		};
	});

	// Get the most recent entry written by the current user on this topic
	let currentUserEntry = $derived.by(() => {
		const entries = currentUserEntries.events;
		if (!entries || entries.length === 0) return undefined;
		return Array.from(entries).sort((a, b) => b.created_at! - a.created_at!)[0];
	});

	// Check if the current user has deferred to this entry
	let userDefersToEntry = $derived.by(() => {
		return currentUserEntry
			? !!currentUserEntry.getMatchingTags('a').find((t) => t[3] === 'defer')
			: false;
	});

	async function defer() {
		if (
			!confirm(
				'Are you sure you want to defer to this entry? This will remove your current entry of this topic and support this one instead'
			)
		)
			return;

		const defer = new NDKEvent(ndk, {
			kind: 30818,
			content: `Read ${event.encode()} instead.`,
			tags: [
				['d', event.dTag!],
				['a', event.tagAddress(), event.relay?.url ?? '', 'defer'],
				['e', event.id, event.relay?.url ?? '', 'defer']
			]
		} as NostrEvent);
		await defer.publish();
	}
</script>

<div class="h-[5rem] w-full"></div>

<div class="fixed bottom-0 left-0 right-0 p-4">
	<div class="mx-auto {$maxBodyWidth}">
		<div class="glass-panel rounded-[1.75rem] px-4 py-4 sm:px-6">
			{#if currentUserEntry && !userDefersToEntry}
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
					<Button on:click={defer}>Defer</Button>
					<div class="flex flex-col items-start">
						<span class="font-medium">
							Do you consider this version better than yours for <i>{event.dTag}</i>?
						</span>
						<span class="text-xs opacity-70">
							You can remove your entry and defer to this one as the recommended version.
						</span>
					</div>
				</div>
			{:else if userDefersToEntry}
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
					<Button>Deferred</Button>
					<div class="flex flex-col items-start">
						<span class="font-medium">You have deferred to this entry for <i>{event.dTag}</i>.</span
						>
						<span class="text-xs opacity-70">
							This helps your network discover the version you trust.
						</span>
					</div>
				</div>
			{:else}
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
					<Button>Recommend</Button>
					<div class="flex flex-col items-start">
						<span class="font-medium">Is this the right entry for <i>{event.dTag}</i>?</span>
						<span class="text-xs opacity-70">
							Support it so more people in your network can find it.
						</span>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
