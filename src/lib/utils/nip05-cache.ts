import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { looksLikeNip05, prettifyNip05 } from './nip05';

const pubkeyByNip05 = new Map<string, string>();
const nip05ByPubkey = new Map<string, string>();

function toCacheKey(nip05: string | null | undefined): string | undefined {
	const prettyNip05 = toPrettyNip05(nip05);
	return prettyNip05?.toLowerCase();
}

function toPrettyNip05(nip05: string | null | undefined): string | undefined {
	if (typeof nip05 !== 'string') return undefined;

	const prettyNip05 = prettifyNip05(nip05).trim();
	if (!prettyNip05 || !looksLikeNip05(prettyNip05)) {
		return undefined;
	}

	return prettyNip05;
}

export function rememberNip05(pubkey: string | undefined, nip05: string | null | undefined): string | undefined {
	if (!pubkey) return undefined;

	const prettyNip05 = toPrettyNip05(nip05);
	const cacheKey = prettyNip05?.toLowerCase();
	if (!prettyNip05 || !cacheKey) return undefined;

	const previousPubkey = pubkeyByNip05.get(cacheKey);
	if (previousPubkey && previousPubkey !== pubkey) {
		const previousPubkeyNip05 = nip05ByPubkey.get(previousPubkey);
		if (previousPubkeyNip05?.toLowerCase() === cacheKey) {
			nip05ByPubkey.delete(previousPubkey);
		}
	}

	const previousNip05 = nip05ByPubkey.get(pubkey);
	if (previousNip05 && previousNip05 !== prettyNip05) {
		const previousKey = previousNip05.toLowerCase();
		if (pubkeyByNip05.get(previousKey) === pubkey) {
			pubkeyByNip05.delete(previousKey);
		}
	}

	pubkeyByNip05.set(cacheKey, pubkey);
	nip05ByPubkey.set(pubkey, prettyNip05);
	return prettyNip05;
}

export function rememberUserProfileNip05(
	pubkey: string | undefined,
	profile: Pick<NDKUserProfile, 'nip05'> | null | undefined
): string | undefined {
	return rememberNip05(pubkey, profile?.nip05);
}

export function getCachedPubkeyForNip05(identifier: string | undefined): string | undefined {
	const cacheKey = toCacheKey(identifier);
	if (!cacheKey) return undefined;
	return pubkeyByNip05.get(cacheKey);
}

export function getCachedNip05ForPubkey(pubkey: string | undefined): string | undefined {
	if (!pubkey) return undefined;
	return nip05ByPubkey.get(pubkey);
}

export function applyCachedNip05ToProfile(
	pubkey: string | undefined,
	profile: NDKUserProfile | undefined
): NDKUserProfile | undefined {
	if (!pubkey) return profile;

	const cachedNip05 = getCachedNip05ForPubkey(pubkey);
	if (!cachedNip05 || profile?.nip05 === cachedNip05) {
		return profile;
	}

	return {
		...profile,
		nip05: cachedNip05
	};
}

export function resetNip05MemoryCache(): void {
	pubkeyByNip05.clear();
	nip05ByPubkey.clear();
}
