<script lang="ts">
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Check } from 'radix-icons-svelte';
	import { ChevronDown } from 'svelte-radix';
	import { ndk } from '$lib/ndk.svelte';
	import { wotFilterEvents } from '$lib/stores/wot';

	const events = ndk.$subscribe(() => ({
		filters: [{ kinds: [30818 as number] }],
		closeOnEose: true
	}));

	function computeCategories(eventsList: typeof events.events): string[] {
		if (!eventsList) return ['Philosophy'];

		const cats = new Set<string>();
		const filteredEvents = wotFilterEvents(eventsList);
		for (const event of filteredEvents) {
			const cat = event.tagValue('c');
			if (cat) cats.add(cat);
		}

		if (cats.size === 0) cats.add('Philosophy');

		return Array.from(cats);
	}

	const categories = $derived(computeCategories(events.events));

	let open = $state(false);
	let {
		value = $bindable(''),
		class: className = '',
		placeholder = 'Enter a Category'
	}: {
		value?: string;
		class?: string;
		placeholder?: string;
	} = $props();
	let triggerRef = $state<HTMLElement | null>(null);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef?.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				bind:ref={triggerRef}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class={cn('w-[200px] justify-between', className)}
			>
				{value || placeholder}
				<ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[240px] p-0">
		<Command.Root>
			<Command.Input bind:value placeholder="Type a category" />
			<Command.Group>
				{#if categories}
					{#each categories as category}
						<Command.Item
							value={category}
							onSelect={() => {
								value = category;
								closeAndFocusTrigger();
							}}
						>
							<Check class={cn('mr-2 h-4 w-4', value !== category && 'text-transparent')} />
							{category}
						</Command.Item>
					{/each}
				{/if}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
