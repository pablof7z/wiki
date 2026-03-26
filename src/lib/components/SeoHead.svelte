<script lang="ts">
	import { SITE_NAME, type SeoMetadata } from '$lib/seo';

	let { seo }: { seo: SeoMetadata } = $props();

	const metadata = $derived({
		...seo,
		type: seo.type ?? 'website',
		siteName: seo.siteName ?? SITE_NAME
	});

	const twitterCard = $derived(metadata?.image ? 'summary_large_image' : 'summary');
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
	<link rel="canonical" href={metadata.canonical} />
	<meta property="og:site_name" content={metadata.siteName} />
	<meta property="og:type" content={metadata.type} />
	<meta property="og:title" content={metadata.title} />
	<meta property="og:description" content={metadata.description} />
	<meta property="og:url" content={metadata.canonical} />
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:title" content={metadata.title} />
	<meta name="twitter:description" content={metadata.description} />

	{#if metadata.robots}
		<meta name="robots" content={metadata.robots} />
	{/if}

	{#if metadata.author}
		<meta name="author" content={metadata.author} />
		{#if metadata.type === 'article'}
			<meta property="article:author" content={metadata.author} />
		{/if}
	{/if}

	{#if metadata.publishedTime}
		<meta property="article:published_time" content={metadata.publishedTime} />
	{/if}

	{#if metadata.section}
		<meta property="article:section" content={metadata.section} />
	{/if}

	{#if metadata.username}
		<meta property="profile:username" content={metadata.username} />
	{/if}

	{#if metadata.image}
		<meta property="og:image" content={metadata.image.url} />
		<meta property="og:image:alt" content={metadata.image.alt} />
		<meta name="twitter:image" content={metadata.image.url} />
		<meta name="twitter:image:alt" content={metadata.image.alt} />

		{#if metadata.image.width}
			<meta property="og:image:width" content={String(metadata.image.width)} />
		{/if}

		{#if metadata.image.height}
			<meta property="og:image:height" content={String(metadata.image.height)} />
		{/if}
	{/if}
</svelte:head>
