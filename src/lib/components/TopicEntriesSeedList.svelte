<script lang="ts">
	import type { TopicEntrySeed } from '$lib/topic-entry-seed';

	let { entries }: { entries: TopicEntrySeed[] } = $props();
</script>

<div class="divide-y divide-white/[0.03]">
	{#each entries as entry (entry.id)}
		<div class="py-3 first:pt-0 last:pb-0">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
				<a href={entry.entryHref} class="min-w-0 grow">
					{entry.authorName}
				</a>

				<div class="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
					{#if entry.compareHref}
						<a href={entry.compareHref} class="subtle-link shrink text-xs uppercase tracking-[0.24em]">
							Compare
						</a>
					{/if}

					<a
						href={entry.permalinkHref}
						class="subtle-link shrink text-xs uppercase tracking-[0.24em]"
					>
						Perma-link
					</a>
				</div>
			</div>
		</div>
	{/each}
</div>
