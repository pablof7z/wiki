import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	getAdminComparisonConfig,
	setAdminComparisonConfig,
	isAdminTokenValid
} from '$lib/server/admin-config';
import { comparisonPromptConfig } from '$lib/server/event-comparisons/prompt-config';

const COOKIE_NAME = 'admin_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get(COOKIE_NAME);
	const authed = isAdminTokenValid(token);

	if (!authed) {
		return { authed: false as const };
	}

	const saved = await getAdminComparisonConfig();

	return {
		authed: true as const,
		config: {
			model: saved.model ?? process.env.COMPARE_OLLAMA_MODEL ?? '',
			systemPrompt: saved.systemPrompt ?? comparisonPromptConfig.systemPrompt
		},
		defaults: {
			model: process.env.COMPARE_OLLAMA_MODEL ?? '',
			systemPrompt: comparisonPromptConfig.systemPrompt
		}
	};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const token = data.get('token')?.toString().trim();

		if (!isAdminTokenValid(token)) {
			return fail(401, { loginError: 'Invalid token.' });
		}

		cookies.set(COOKIE_NAME, token!, {
			path: '/admin',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: COOKIE_MAX_AGE,
			secure: true
		});

		redirect(303, '/admin');
	},

	save: async ({ request, cookies }) => {
		const token = cookies.get(COOKIE_NAME);
		if (!isAdminTokenValid(token)) {
			return fail(401, { saveError: 'Unauthorized.' });
		}

		const data = await request.formData();
		const model = data.get('model')?.toString().trim() ?? '';
		const systemPrompt = data.get('systemPrompt')?.toString() ?? '';

		if (!model) {
			return fail(400, { saveError: 'Model is required.' });
		}

		await setAdminComparisonConfig({ model, systemPrompt });

		return { saved: true };
	},


};
