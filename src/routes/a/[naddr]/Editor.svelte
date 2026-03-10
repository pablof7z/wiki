<script lang="ts">
	import type { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';
	import Input from '@/components/ui/input/input.svelte';
	import CategoryDropdown from './CategoryDropdown.svelte';
	import TiptapEditor from '@/components/TiptapEditor.svelte';
	import { Switch } from '@/components/ui/switch';
	import { wysiwyg } from '@/stores/settings';

    let {
        baseEvent,
        relaySet = undefined,
        content = $bindable(""),
        newContent = $bindable(false),
        publishable = $bindable(true),
        title = $bindable(""),
        category = $bindable(undefined),
        statusMessage = $bindable("")
    }: {
        baseEvent: NDKEvent;
        relaySet?: NDKRelaySet | undefined;
        content?: string;
        newContent?: boolean;
        publishable?: boolean;
        title?: string;
        category?: string | undefined;
        statusMessage?: string;
    } = $props();

    $effect(() => {
        if (content && newContent) {
            newContent = false;
        }
    });
</script>

<Input bind:value={title} />
<TiptapEditor
	bind:content={content}
	bind:newContent
	bind:publishable
	bind:statusMessage
	preferRich={$wysiwyg}
	placeholder="Write in Djot format..."
/>
<CategoryDropdown bind:value={category} />
<label>
    <Switch bind:checked={$wysiwyg} />
    WYSIWYG Editor
</label>
{#if !publishable && statusMessage}
	<p class="text-sm text-amber-600">{statusMessage}</p>
{/if}
