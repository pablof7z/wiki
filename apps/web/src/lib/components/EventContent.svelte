<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import markdownit from 'markdown-it'
    import wikilinks from 'markdown-it-wikicustom';

    const md = markdownit()
        .use(wikilinks({
            makeAllLinksAbsolute: true,
            uriSuffix: '',
            postProcessPageName: (pageName: string) => {
                return pageName.toLowerCase().replace(/ /g, '-')
            }
        }));

    export let event: NDKEvent;
</script>

<div class="prose flex flex-col items-start gap-4 text-zinc-600 dark:text-zinc-400 font-serif text-lg leading-9">
    {@html md.render(event.content)}
</div>
