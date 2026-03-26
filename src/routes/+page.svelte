<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import LandingPage from '$lib/components/landing/LandingPage.svelte';

	$effect(() => {
		const q = $page.url.searchParams.get('q');
		const c = $page.url.searchParams.get('c');

		if (q || c) {
			const target = new URL('/explore', $page.url.origin);
			if (q) target.searchParams.set('q', q);
			if (c) target.searchParams.set('c', c);
			goto(target.toString(), { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>Wikifreedia</title>
	<meta
		name="description"
		content="Search, compare, and publish decentralized encyclopedia entries on Nostr."
	/>
</svelte:head>

<LandingPage />
