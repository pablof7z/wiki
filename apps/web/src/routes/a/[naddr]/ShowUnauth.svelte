<script lang="ts">
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Label } from "$lib/components/ui/label";
    import { createEventDispatcher } from "svelte";

    export let value = false;

    let prevVal = value;

    const dispatch = createEventDispatcher();

    $: if (prevVal !== value) {
        prevVal = value;
        dispatch("change", value);
    }
</script>

<div class="items-top flex space-x-2">
    <div class="grid gap-1.5 leading-none">
        <Label
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
            <Checkbox id="terms1" bind:checked={value} />
            Show uninvited user edits
        </Label>
    </div>
</div>