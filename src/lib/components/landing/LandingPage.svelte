<script lang="ts">
	import LandingNav from './LandingNav.svelte';
	import LandingHero from './LandingHero.svelte';
	import LandingDemo from './LandingDemo.svelte';
	import LandingSplit from './LandingSplit.svelte';
	import LandingNostr from './LandingNostr.svelte';
	import LandingWot from './LandingWot.svelte';
	import LandingManifesto from './LandingManifesto.svelte';
	import LandingCta from './LandingCta.svelte';

	let navScrolled = $state(false);
	let activeSection = $state('');
	let heroTransformY = $state(0);
	let demoRotateX = $state(55);
	let demoScale = $state(0.88);
	let demoOpacity = $state(0.15);

	const sectionIds = [
		'demo-section',
		'split-section',
		'nostr-section',
		'wot-section',
		'manifesto-section'
	];

	$effect(() => {
		function onScroll() {
			const scrollY = window.scrollY;

			// Nav background
			navScrolled = scrollY > 80;

			// Hero parallax
			heroTransformY = scrollY * 0.35;

			// Demo 3D unroll
			const scrollRange = window.innerHeight * 0.4;
			const t = Math.max(0, Math.min(1, scrollY / scrollRange));
			demoRotateX = 55 * (1 - t);
			demoScale = 0.88 + 0.12 * t;
			demoOpacity = 0.15 + 0.85 * t;

			// Scroll spy
			let current = '';
			for (const id of sectionIds) {
				const el = document.getElementById(id);
				if (el && el.offsetTop - 120 <= scrollY) current = id;
			}
			activeSection = current;
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<div class="landing-page">
	<div class="glow"></div>
	<LandingNav scrolled={navScrolled} {activeSection} />
	<LandingHero {heroTransformY} />
	<LandingDemo {demoRotateX} {demoScale} {demoOpacity} />
	<LandingSplit />
	<LandingNostr />
	<LandingWot />
	<LandingManifesto />
	<LandingCta />
</div>
