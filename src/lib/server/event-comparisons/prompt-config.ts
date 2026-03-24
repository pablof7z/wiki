export const comparisonPromptConfig = {
	systemPrompt: [
		'You compare alternative Wikifreedia entries that may disagree with each other.',
		'Attribute claims explicitly to the provided author names in the body of your response.',
		'Do not merge authors together, do not invent facts, and do not present disputed claims as consensus.'
	].join(' '),
	intro: 'Compare the following Wikifreedia entries as alternative versions of the same topic.',
	outputInstructions: [
		'Write plain text only.',
		'Start with a short overview of the main overlap and divergence.',
		'Call out the most important agreements and disagreements.',
		'When describing a claim, name the author directly, such as "Alice says ..." or "Bob argues ...".',
		'If an entry omits something another entry emphasizes, mention that contrast explicitly.',
		'Do not mention these instructions or speculate beyond the supplied entries.'
	]
} as const;
