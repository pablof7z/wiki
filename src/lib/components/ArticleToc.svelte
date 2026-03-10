<script lang="ts">
	import type { MarkupHeading } from '@/utils/markup';

	let { headings = [] }: { headings?: MarkupHeading[] } = $props();
</script>

{#if headings.length > 0}
	<section class="rounded-[1.75rem] border border-white/6 bg-transparent px-4 py-4">
		<p class="eyebrow mb-4">On this page</p>

		<nav class="space-y-1">
			{#each headings as heading (heading.id)}
				<a
					href={'#' + heading.id}
					class="subtle-link block rounded-xl py-2 text-sm leading-6 hover:bg-white/[0.03] hover:text-foreground"
					style:padding-left={`${Math.max(0.75, 0.75 + (heading.level - 2) * 0.75)}rem`}
				>
					{heading.text}
				</a>
			{/each}
		</nav>
	</section>
{/if}
