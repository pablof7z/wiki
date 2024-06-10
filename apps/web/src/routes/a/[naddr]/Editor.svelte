<script lang="ts">
	import { NDKEvent, type Hexpubkey, type NDKRelaySet, type NostrEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { onMount } from "svelte";
	import { ndk } from '@/ndk';
	import Input from '@/components/ui/input/input.svelte';
	import CategoryDropdown from './CategoryDropdown.svelte';
	import ContentEditor from '@/components/ContentEditor.svelte';
	import { Switch } from '@/components/ui/switch';
	import { wysiwyg } from '@/stores/settings';

    export let baseEvent: NDKEvent;
    export let relaySet: NDKRelaySet | undefined = undefined;
    export let content: string;
    export let newContent = false;
    export let title: string;
    export let category: string | undefined;

    $: if (content && newContent) {
        newContent = false;
    }

    onMount(()=>{
        let currentUser: NDKUser;
        $ndk.signer!.user().then((user) => currentUser = user);
    })

    let timer = 0;
    setInterval(() => { timer++; }, 1000);
</script>

<Input bind:value={title} />
{#if $wysiwyg}
    <ContentEditor bind:content={content} bind:newContent />
{:else}
    <textarea bind:value={content} class="w-full h-[80vh] p-6 font-mono" />
{/if}
<CategoryDropdown bind:value={category} />
<label>
    <Switch bind:checked={$wysiwyg} />
    WYSIWYG
</label>