<script lang="ts">
	import Logo from '$lib/components/Logo.svelte';

	let { scrolled = false, activeSection = '' }: { scrolled?: boolean; activeSection?: string } =
		$props();

	const links = [
		{ href: '#demo-section', label: 'Demo' },
		{ href: '#split-section', label: 'Wikipedia vs Us' },
		{ href: '#nostr-section', label: 'Architecture' },
		{ href: '#wot-section', label: 'Web of Trust' },
		{ href: '#manifesto-section', label: 'Manifesto' }
	];

	function scrollToSection(e: MouseEvent, href: string) {
		e.preventDefault();
		const target = document.querySelector(href);
		if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<nav class="landing-nav" class:scrolled>
	<div class="nav-logo" role="button" tabindex="0" onclick={scrollToTop} onkeydown={(e) => e.key === 'Enter' && scrollToTop()}><Logo size={24} /> Wikifreedia</div>
	<div class="nav-links">
		{#each links as link}
			<a
				class="nav-link"
				class:active={activeSection === link.href.slice(1)}
				href={link.href}
				onclick={(e) => scrollToSection(e, link.href)}
			>
				{link.label}
			</a>
		{/each}
		<a
			class="nav-cta"
			href="#cta-section"
			onclick={(e) => scrollToSection(e, '#cta-section')}
		>
			Start exploring
		</a>
	</div>
</nav>
