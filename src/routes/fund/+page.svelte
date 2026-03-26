<script lang="ts">
	import PageContainer from '$lib/components/PageContainer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Bitcoin, PenLine, Users, ShieldCheck, ArrowUpRight } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Fund • Wikifreedia</title>
	<meta
		name="description"
		content="Fund the Wikifreedia patronage system. Support writers who bring real perspectives to knowledge."
	/>
</svelte:head>

<PageContainer class="py-8 sm:py-12">
	<!-- Hero Section -->
	<section class="mb-12 text-center sm:mb-16">
		<p class="eyebrow mb-4">The Wikifreedia Fund</p>
		<h1 class="mx-auto max-w-4xl">Fund the Perspectives That Matter</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
			Wikipedia claims neutrality but enforces a worldview. Wikifreedia says bias is honest. Fund
			the writers who bring their real perspectives.
		</p>
	</section>

	<!-- What is the Fund -->
	<section class="glass-panel mb-8 rounded-[2.25rem] p-6 sm:mb-10 sm:p-8">
		<p class="eyebrow mb-3">What is the Fund?</p>
		<h2 class="text-[clamp(1.8rem,3.5vw,2.6rem)]">Patronage for honest perspectives</h2>
		<p class="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
			A patronage fund that pays contributors to write quality biased content. Not governance
			theater — human editorial judgment deciding what gets funded. Writers declare their
			perspective, do the research, and get paid for depth and quality.
		</p>
	</section>

	<!-- Two-column: Donors & Contributors -->
	<div class="grid gap-6 md:grid-cols-2 md:gap-8">
		<!-- For Donors -->
		<section class="glass-panel-soft rounded-[2rem] p-6 sm:p-7">
			<div class="mb-5 flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
				>
					<Bitcoin class="h-5 w-5" />
				</div>
				<p class="eyebrow">For Donors</p>
			</div>

			<h3 class="mb-4 text-xl font-semibold sm:text-2xl">Fund diverse perspectives</h3>

			<ul class="space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
				<li class="flex items-start gap-3">
					<Users class="mt-1 h-4 w-4 shrink-0 text-primary" />
					<span>Support writers bringing authentic viewpoints, not a monoculture</span>
				</li>
				<li class="flex items-start gap-3">
					<ShieldCheck class="mt-1 h-4 w-4 shrink-0 text-primary" />
					<span>Fight institutional capture of knowledge</span>
				</li>
				<li class="flex items-start gap-3">
					<Bitcoin class="mt-1 h-4 w-4 shrink-0 text-primary" />
					<span>100% Bitcoin — uncensorable funding for uncensorable knowledge</span>
				</li>
			</ul>

			<div class="mt-6">
				<Button
					href="https://geyser.fund/project/wikifreedia"
					target="_blank"
					rel="noopener noreferrer"
					class="gap-2"
				>
					Donate via Geyser
					<ArrowUpRight class="h-4 w-4" />
				</Button>
			</div>
		</section>

		<!-- For Contributors -->
		<section class="glass-panel-soft rounded-[2rem] p-6 sm:p-7">
			<div class="mb-5 flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
				>
					<PenLine class="h-5 w-5" />
				</div>
				<p class="eyebrow">For Contributors</p>
			</div>

			<h3 class="mb-4 text-xl font-semibold sm:text-2xl">Get paid for quality bias</h3>

			<ul class="space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
				<li class="flex items-start gap-3">
					<PenLine class="mt-1 h-4 w-4 shrink-0 text-primary" />
					<span>Pitch articles with your declared perspective</span>
				</li>
				<li class="flex items-start gap-3">
					<Bitcoin class="mt-1 h-4 w-4 shrink-0 text-primary" />
					<span>Flexible bounties based on depth and importance</span>
				</li>
				<li class="flex items-start gap-3">
					<Users class="mt-1 h-4 w-4 shrink-0 text-primary" />
					<span>Your name, your perspective, your article — full attribution</span>
				</li>
			</ul>

			<div class="mt-6">
				<Button href="/new" variant="secondary" class="gap-2">
					Pitch an Article
					<ArrowUpRight class="h-4 w-4" />
				</Button>
			</div>
		</section>
	</div>

	<!-- Bottom CTA -->
	<section class="mt-10 text-center sm:mt-14">
		<p class="text-sm text-muted-foreground sm:text-base">
			Questions about the fund? Reach out on Nostr or open a discussion.
		</p>
	</section>
</PageContainer>
