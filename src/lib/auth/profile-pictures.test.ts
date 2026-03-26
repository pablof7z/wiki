import { describe, expect, it } from 'vitest';

import { buildSuggestedPictureOptions } from './profile-pictures';

describe('profile picture helpers', () => {
	it('builds unique suggested picture options', () => {
		const options = buildSuggestedPictureOptions(8, () => 0.42);

		expect(options).toHaveLength(8);
		expect(new Set(options.map((option) => option.id)).size).toBe(8);
		expect(
			options.every((option) => option.url.startsWith('data:image/svg+xml;charset=UTF-8,'))
		).toBe(
			true
		);
	});

	it('caps suggested picture options to the available set', () => {
		const options = buildSuggestedPictureOptions(99, () => 0.1);

		expect(options).toHaveLength(16);
	});
});
