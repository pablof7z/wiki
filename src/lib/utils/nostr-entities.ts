import { nip19 } from 'nostr-tools';

const NOSTR_URI_PATTERN =
	/nostr:(npub1[a-z0-9]{58}|nprofile1[a-z0-9]+|note1[a-z0-9]{58}|nevent1[a-z0-9]+|naddr1[a-z0-9]+)/gi;

export type NostrEntityType = 'mention' | 'event-ref';

export type NostrEntityMatch = {
	uri: string;
	bech32: string;
	index: number;
	type: NostrEntityType;
};

export function classifyNostrEntity(bech32: string): NostrEntityType | undefined {
	try {
		const decoded = nip19.decode(bech32);

		switch (decoded.type) {
			case 'npub':
			case 'nprofile':
				return 'mention';

			case 'note':
			case 'nevent':
			case 'naddr':
				return 'event-ref';

			default:
				return undefined;
		}
	} catch {
		return undefined;
	}
}

export function findNostrEntityMatches(text: string): NostrEntityMatch[] {
	const matches: NostrEntityMatch[] = [];

	for (const match of text.matchAll(NOSTR_URI_PATTERN)) {
		const bech32 = match[1];
		const index = match.index;
		if (!bech32 || index === undefined) {
			continue;
		}

		const type = classifyNostrEntity(bech32);
		if (!type) {
			continue;
		}

		matches.push({
			uri: match[0],
			bech32,
			index,
			type
		});
	}

	return matches;
}

export function createNostrPlaceholderHtml(
	match: NostrEntityMatch,
	escapeText: (value: string) => string,
	escapeAttribute: (value: string) => string
): string {
	const cssClass = match.type === 'mention' ? 'nostr-mention' : 'nostr-event-ref';

	return `<span class="${cssClass}" data-bech32="${escapeAttribute(match.bech32)}">${escapeText(match.uri)}</span>`;
}
