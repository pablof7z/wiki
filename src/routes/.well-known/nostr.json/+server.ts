import type { RequestHandler } from '@sveltejs/kit';
import { getNip05Pubkey } from '$lib/server/nip05/store';

export const GET: RequestHandler = async ({ url }) => {
	const name = url.searchParams.get('name');

	if (!name) {
		return new Response(JSON.stringify({ names: {} }), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}

	try {
		const pubkey = await getNip05Pubkey(name.toLowerCase());

		if (!pubkey) {
			return new Response(JSON.stringify({ names: {} }), {
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		return new Response(JSON.stringify({ names: { [name.toLowerCase()]: pubkey } }), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('.well-known/nostr.json error:', error);
		return new Response(JSON.stringify({ names: {} }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
};
