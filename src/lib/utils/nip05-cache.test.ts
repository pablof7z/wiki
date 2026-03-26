import { beforeEach, describe, expect, it } from 'vitest';
import {
	applyCachedNip05ToProfile,
	getCachedNip05ForPubkey,
	getCachedPubkeyForNip05,
	rememberNip05,
	rememberUserProfileNip05,
	resetNip05MemoryCache
} from './nip05-cache';

describe('nip05 memory cache', () => {
	beforeEach(() => {
		resetNip05MemoryCache();
	});

	it('stores lookups by prettified nip05 and pubkey', () => {
		expect(rememberNip05('pubkey-1', '_@F7Z.IO')).toBe('F7Z.IO');

		expect(getCachedPubkeyForNip05('f7z.io')).toBe('pubkey-1');
		expect(getCachedPubkeyForNip05('_@f7z.io')).toBe('pubkey-1');
		expect(getCachedNip05ForPubkey('pubkey-1')).toBe('F7Z.IO');
	});

	it('updates reverse mappings when a pubkey changes nip05', () => {
		rememberNip05('pubkey-1', 'alice@example.com');
		rememberNip05('pubkey-1', 'alice@nostr.example');

		expect(getCachedPubkeyForNip05('alice@example.com')).toBeUndefined();
		expect(getCachedPubkeyForNip05('alice@nostr.example')).toBe('pubkey-1');
	});

	it('drops the old reverse entry when a nip05 is reassigned to a different pubkey', () => {
		rememberNip05('pubkey-1', 'alice@example.com');
		rememberNip05('pubkey-2', 'alice@example.com');

		expect(getCachedPubkeyForNip05('alice@example.com')).toBe('pubkey-2');
		expect(getCachedNip05ForPubkey('pubkey-1')).toBeUndefined();
	});

	it('can hydrate a profile from cached nip05 state', () => {
		rememberUserProfileNip05('pubkey-1', { nip05: '_@f7z.io' });

		expect(applyCachedNip05ToProfile('pubkey-1', { displayName: 'fiatjaf' })).toEqual({
			displayName: 'fiatjaf',
			nip05: 'f7z.io'
		});
	});
});
