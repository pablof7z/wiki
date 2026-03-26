<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';

	let { heroTransformY = 0 }: { heroTransformY?: number } = $props();
</script>

<div class="hero-wrap">
	<section class="hero" id="hero-section" style:transform="translateY(-{heroTransformY}px)">
		<div class="hero-logo"><Logo size={64} /></div>
		<div class="wordmark">Wikifreedia</div>
		<div class="hero-headline">The encyclopedia that <em>can't</em> pick a side.</div>
		<div class="hero-sub">
			Wikipedia lets <span class="villain">anonymous gatekeepers</span> decide what counts as truth —
			then locks the page and calls it consensus. We think knowledge dies the moment one perspective
			gets to silence the others.
		</div>
	</section>
</div>
