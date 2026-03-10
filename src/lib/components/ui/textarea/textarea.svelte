<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import type { TextareaEvents } from '.';

	type $$Props = HTMLTextareaAttributes;
	type $$Events = TextareaEvents;

	let className: $$Props['class'] = undefined;
	export let value: $$Props['value'] = undefined;
	export { className as class };
</script>

<textarea
	class={cn(
		'flex min-h-[60px] w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm shadow-[0_12px_30px_rgba(0,0,0,0.14)] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:value
	on:blur
	on:change
	on:click
	on:focus
	on:keydown
	on:keypress
	on:keyup
	on:mouseover
	on:mouseenter
	on:mouseleave
	on:paste
	on:input
	{...$$restProps}
/>
