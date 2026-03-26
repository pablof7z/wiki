import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { describe, expect, it } from 'vitest';
import {
	buildTopicComparisonHref,
	createComparisonSignature,
	normalizeComparisonMarkup,
	parseComparisonEventIds,
	sanitizeComparisonEventIds
} from './article-comparison';

describe('article comparison utils', () => {
	it('parses and de-duplicates comparison event ids from the query string', () => {
		const eventA = 'a'.repeat(64);
		const eventB = 'b'.repeat(64);

		expect(
			parseComparisonEventIds(`${eventA}, ${eventB}, ${eventA}, invalid, ${'c'.repeat(64)}`)
		).toEqual([eventA, eventB, 'c'.repeat(64)]);
	});

	it('builds a comparison href for a topic route', () => {
		expect(buildTopicComparisonHref('truth', ['b'.repeat(64), 'a'.repeat(64)])).toBe(
			`/truth/compare?ids=${'b'.repeat(64)},${'a'.repeat(64)}`
		);
	});

	it('builds a comparison href for a single selected entry', () => {
		expect(buildTopicComparisonHref('truth', ['a'.repeat(64)])).toBe(
			`/truth/compare?ids=${'a'.repeat(64)}`
		);
	});

	it('normalizes markdown-style comparison content for the Djot renderer', () => {
		expect(
			normalizeComparisonMarkup('**Overview**\n\n- **Claim** something\n\n1. **Section**')
		).toBe('## Overview\n\n- *Claim* something\n\n1. *Section*');
	});

	it('creates a stable comparison signature regardless of id order', () => {
		expect(createComparisonSignature(['b'.repeat(64), 'a'.repeat(64)])).toBe(
			createComparisonSignature(['a'.repeat(64), 'b'.repeat(64)])
		);
	});

	it('does not auto-select fallback entries when none were requested', () => {
		const entries = [
			{ id: 'a'.repeat(64) },
			{ id: 'b'.repeat(64) }
		] as unknown as NDKEvent[];

		expect(sanitizeComparisonEventIds(entries, [])).toEqual([]);
	});
});
