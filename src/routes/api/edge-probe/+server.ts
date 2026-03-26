import { json, type RequestHandler } from '@sveltejs/kit';
import { getServerNdk } from '$lib/server/nostr';

export const config = {
	runtime: 'nodejs22.x'
};

export const GET: RequestHandler = async ({ url }) => {
	const target = url.searchParams.get('target')?.trim();

	if (!target) {
		return json(
			{
				ok: false,
				error: 'Missing "target" query parameter.'
			},
			{ status: 400 }
		);
	}

	const startedAt = Date.now();

	try {
		const ndk = await getServerNdk();
		const event = await ndk.fetchEvent(target);

		return json({
			ok: true,
			runtime: 'nodejs22.x',
			target,
			eventId: event?.id ?? null,
			durationMs: Date.now() - startedAt
		});
	} catch (error) {
		return json(
			{
				ok: false,
				runtime: 'nodejs22.x',
				target,
				durationMs: Date.now() - startedAt,
				error: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
