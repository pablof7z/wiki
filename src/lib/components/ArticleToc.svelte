<script lang="ts">
	import type { MarkupHeading } from '$lib/utils/markup';

	let { headings = [] }: { headings?: MarkupHeading[] } = $props();
</script>

{#if headings.length > 0}
	<nav class="space-y-1">
		{#each headings as heading (heading.id)}
			<a
				href={'#' + heading.id}
				class="subtle-link block text-sm leading-6 hover:text-foreground"
				style:margin-left={`${Math.max(0, heading.level - 2)}rem`}
			>
				{heading.text}
			</a>
		{/each}
	</nav>
{/if}
