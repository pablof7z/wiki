<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let saving = $state(false);

	function resetSystemPrompt() {
		const el = document.getElementById('systemPrompt') as HTMLTextAreaElement;
		if (el) el.value = data.defaults.systemPrompt;
	}

	function handleSave() {
		saving = true;
		return (opts: { update: () => Promise<void> }) =>
			opts.update().then(() => {
				saving = false;
			});
	}
</script>

<div class="mx-auto max-w-2xl px-4 py-12">
	<h1 class="mb-8 text-2xl font-bold">Admin</h1>

	{#if !data.authed}
		<div class="rounded-lg border p-6">
			<h2 class="mb-4 text-lg font-semibold">Sign in</h2>
			<form method="POST" action="?/login">
				<div class="flex flex-col gap-3">
					<input
						type="password"
						name="token"
						placeholder="Admin token"
						class="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						required
					/>
					{#if form?.loginError}
						<p class="text-sm text-destructive">{form.loginError}</p>
					{/if}
					<button
						type="submit"
						class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Sign in
					</button>
				</div>
			</form>
		</div>
	{:else}
		<div class="flex flex-col gap-8">
			<section class="rounded-lg border p-6">
				<h2 class="mb-1 text-lg font-semibold">Comparison Settings</h2>
				<p class="mb-5 text-sm text-muted-foreground">
					These override the environment-variable defaults at request time.
				</p>

				<form
					method="POST"
					action="?/save"
					use:enhance={handleSave}
				>
					<div class="flex flex-col gap-5">
						<div class="flex flex-col gap-1.5">
							<label for="model" class="text-sm font-medium">Model</label>
							<input
								id="model"
								name="model"
								type="text"
								value={data.config.model}
								placeholder={data.defaults.model}
								class="rounded-md border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
								required
							/>
						</div>

						<div class="flex flex-col gap-1.5">
							<div class="flex items-center justify-between">
								<label for="systemPrompt" class="text-sm font-medium">System Prompt</label>
								<button
									type="button"
									onclick={resetSystemPrompt}
									class="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
								>
									Reset to default
								</button>
							</div>
							<textarea
								id="systemPrompt"
								name="systemPrompt"
								rows={6}
								class="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
							>{data.config.systemPrompt}</textarea>
							<p class="text-xs text-muted-foreground">Default: {data.defaults.systemPrompt}</p>
						</div>

						{#if form?.saveError}
							<p class="text-sm text-destructive">{form.saveError}</p>
						{/if}

						{#if form?.saved}
							<p class="text-sm text-green-600">Saved.</p>
						{/if}

						<button
							type="submit"
							disabled={saving}
							class="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
						>
							{saving ? 'Saving…' : 'Save'}
						</button>
					</div>
				</form>
			</section>
		</div>
	{/if}
</div>
