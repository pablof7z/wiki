<script lang="ts">
	let { children, class: className = "" }: { children: any; class?: string } = $props();
</script>

<div class="container mx-auto px-6 py-6 max-w-5xl {className}">
	{@render children()}
</div>
