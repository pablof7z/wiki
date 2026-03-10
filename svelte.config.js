import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const defaultImportPreprocess = {
	script({ attributes, content }) {
		if (attributes.lang !== 'ts') return;

		const hoisted = [];
		let changed = false;
		let index = 0;

		const code = content.replace(
			/^(\s*)import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s+(['"][^'"]+['"]);?$/gm,
			(_, indent, localName, source) => {
				changed = true;
				const alias = `__default_import_${localName}_${index++}`;
				hoisted.push(`${indent}const ${localName} = ${alias}.default;`);
				return `${indent}import * as ${alias} from ${source};`;
			}
		);

		if (!changed) return;

		return {
			code: `${code}\n${hoisted.join('\n')}\n`
		};
	}
};

const dependencyCompatibilityPreprocess = {
	markup({ filename, content }) {
		if (!filename?.includes('/node_modules/bits-ui/dist/')) return;

		const code = content
			.replace(
				/bind:value=\{rootState\.opts\.value\.current as string\}/g,
				'value={String(rootState.opts.value.current ?? "")}'
			)
			.replace(
				/payload:\s*rootState\.activePayload as \[T\] extends \[never\] \? null : T \| null,/g,
				'payload: rootState.activePayload,'
			);

		if (code === content) return;

		return { code };
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	content: ['./src/**/*.{html,js,svelte,ts}'],
	preprocess: [dependencyCompatibilityPreprocess, defaultImportPreprocess, vitePreprocess({ script: true })],
	kit: {
		alias: {
			'@': './src/lib',
			'@components': './src/lib/components',
			'@nostr-dev-kit/svelte': './src/lib/compat/ndk-svelte.ts',
			$stores: 'src/lib/stores',
		},
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter()
	},
};

export default config;
