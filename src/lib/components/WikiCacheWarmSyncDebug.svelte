<script lang="ts">
	import type { WikiCacheWarmSyncState } from '$lib/stores/wiki-cache-warm-sync';

	let { state }: { state: WikiCacheWarmSyncState } = $props();

	function tone(status: WikiCacheWarmSyncState['status']) {
		switch (status) {
			case 'completed':
				return 'bg-emerald-400';
			case 'error':
				return 'bg-rose-400';
			case 'running':
				return 'bg-sky-400';
			case 'waiting':
				return 'bg-amber-300';
			default:
				return 'bg-white/40';
		}
	}

	function label(value: string | null | undefined, fallback = 'pending') {
		return value ?? fallback;
	}

	function formatMode(mode: WikiCacheWarmSyncState['mode']) {
		if (mode === 'fetch-fallback') return 'fetch fallback';
		return mode;
	}

	function formatDuration(state: WikiCacheWarmSyncState) {
		if (!state.startedAt) return 'not started';

		const end = state.completedAt ?? Date.now();
		const durationMs = Math.max(0, end - state.startedAt);

		if (durationMs < 1000) return `${durationMs}ms`;
		if (durationMs < 60_000) return `${(durationMs / 1000).toFixed(1)}s`;
		return `${(durationMs / 60_000).toFixed(1)}m`;
	}
</script>

<aside
	aria-live="polite"
	class="pointer-events-none fixed bottom-4 right-4 z-[70] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[rgba(9,10,12,0.9)] p-4 text-xs text-white shadow-2xl backdrop-blur-xl"
>
	<div class="flex items-center justify-between gap-3">
		<div class="flex min-w-0 items-center gap-2">
			<span class={`h-2.5 w-2.5 flex-none rounded-full ${tone(state.status)}`}></span>
			<h2 class="truncate text-sm font-medium">Wiki cache sync</h2>
		</div>

		<span class="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-white/70">
			{state.status}
		</span>
	</div>

	<p class="mt-2 break-all font-mono text-[10px] text-white/45">{state.relayUrl}</p>

	<div class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
		<div>
			<div class="text-white/45">mode</div>
			<div>{label(formatMode(state.mode), 'pending')}</div>
		</div>
		<div>
			<div class="text-white/45">phase</div>
			<div>{label(state.phase)}</div>
		</div>
		<div>
			<div class="text-white/45">round</div>
			<div>{state.round}</div>
		</div>
		<div>
			<div class="text-white/45">duration</div>
			<div>{formatDuration(state)}</div>
		</div>
		<div>
			<div class="text-white/45">need</div>
			<div>{state.needCount}</div>
		</div>
		<div>
			<div class="text-white/45">have</div>
			<div>{state.haveCount}</div>
		</div>
		<div>
			<div class="text-white/45">warmed</div>
			<div>{state.fetchedCount}</div>
		</div>
		<div>
			<div class="text-white/45">bytes</div>
			<div>{state.messageSize}</div>
		</div>
	</div>

	{#if state.error}
		<div class="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100">
			{state.error}
		</div>
	{/if}
</aside>
