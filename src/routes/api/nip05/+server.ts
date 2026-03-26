import { json, type RequestHandler } from '@sveltejs/kit';
import { getNip05Pubkey, setNip05 } from '$lib/server/nip05/store';

const USERNAME_RE = /^[a-z0-9_-]{1,64}$/;

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON.' }, { status: 400 });
	}

	if (!body || typeof body !== 'object') {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	const { name, pubkey } = body as Record<string, unknown>;

	if (typeof name !== 'string' || !USERNAME_RE.test(name)) {
		return json(
			{ error: 'name must be 1-64 lowercase alphanumeric characters, hyphens, or underscores.' },
			{ status: 400 }
		);
	}

	if (typeof pubkey !== 'string' || !/^[0-9a-f]{64}$/.test(pubkey)) {
		return json({ error: 'pubkey must be a 64-character hex string.' }, { status: 400 });
	}

	try {
		const existing = await getNip05Pubkey(name);
		if (existing) {
			if (existing === pubkey) {
				return json({ ok: true });
			}
			return json({ error: 'Username is already taken.' }, { status: 409 });
		}

		await setNip05(name, pubkey);
		return json({ ok: true }, { status: 201 });
	} catch (error) {
		console.error('NIP-05 registration error:', error);
		return json({ error: 'Internal server error.' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ url }) => {
	const name = url.searchParams.get('name');
	if (!name) {
		return json({ error: 'name query parameter is required.' }, { status: 400 });
	}

	try {
		const pubkey = await getNip05Pubkey(name.toLowerCase());
		if (!pubkey) {
			return json({ exists: false });
		}
		return json({ exists: true, pubkey });
	} catch (error) {
		console.error('NIP-05 lookup error:', error);
		return json({ error: 'Internal server error.' }, { status: 500 });
	}
};
