<script lang="ts">
	import { goto } from '$app/navigation';
	import { ndk } from '$lib/ndk.svelte';
	import { extractMarkupTitle } from '$lib/utils/markup';
	import { NDKWiki } from '@nostr-dev-kit/ndk';
	import Name from '$lib/components/Name.svelte';
	import { Avatar } from '@nostr-dev-kit/svelte';

	let searchQuery = $state('');

	const recentEntries = ndk.$subscribe(() => ({
		filters: [{ kinds: NDKWiki.kinds, limit: 12 }],
		subId: 'landing-recent'
	}));

	const entries = $derived.by(() => {
		const events = Array.from(recentEntries.events ?? []);
		// Deduplicate by dTag, keeping newest
		const seen = new Map<string, (typeof events)[0]>();
		for (const e of events) {
			const key = e.dTag ?? '';
			const existing = seen.get(key);
			if (!existing || (e.created_at ?? 0) > (existing.created_at ?? 0)) {
				seen.set(key, e);
			}
		}
		return Array.from(seen.values())
			.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0))
			.slice(0, 8);
	});

	function entryTitle(entry: (typeof entries)[0]): string {
		return entry.tagValue('title') || extractMarkupTitle(entry.content) || entry.dTag || 'Untitled';
	}

	function search() {
		const trimmed = searchQuery.trim();
		if (trimmed) goto(`/explore?q=${encodeURIComponent(trimmed)}`);
	}

	function formatDate(ts: number | undefined): string {
		if (!ts) return '';
		return new Date(ts * 1000).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<section class="cta-section" id="cta-section">
	<div class="cta-logo"><svg width="48" height="48" viewBox="0 0 80 80" fill="none"><circle cx="32" cy="36" r="18" stroke="#cc6644" stroke-width="3" fill="none" opacity="0.8"/><circle cx="48" cy="36" r="18" stroke="#e8e0d4" stroke-width="3" fill="none" opacity="0.5"/><circle cx="40" cy="50" r="18" stroke="#cc6644" stroke-width="3" fill="none" opacity="0.35"/></svg></div>
	<div class="cta-wordmark">Wikifreedia</div>
	<div class="cta-headline">Read. Write. Disagree.</div>
	<div class="cta-sub">No one gets the last word. Start exploring the encyclopedia that can't pick a side.</div>

	<form class="cta-search" onsubmit={(e) => { e.preventDefault(); search(); }}>
		<span class="cta-search-icon">&#x2315;</span>
		<input
			bind:value={searchQuery}
			type="text"
			class="cta-search-input"
			placeholder="Search a topic, person, or idea"
			aria-label="Search articles"
		/>
		<button type="submit" class="cta-search-btn">&#x2192;</button>
	</form>

	{#if entries.length > 0}
		<div class="cta-recent">
			<div class="cta-recent-label">Recent entries</div>
			<div class="cta-recent-list">
				{#each entries as entry (entry.id)}
					<a class="cta-entry" href="/{entry.dTag}">
						<div class="cta-entry-title">{entryTitle(entry)}</div>
						<div class="cta-entry-meta">
							<Avatar {ndk} pubkey={entry.pubkey} class="cta-entry-avatar w-[18px] h-[18px] rounded-full object-cover" />
							<span class="cta-entry-author"><Name {ndk} pubkey={entry.pubkey} /></span>
							{#if entry.created_at}
								<span class="cta-entry-date">{formatDate(entry.created_at)}</span>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</section>
