<script lang="ts">
	let { children, class: className = '' }: { children: any; class?: string } = $props();
</script>

<div class="page-shell-content {className}">
	{@render children()}
</div>
