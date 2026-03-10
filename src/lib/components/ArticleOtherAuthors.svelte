<script lang="ts">
	import { ndk } from '@/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import Name from './Name.svelte';

	let { versions = [] }: { versions?: NDKEvent[] } = $props();

	function formatDate(createdAt?: number) {
		if (!createdAt) return 'Unknown date';
		return new Date(createdAt * 1000).toLocaleDateString();
	}
</script>

<section class="glass-panel-soft rounded-[1.9rem] px-5 py-5">
	<p class="eyebrow mb-3">Other authors</p>
	<h3 class="text-lg">Alternative versions</h3>

	{#if versions.length === 0}
		<p class="mt-4 text-sm leading-6 text-muted-foreground">
			No alternate authors have published this topic yet.
		</p>
	{:else}
		<div class="mt-4 space-y-2">
			{#each versions as version (version.id)}
				<a
					href={'/a/' + version.encode()}
					class="flex items-center gap-3 rounded-[1.2rem] px-3 py-3 transition-colors hover:bg-white/[0.04]"
				>
					<Avatar
						{ndk}
						pubkey={version.pubkey}
						class="h-10 w-10 rounded-full object-cover ring-1 ring-white/10"
					/>

					<div class="min-w-0 flex-1">
						<div class="truncate font-medium">
							<Name {ndk} pubkey={version.pubkey} />
						</div>
						<div class="text-xs text-muted-foreground">
							Published {formatDate(version.created_at)}
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>
