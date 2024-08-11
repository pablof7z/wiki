<script lang="ts">
    import Quill from 'quill';
    import QuillAsciidoc from 'quill-asciidoc';
    import { createEventDispatcher, onMount } from "svelte";
    import quillEditorMention, { renderItem } from "./quill-editor-mention.js";
    import "quill-mention";
    import QuillImageDropAndPaste from 'quill-image-drop-and-paste';
    import { ndk } from '@/ndk.js';

    export let content: string = "";
    export let placeholder = "";
    export let toolbar = true;
    export let autofocus = false;
    export let enterSubmits = false;
    export let newContent = false;

    const dispatch = createEventDispatcher();

    let editorEl: HTMLElement;
    let toolbarEl: HTMLElement;

    let quill: QuillAsciidoc;
    let uploadBlob: Blob;

    function enableEditor() {
        Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste)

        const MentionBlot = Quill.import("blots/mention") as any;
        Quill.register('blots/mention', class extends MentionBlot {
          static render = renderItem
        });

        const options: any = {
            theme: 'snow',
            placeholder,
            modules: {
                imageDropAndPaste: {
                    // add an custom image handler
                    handler: (imageDataUrl, type, imageData) => {
                        uploadBlob = imageData.toBlob()
                        const img = editorEl.querySelector(`img[src^="data:image"]`);
                        if (img) img.classList.add('animate-pulse');
                    }
                },
                toolbar: toolbar ? { container: toolbarEl } : false,
                keyboard: {
                    bindings: {
                        justEnter: {
                            key: 'Enter',
                            handler: () => {
                                if (enterSubmits) {
                                    dispatch("submit");
                                } else {
                                    const range = quill.getSelection();
                                    if (range) quill.insertText(range.index, "\n");
                                }
                            }
                        },
                        shiftEnter: {
                            key: 'Enter',
                            shiftKey: true,
                            handler: () => {
                                if (enterSubmits) {
                                    const range = quill.getSelection();
                                    if (range) quill.insertText(range.index, "\n");
                                }
                            }
                        },
                        // when cmd+enter dispatch a submit event
                        cmdEnter: {
                            key: 'Enter',
                            metaKey: true,
                            handler: () => {
                                dispatch("submit");
                            }
                        },
                        shiftCmdEnter: {
                            key: 'Enter',
                            metaKey: true,
                            shiftKey: true,
                            handler: () => {
                                dispatch("forceSubmit");
                            }
                        }
                        // when the down key is pressed and we are at the last line
                        // dispatch a next event
                        // next: {
                        //     key: 40,
                        //     handler: () => {
                        //         const range = quill.getSelection();
                        //         const lines = quill.getLines();
                        //         console.log(lines);
                        //         if (range) {
                        //             const line = quill.getLine(range.index);
                        //             console.log(line);
                        //             // if (line && line.next == null) {
                        //             //     dispatch("next");
                        //             // }
                        //         }
                        //     }
                        // },
                    }
                },
                mention: quillEditorMention($ndk)
            },
            customConverter(insert: any, current: {text: string}) {
                // converts mentions into raw asciidoc
                if (insert.mention) {
                  current.text = current.text + 'nostr:' + insert.mention.id + '[]'
                }
            }
        };

        quill = new QuillAsciidoc(editorEl, options);
        quill.setText(content)
        quill.on("text-change", () => {
            content = quill.getAsciidoc();
            newContent = true;
            dispatch("contentChanged");
        });

        const editorChild = editorEl.firstChild as HTMLElement;
        editorChild.addEventListener("focusin", () => dispatch("focus"));
        editorChild.addEventListener("focusout", () => dispatch("blur"));

        if (autofocus) quill.focus();
    }

    onMount(async () => {
        enableEditor();
    })

    // function fileUploaded(e: CustomEvent<{url: string, tags: NDKTag[]}>) {
    //     const {url, tags} = e.detail;
    //     if (url) {
    //         const img = document.querySelector(`img[src^="data:image"]`);
    //         let index: number | undefined;
    //         if (img) {
    //             const imgBlot = Quill.find(img);
    //             console.log(imgBlot)
    //             // remove imgBlo from quill
    //             if (imgBlot) {
    //                 const imgIndex = quill.getIndex(imgBlot);
    //                 if (imgIndex !== null) {
    //                     quill.deleteText(imgIndex, 1);
    //                     index = imgIndex;
    //                 } else {
    //                     console.log("unable to find image index")
    //                 }
    //             } else {
    //                 console.log("unable to find image blot")
    //             }
    //         } else {
    //             console.log("unable to find image")
    //         }

    //         if (index === undefined) {
    //             index = quill.getSelection()?.index || 0;
    //         }

    //         quill.insertText(index, "\n");
    //         quill.insertEmbed(index, "image", url);
    //     } else {
    //         // newToasterMessage("Failed to upload image", "error");
    //     }
    // }
</script>

<div class="flex flex-col border-none border-neutral-800 sm:rounded-xl border grow">
    {#if toolbar}
        <div bind:this={toolbarEl} class="toolbar sticky z-40 top-0 bg-background/80 backdrop-blur-xl !border-b !border-base-200 toolbar-container w-full">
            <span class="ql-formats">
                <select class="ql-header"></select>
            </span>
            <span class="ql-formats">
                <button class="ql-bold"></button>
                <button class="ql-italic"></button>
                <button class="ql-link"></button>
                <button class="ql-blockquote"></button>
                <button class="ql-code-block"></button>
                <button>
                    <!-- <UploadButton class="!p-0" on:uploaded={fileUploaded} bind:blob={uploadBlob}>
                        <Image class="w-full" />
                    </UploadButton> -->
                </button>
            </span>
        </div>
    {/if}
    {#if $$slots.belowToolbar}
        <slot name="belowToolbar" />
    {/if}
    <div class="pt-0 flex flex-col gap-4 transition-all duration-100 {$$props.class??""}">
        <div bind:this={editorEl} class="
            editor h-full {$$props.class??""}
        " />
    </div>
</div>

<style>
    .editor {
        @apply text-lg;
        @apply w-full border-0;
        @apply flex flex-col items-stretch justify-stretch p-4;
    }

    .toolbar-container {
        @apply p-2;
        @apply !border-t-0 !border-l-0 !border-r-0;
        @apply flex flex-row items-center gap-1;
    }

    :global(.ql-editor p code) {
        @apply dark:bg-black;
    }

    :global(.ql-editor.ql-blank::before) {
        @apply text-zinc-500;
        font-style: normal;
    }

    :global(.ql-editor) {
        @apply p-0 grow focus:!ring-0 focus:!outline-none !border-0;
    }

    :global(.ql-active .ql-stroke) {
        stroke: white !important;
    }

    :global(.ql-picker-label) {
        @apply !border-0;
    }

    :global(.ql-picker-options) {
        /* @apply !bg-base-300 !border-0 rounded-box !p-4 !z-50; */
        @apply text-white/50
    }

    :global(.ql-picker-item:hover, .ql-picker-item.ql-selected) {
        @apply !text-white;
    }

    :global(.ql-editor .mention) {
        @apply text-white font-medium;
    }

    :global(.ql-mention-list) {
        @apply bg-background rounded-xl shadow-lg py-2 font-sans absolute z-50;
    }

    :global(.ql-mention-list-item) {
        @apply px-4 py-1 text-base truncate w-full sm:w-96;
    }

    :global(.ql-mention-list-item.selected) {
        /* @apply bg-base-300 text-accent2; */
        @apply bg-primary/10;
    }

    :global(.ql-tooltip) {
        /* @apply !bg-base-300 !border-0 rounded-box !px-4 !py-2 font-sans !text-white/80 !shadow-none; */
    }

    :global(.ql-tooltip input) {
        @apply !border-0 rounded-xl !p-6 !text-white/80;
        background: var(--background);
    }

    :global(.ql-editor a) {
        @apply !text-white;
    }

    :global(.ql-editor span.mention) {
        @apply text-primary;
    }

    :global(span.mention[data-id="npub1mygerccwqpzyh9pvp6pv44rskv40zutkfs38t0hqhkvnwlhagp6s3psn5p"]) {
        @apply text-pink-400;
    }
</style>
