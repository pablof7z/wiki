import { NDKArticle, NDKWiki } from '@nostr-dev-kit/ndk';
import { ContentRenderer } from './content-renderer';
import NostrMention from './components/nostr-mention.svelte';
import ArticleReferenceChip from './components/article-reference-chip.svelte';
import EventReferenceChip from './components/event-reference-chip.svelte';

export function registerDefaultNostrComponents(renderer: ContentRenderer) {
	renderer.setMentionComponent(NostrMention, 1);
	renderer.addKind(NDKArticle, ArticleReferenceChip, 5);
	renderer.addKind(NDKWiki, ArticleReferenceChip, 5);
	renderer.setFallbackComponent(EventReferenceChip, 1);

	return renderer;
}

export const defaultContentRenderer = registerDefaultNostrComponents(new ContentRenderer());
