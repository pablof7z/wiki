// Client hooks for SvelteKit
// This file is required by SvelteKit 2.x

export const handleError = ({ error }: { error: Error }) => {
	console.error(error);
};

export const init = () => {};
