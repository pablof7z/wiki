<script lang="ts">
    import * as Command from "@components/ui/command";
    import * as Popover from "@components/ui/popover";
    import { cn } from "$lib/utils.js";
    import { tick } from "svelte";
	import { Button } from "@/components/ui/button";
	import { Check, ChevronUp } from "radix-icons-svelte";
	import { ChevronDown } from "svelte-radix";
	import { ndk } from "@/ndk.svelte";
	import { wotFilterEvents } from "@/stores/wot";

    const events = ndk.$subscribe(() => ({
        filters: [{ kinds: [30818 as number] }],
        closeOnEose: true
    }));

    function computeCategories(eventsList: typeof events.events): string[] {
        if (!eventsList) return ["Philosophy"];

        const cats = new Set();
        const filteredEvents = wotFilterEvents(eventsList);
        for (const event of filteredEvents) {
            const cat = event.tagValue("c");
            if (cat) cats.add(cat);
        }

        if (cats.size === 0) cats.add("Philosophy");

        return Array.from(cats);
    }

    const categories = $derived(computeCategories(events.events));

    let open = $state(false);
    let { value = $bindable("") } = $props();

    let entry: string;

    let selectedValue = value;

    // $: selectedValue =
    //   frameworks.find((f) => f.value === value)?.label ??
    //   "Category";

    // We want to refocus the trigger button when the user selects
    // an item from the list so users can continue navigating the
    // rest of the form with the keyboard.
    function closeAndFocusTrigger(triggerId: string) {
        open = false;
        tick().then(() => {
            document.getElementById(triggerId)?.focus();
        });
    }
</script>

<Popover.Root bind:open let:ids>
    <Popover.Trigger asChild let:builder>
        <Button
            builders={[builder]}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            class="w-[200px] justify-between"
        >
            {value||"Enter a Category"}
            <ChevronDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
    </Popover.Trigger>
    <Popover.Content class="w-[200px] p-0">
        <Command.Root>
            <Command.Input
                bind:value={value}
                placeholder="Type a category"
            />
            <Command.Group>
                {#if categories}
                    {#each categories as category}
                        <Command.Item
                            value={category}
                            onSelect={(currentValue) => {
                                value = currentValue;
                                closeAndFocusTrigger(ids.trigger);
                            }}
                        >
                            <Check
                                class={cn(
                                "mr-2 h-4 w-4",
                                value !== category && "text-transparent"
                                )}
                            />
                            {category}
                        </Command.Item>
                    {/each}
                {/if}
            </Command.Group>
        </Command.Root>
    </Popover.Content>
</Popover.Root>