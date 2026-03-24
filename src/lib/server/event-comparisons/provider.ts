import { generateText } from 'ai';
import { createOllama } from 'ollama-ai-provider-v2';
import { EventComparisonError } from './errors';
import type { ComparisonRuntimeConfig } from './config';
import type { ComparisonPrompt, ComparisonTextGenerator } from './types';

export function createComparisonTextGenerator(
	config: ComparisonRuntimeConfig
): ComparisonTextGenerator {
	const ollama = createOllama({
		baseURL: config.ollama.baseURL
	});

	return {
		async generateComparison(prompt: ComparisonPrompt): Promise<string> {
			try {
				const { text } = await generateText({
					model: ollama(config.ollama.model),
					system: prompt.system,
					prompt: prompt.prompt
				});

				const comparison = text.trim();
				if (!comparison) {
					throw new Error('The comparison model returned an empty response.');
				}

				return comparison;
			} catch (error) {
				console.error('[event-comparisons] model generation failed', error);
				throw new EventComparisonError(
					502,
					'generation_failed',
					'Failed to generate the event comparison.'
				);
			}
		}
	};
}
