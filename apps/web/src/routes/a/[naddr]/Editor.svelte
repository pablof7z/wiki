<script lang="ts">
    import 'quilljs-markdown/dist/quilljs-markdown-common-style.css';
	import { NDKEvent, type Hexpubkey, type NDKRelaySet, type NostrEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { onMount } from "svelte";
	import { ndk } from '@/ndk';
	import Input from '@/components/ui/input/input.svelte';
	import CategoryDropdown from './CategoryDropdown.svelte';
	import ContentEditor from '@/components/ContentEditor.svelte';

    export let baseEvent: NDKEvent;
    export let relaySet: NDKRelaySet | undefined = undefined;
    export let content: string;
    export let newContent = false;
    export let title: string;
    export let category: string | undefined;

    $: if (content && newContent) {
        newContent = false;
        // const range = quill.getSelection();
        // quill.setText(content);
        // quill.setSelection(range);
    }

    onMount(()=>{
		// quill = new Quill('#quill', { theme: 'snow' });
        // // const quillMarkdown = new QuillMarkdown(quill, markdownOptions)
		// quill.setText(content);
        // quill.on('text-change', () => {
        //     content = quill.getText();
        //     newContent = true;
        // });

        let currentUser: NDKUser;
        $ndk.signer?.user().then((user) => currentUser = user);
    })

    let timer = 0;
    setInterval(() => { timer++; }, 1000);
</script>

<Input bind:value={title} />
<ContentEditor bind:content={content} bind:newContent />
<CategoryDropdown bind:value={category} />
