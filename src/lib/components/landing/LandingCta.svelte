<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<section class="cta-section" id="cta-section">
	<div class="cta-text">Read. Write. Disagree. No one gets the last word.</div>
	<button class="cta-btn" onclick={() => goto('/?q=')}>Start exploring</button>
</section>
