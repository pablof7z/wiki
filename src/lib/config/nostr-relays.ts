export const DEFAULT_RELAYS = Object.freeze([
	'wss://purplepag.es',
	'wss://nos.lol',
	'wss://relay.primal.net',
	'wss://custom.fiatjaf.com',
	'wss://relay.wikifreedia.xyz'
]);

export function normalizeRelayUrls(relayUrls: readonly string[]): string[] {
	return Array.from(
		new Set(relayUrls.map((relayUrl) => relayUrl.trim()).filter((relayUrl) => relayUrl.length > 0))
	);
}

export function parseRelayUrls(relayUrls: string | undefined): string[] {
	if (!relayUrls) return [];

	return normalizeRelayUrls(relayUrls.split(','));
}
