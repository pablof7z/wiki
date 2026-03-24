import { json, type RequestHandler } from '@sveltejs/kit';
import { EventComparisonError } from '$lib/server/event-comparisons/errors';
import { createDefaultEventComparisonService } from '$lib/server/event-comparisons/service';
import { parseEventComparisonRequestBody } from '$lib/server/event-comparisons/validation';

export const POST: RequestHandler = async ({ request }) => {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return json(
			{
				error: 'Request body must be valid JSON.',
				code: 'invalid_json'
			},
			{ status: 400 }
		);
	}

	try {
		const eventIds = parseEventComparisonRequestBody(payload);
		const eventComparisonService = createDefaultEventComparisonService();
		const comparison = await eventComparisonService.compareEventIds(eventIds);

		return json(comparison);
	} catch (error) {
		const failure =
			error instanceof EventComparisonError
				? error
				: new EventComparisonError(
						500,
						'internal_error',
						'Unexpected server error while comparing events.'
					);

		return json(
			{
				error: failure.message,
				code: failure.code
			},
			{ status: failure.status }
		);
	}
};
