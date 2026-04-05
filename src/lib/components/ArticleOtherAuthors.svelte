<script lang="ts">
	import { ndk } from '$lib/ndk.svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { Avatar } from '@nostr-dev-kit/svelte';
	import Name from './Name.svelte';

	let { versions = [] }: { versions?: NDKEvent[] } = $props();

	function formatSectionTitle(count: number) {
		if (count === 0) return 'Other authors';
		return `${count} other author${count === 1 ? '' : 's'}`;
	}
</script>

<section>
	<h3 id="other-authors-heading" class="text-sm font-medium text-muted-foreground">
		{formatSectionTitle(versions.length)}
	</h3>

	{#if versions.length === 0}
		<p class="mt-3 text-sm leading-6 text-muted-foreground">
			No one else has published this topic yet.
		</p>
	{:else}
		<div class="section-list mt-3">
			{#each versions as version (version.id)}
				<a
					href={'/a/' + version.encode()}
					class="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-3 transition-colors duration-150 hover:bg-white/[0.015]"
				>
					<Avatar
						{ndk}
						pubkey={version.pubkey}
						class="h-8 w-8 rounded-full object-cover ring-1 ring-white/8"
					/>

					<div class="min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground">
						<div class="truncate">
							<Name {ndk} pubkey={version.pubkey} />
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>
