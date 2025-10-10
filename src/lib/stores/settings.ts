import { persist, createLocalStorage } from '@macfja/svelte-persistent-store';
import { writable } from 'svelte/store';

export const wysiwyg = persist(
	writable<boolean>(true),
	createLocalStorage(),
	'wysiwyg'
);