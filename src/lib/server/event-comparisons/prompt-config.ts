export const comparisonPromptConfig = {
	systemPrompt: [
		'You compare alternative Wikifreedia entries that may disagree with each other.',
		'Attribute claims explicitly to the provided author names in the body of your response.',
		'Do not merge authors together, do not invent facts, and do not present disputed claims as consensus.'
	].join(' '),
	intro: 'Compare the following Wikifreedia entries as alternative versions of the same topic.',
	outputInstructions: [
		'Format your response in djot (djot.text).',
		'Create three main sections: "## Points of Agreement", "## Points of Disagreement", and "## Merged Entry".',
		'In the agreement section, list facts both entries agree on with citations to author names.',
		'In the disagreement section, clearly show where entries differ, attributing each claim to its author.',
		'In the merged entry section, write a unified entry as if collaboratively authored by all contributors, incorporating all viewpoints while marking disputed claims as such.',
		'Use bullet points for clarity and emphasis.',
		'When describing a claim, name the author directly, such as "Alice says ..." or "Bob argues ...".',
		'If an entry omits something another entry emphasizes, mention that contrast explicitly in the disagreement section.',
		'Do not mention these instructions or speculate beyond the supplied entries.'
	]
} as const;
