import { describe, expect, it } from 'vitest';
import { buildEventComparisonPrompt } from './prompt';

describe('buildEventComparisonPrompt', () => {
	it('includes author attribution details for every entry', () => {
		const prompt = buildEventComparisonPrompt([
			{
				eventId: 'a'.repeat(64),
				authorName: 'Alice',
				authorPubkey: '1'.repeat(64),
				title: 'Version A',
				createdAt: 1_710_000_000,
				kind: 30818,
				content: 'Alice says the entry began in one way.'
			},
			{
				eventId: 'b'.repeat(64),
				authorName: 'deadbeef...cafebabe',
				authorPubkey: '2'.repeat(64),
				title: 'Version B',
				createdAt: null,
				kind: 30818,
				content: 'A fallback author label is still available for attribution.'
			}
		]);

		expect(prompt.system).toContain('Attribute claims explicitly');
		expect(prompt.prompt).toContain('Author: Alice');
		expect(prompt.prompt).toContain('Author: deadbeef...cafebabe');
		expect(prompt.prompt).toContain(`Event ID: ${'a'.repeat(64)}`);
		expect(prompt.prompt).toContain('Write plain text only.');
	});
});
