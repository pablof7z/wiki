import { type Readable, derived } from "svelte/store";

function throttleStore<T>(store: Readable<T>, time: number): Readable<T> {
	let lastTime: number | undefined;
	return derived(store, (value, set) => {
		const now = Date.now();
		if (!lastTime || (now - lastTime > time)) {
			set(value);
			lastTime = now;
		} else {
			const timeoutId = setTimeout(() => {
				set(value);
			}, time);

			return () => clearTimeout(timeoutId);
		}
	});
}

export default throttleStore;