<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	let {
		open = $bindable(false),
		title,
		description,
		draftTitle,
		updatedAt,
		onresume = () => {},
		onreplace = () => {},
		oncancel = () => {}
	}: {
		open?: boolean;
		title: string;
		description: string;
		draftTitle?: string;
		updatedAt?: number;
		onresume?: () => void;
		onreplace?: () => void;
		oncancel?: () => void;
	} = $props();

	const dateFormat = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen && open) {
			oncancel();
		}

		open = nextOpen;
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-w-xl rounded-3xl border-white/10 bg-[rgba(10,10,10,0.96)] p-0 text-foreground shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
		<div class="space-y-6 px-6 py-6 sm:px-7">
			<Dialog.Header class="space-y-2 text-left">
				<Dialog.Title class="text-xl font-semibold">{title}</Dialog.Title>
				<Dialog.Description class="text-sm leading-6 text-muted-foreground">
					{description}
				</Dialog.Description>
			</Dialog.Header>

			{#if draftTitle || updatedAt}
				<div class="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
					{#if draftTitle}
						<div class="text-sm font-medium text-foreground">{draftTitle}</div>
					{/if}
					{#if updatedAt}
						<div class="mt-1 text-xs text-muted-foreground">
							Last saved {dateFormat.format(new Date(updatedAt * 1000))}
						</div>
					{/if}
				</div>
			{/if}

			<Dialog.Footer class="flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-0">
				<Button
					variant="ghost"
					class="rounded-full px-5"
					onclick={() => {
						open = false;
						oncancel();
					}}
				>
					Not now
				</Button>
				<Button
					variant="outline"
					class="rounded-full border-white/12 bg-transparent px-5"
					onclick={() => {
						open = false;
						onresume();
					}}
				>
					Resume draft
				</Button>
				<Button
					class="rounded-full px-5"
					onclick={() => {
						open = false;
						onreplace();
					}}
				>
					Replace existing draft
				</Button>
			</Dialog.Footer>
		</div>
	</Dialog.Content>
</Dialog.Root>
