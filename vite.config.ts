import { sveltekit } from '@sveltejs/kit/vite';

const config = {
  plugins: [sveltekit()],
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
