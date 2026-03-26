import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4174',
		port: 4174
	},
	use: {
		baseURL: 'http://127.0.0.1:4174'
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
