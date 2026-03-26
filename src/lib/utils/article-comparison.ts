import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { extractMarkupTitle } from './markup';

const HEX_EVENT_ID_PATTERN = /^[0-9a-f]{64}$/i;

export const COMPARISON_QUERY_PARAM = 'ids';
export const MIN_COMPARISON_ENTRIES = 2;
export const MAX_COMPARISON_ENTRIES = 3;

export type EventComparisonSuccessResponse = {
	eventIds: string[];
	comparison: string;
	cached: boolean;
};

export type EventComparisonErrorResponse = {
	error?: string;
	code?: string;
};

export function getEventTitle(entry: NDKEvent): string {
	return entry.tagValue('title') || extractMarkupTitle(entry.content) || entry.dTag || 'Untitled';
}

export function formatEventDate(createdAt?: number): string {
	if (!createdAt) return 'Unknown date';
	return new Date(createdAt * 1000).toLocaleDateString();
}

export function createComparisonSignature(eventIds: string[]): string {
	return [...new Set(eventIds.map((eventId) => eventId.toLowerCase()))].sort().join(':');
}

export function normalizeComparisonMarkup(content: string): string {
	return content
		.replaceAll('\r\n', '\n')
		.replace(/^[ \t]*\*\*(.+?)\*\*[ \t]*$/gm, '## $1')
		.replace(/\*\*([^*\n]+?)\*\*/g, '*$1*');
}

export function parseComparisonEventIds(rawEventIds: string | null | undefined): string[] {
	if (!rawEventIds) return [];

	const parsedEventIds: string[] = [];

	for (const candidate of rawEventIds.split(',')) {
		const normalizedEventId = candidate.trim().toLowerCase();
		if (!HEX_EVENT_ID_PATTERN.test(normalizedEventId)) continue;
		if (parsedEventIds.includes(normalizedEventId)) continue;

		parsedEventIds.push(normalizedEventId);
		if (parsedEventIds.length === MAX_COMPARISON_ENTRIES) break;
	}

	return parsedEventIds;
}

export function sanitizeComparisonEventIds(
	entries: NDKEvent[],
	requestedEventIds: string[]
): string[] {
	const availableEntryIds = new Set(entries.map((entry) => entry.id.toLowerCase()));
	const validRequestedEventIds: string[] = [];

	for (const eventId of requestedEventIds) {
		const normalizedEventId = eventId.toLowerCase();
		if (!availableEntryIds.has(normalizedEventId)) continue;
		if (validRequestedEventIds.includes(normalizedEventId)) continue;

		validRequestedEventIds.push(normalizedEventId);
		if (validRequestedEventIds.length === MAX_COMPARISON_ENTRIES) break;
	}

	return validRequestedEventIds;
}

export function getTopicComparisonEventIds(entries: NDKEvent[], focusEntryId: string): string[] {
	const selectedEventIds: string[] = [];

	for (const entry of entries) {
		if (entry.id === focusEntryId) {
			selectedEventIds.unshift(entry.id);
			continue;
		}

		selectedEventIds.push(entry.id);
		if (selectedEventIds.length === MIN_COMPARISON_ENTRIES) break;
	}

	if (!selectedEventIds.includes(focusEntryId)) {
		const focusEntry = entries.find((entry) => entry.id === focusEntryId);
		if (focusEntry) {
			selectedEventIds.unshift(focusEntry.id);
		}
	}

	return selectedEventIds.slice(0, MIN_COMPARISON_ENTRIES);
}

export function buildTopicComparisonHref(topic: string, eventIds: string[]): string {
	const normalizedEventIds = [...new Set(eventIds.map((eventId) => eventId.toLowerCase()))].slice(
		0,
		MAX_COMPARISON_ENTRIES
	);

	const pathname = `/${encodeURIComponent(topic)}/compare`;
	return normalizedEventIds.length > 0
		? `${pathname}?${COMPARISON_QUERY_PARAM}=${normalizedEventIds.join(',')}`
		: pathname;
}
