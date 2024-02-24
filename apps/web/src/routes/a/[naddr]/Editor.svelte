<script lang="ts">
    import Quill from 'quill';
    import QuillCursors from 'quill-cursors'
    // import QuillMarkdown from 'quilljs-markdown';
    import 'quilljs-markdown/dist/quilljs-markdown-common-style.css';
	import { NDKEvent, type Hexpubkey, type NDKRelaySet, type NostrEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { onMount } from "svelte";
	import { ndk } from '@/ndk';
	import { writable } from 'svelte/store';
	import { Avatar, Name } from '@nostr-dev-kit/ndk-svelte-components';
	import { fade } from 'svelte/transition';
	import Input from '@/components/ui/input/input.svelte';

    export let baseEvent: NDKEvent;
    export let relaySet: NDKRelaySet | undefined = undefined;
    export let content: string;
    export let newContent = false;
    export let title: string;

    let quill: Quill;

    $: if (content && quill && newContent) {
        newContent = false;
        const range = quill.getSelection();
        quill.setText(content);
        quill.setSelection(range);
    }

    onMount(()=>{
        Quill.register('modules/cursors', QuillCursors)
		quill = new Quill('#quill', { modules: {
            cursors: {
                transformOnTextChange: true
            }
        }, theme: 'snow' });
        // const quillMarkdown = new QuillMarkdown(quill, markdownOptions)
		quill.setText(content);

        const cursorsModule = quill.getModule('cursors');

        function textChangeHandler(delta, oldContents, source) {
            content = quill.getText()
            if (source === 'user') {
                setTimeout(() => {
                    const event = new NDKEvent($ndk, {
                        kind: 24137,
                        content: JSON.stringify(delta),
                    } as NostrEvent);
                    event.tag(baseEvent);
                    // event.publish(relaySet);
                });

                debouncePublishFullState();
            }
        }

        const debouncePublishFullState = debounce(() => {
            const event = new NDKEvent($ndk, {
                kind: baseEvent.kind!+1,
                content: quill.getText(),
                tags: baseEvent.tags
            } as NostrEvent);
            // event.publish(relaySet);
        }, 10000);

        function debounce(func: any, wait: any) {
            let timeout: any;
            return function(...args) {
                const context = this;
                const later = function() {
                    timeout = null;
                    func.apply(context, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        const debounceCursorPositionPublish = debounce((range) => {
            const event = new NDKEvent($ndk, {
                kind: 24136,
                content: JSON.stringify(range),
            } as NostrEvent);
            event.tag(baseEvent);
            // event.publish(relaySet);
        }, 1);

        function selectionChangeHandler(range, oldRange, source) {
            if (source === 'user') {
                debounceCursorPositionPublish(range);
            }
        };

        quill.on('text-change', textChangeHandler);
        quill.on('selection-change', selectionChangeHandler);

        let currentUser: NDKUser;
        $ndk.signer!.user().then((user) => currentUser = user);

        const sub = $ndk.subscribe({
            kinds: [24136 as number, 24137 as number],
            "#a": [baseEvent.tagAddress()],
            since: Math.floor(Date.now() / 1000)
        }, { subId: 'cursors' }, relaySet);
        sub.on('event', async (e: NDKEvent) => {
            if (e.pubkey === currentUser?.pubkey) return;

            if (e.kind === 24137 && authedUsers.includes(e.pubkey)) {
                const delta = JSON.parse(e.content);
                quill.updateContents(delta);
            } else if (e.kind === 24136) {
                const range = JSON.parse(e.content);
                const cursor = $cursors[e.pubkey] || await createCursorForPubkey(cursorsModule, e)
                cursorsModule.moveCursor(e.pubkey, range);
                cursor.lastTypedAt = e.created_at!;
                $cursors[e.pubkey] = cursor;
            }
        });
    })

    async function createCursorForPubkey(cursorsModule: any, event: NDKEvent) {
        const color = colorBasedOnPubkey(event.pubkey);
        const profile = await event.author.fetchProfile();
        const cursor: CursorInfo = {
            lastTypedAt: event.created_at!,
            cursor: cursorsModule.createCursor(event.pubkey, profile?.displayName??event.author.npub.slice(0, 6), color),
            color,
            authed: authedUsers.includes(event.pubkey)
        };
        return cursor;
    }

    type CursorInfo = {
        lastTypedAt: number;
        cursor: any;
        color: string;
        authed: boolean;
        timeout?: NodeJS.Timeout;
    }

    const cursors = writable<Record<Hexpubkey, CursorInfo>>({});

    const colors = ['red', 'blue' ];

    function colorBasedOnPubkey(pubkey: Hexpubkey) {
        const sum = pubkey.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return colors[sum % colors.length];
    }

    let timer = 0;
    setInterval(() => { timer++; }, 1000);
</script>

<Input bind:value={title} />
<div class="min-h-[50vh]"> <div id="quill" class="min-h-[50vh] text-lg"></div> </div>

<div class="fixed bottom-0 left-0 p-4 bg-zinc-200 right-0 z-50 backdrop-blur-[50px] bg-opacity-40 border-t border-zinc-400 flex flex-row gap-8 items-center">
{#key timer}
{#each Object.entries($cursors) as [pubkey, cursor] (pubkey)}
    {#if cursor.lastTypedAt > Math.floor(Date.now() / 1000) - 5}
        <div class="flex flex-row gap-2 items-center" style="color: {cursor.color};" transition:fade={{duration: 5000}}>
            <Avatar ndk={$ndk} {pubkey} class="w-8 h-8 object-cover rounded-full" />
            <Name ndk={$ndk} {pubkey} />
        </div>
    {/if}
{/each}
{/key}
</div>

<style>
    :global(.ql-editor) {
        min-height: 50vh;
    }
</style>