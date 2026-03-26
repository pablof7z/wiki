<script lang="ts">
	let { size = 28 }: { size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
	<circle cx="32" cy="36" r="18" stroke="#cc6644" stroke-width="3" fill="none" opacity="0.8"/>
	<circle cx="48" cy="36" r="18" stroke="#e8e0d4" stroke-width="3" fill="none" opacity="0.5"/>
	<circle cx="40" cy="50" r="18" stroke="#cc6644" stroke-width="3" fill="none" opacity="0.35"/>
</svg>
