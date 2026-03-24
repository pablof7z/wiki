import { comparisonPromptConfig } from './prompt-config';
import type { ComparableEntry, ComparisonPrompt } from './types';

export function buildEventComparisonPrompt(entries: ComparableEntry[]): ComparisonPrompt {
	const promptSections = entries.map((entry, index) =>
		[
			`Entry ${index + 1}`,
			`Event ID: ${entry.eventId}`,
			`Title: ${entry.title}`,
			`Author: ${entry.authorName}`,
			`Author pubkey: ${entry.authorPubkey}`,
			`Created at: ${formatCreatedAt(entry.createdAt)}`,
			`Kind: ${entry.kind}`,
			'Content:',
			entry.content
		].join('\n')
	);

	const outputInstructions = comparisonPromptConfig.outputInstructions
		.map((instruction) => `- ${instruction}`)
		.join('\n');

	return {
		system: comparisonPromptConfig.systemPrompt,
		prompt: [
			comparisonPromptConfig.intro,
			'Follow these response rules:',
			outputInstructions,
			...promptSections
		].join('\n\n')
	};
}

function formatCreatedAt(createdAt: number | null): string {
	if (!createdAt) return 'Unknown';

	return new Date(createdAt * 1000).toISOString();
}
