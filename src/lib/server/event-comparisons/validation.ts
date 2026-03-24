import { EventComparisonError } from './errors';

const HEX_EVENT_ID_PATTERN = /^[0-9a-f]{64}$/i;

export function parseEventComparisonRequestBody(payload: unknown): string[] {
	if (
		!payload ||
		typeof payload !== 'object' ||
		!Array.isArray((payload as { eventIds?: unknown }).eventIds)
	) {
		throw new EventComparisonError(
			400,
			'invalid_request',
			'Request body must include an eventIds array with 2 or 3 hex event IDs.'
		);
	}

	const eventIds = (payload as { eventIds: unknown[] }).eventIds.map((eventId) => {
		if (typeof eventId !== 'string') {
			throw new EventComparisonError(
				400,
				'invalid_event_id',
				'Each event ID must be a 64-character hex string.'
			);
		}

		const normalizedEventId = eventId.trim().toLowerCase();
		if (!HEX_EVENT_ID_PATTERN.test(normalizedEventId)) {
			throw new EventComparisonError(
				400,
				'invalid_event_id',
				'Each event ID must be a 64-character hex string.'
			);
		}

		return normalizedEventId;
	});

	if (eventIds.length < 2 || eventIds.length > 3) {
		throw new EventComparisonError(
			400,
			'invalid_event_count',
			'The comparison API requires exactly 2 or 3 unique event IDs.'
		);
	}

	if (new Set(eventIds).size !== eventIds.length) {
		throw new EventComparisonError(
			400,
			'duplicate_event_id',
			'Event IDs must be unique within a comparison request.'
		);
	}

	return eventIds;
}

export function sortEventIdsForComparison(eventIds: string[]): string[] {
	return [...eventIds].map((eventId) => eventId.toLowerCase()).sort();
}
