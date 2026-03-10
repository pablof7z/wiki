<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import type { InputEvents } from '.';

	type $$Props = HTMLInputAttributes;
	type $$Events = InputEvents;

	let className: $$Props['class'] = undefined;
	export let value: $$Props['value'] = undefined;
	export { className as class };
</script>

<input
	class={cn(
		'flex h-11 w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:value
	on:blur
	on:change
	on:click
	on:focus
	on:focusin
	on:focusout
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
