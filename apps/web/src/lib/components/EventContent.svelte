<script lang="ts">
	import { goto } from '$app/navigation';
	import { ndk } from '@/ndk';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { EventContent } from '@nostr-dev-kit/ndk-svelte-components';
    import markdownit from 'markdown-it'
    import markdownitMathjax3 from 'markdown-it-mathjax3'
    import wikilinks from 'markdown-it-wikicustom';
    import markedCodeFormat from 'marked-code-format'


    const md = markdownit()
        .use(wikilinks({
            makeAllLinksAbsolute: true,
            uriSuffix: '',
            postProcessPageName: (pageName: string) => {
                return pageName.toLowerCase().replace(/ /g, '-')
            }
        }))
        .use(markdownitMathjax3)

    export let event: NDKEvent;

    function clicked(e: CustomEvent | MouseEvent) {
        if (e.detail?.type === "profile") {
            if (e.detail.nip05) {
                goto(`/p/${e.detail.nip05}`);
            } else {
                goto(`/p/${e.detail.npub}`);
            }
        }
    }
</script>

<div class="prose flex flex-col items-start gap-4 text-zinc-600 dark:text-zinc-400 font-serif text-lg leading-9">
    <EventContent
        ndk={$ndk}
        content={md.render(event.content)}
        {event}
        on:click={clicked}
    />
</div>
