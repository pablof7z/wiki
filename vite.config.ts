import { sveltekit } from '@sveltejs/kit/vite';

const config = {
  plugins: [sveltekit()],
  server: {
    allowedHosts: ['.ngrok.app', '.ngrok-free.app', '.ngrok.io']
  },
  preview: {
    allowedHosts: ['.ngrok.app', '.ngrok-free.app', '.ngrok.io']
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  build: {
    commonjsOptions: {
      include: [/@repo-ui/, /node_modules/],
    },
  },
};

export default config;
