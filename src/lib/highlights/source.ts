import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';
import { extractMarkupTitle } from '$lib/utils/markup';
import { getHighlightArticleAddress, getHighlightArticleEventId, getHighlightSourceUrl } from './nostr';

export type HighlightSourceReference = {
	key: string;
	sourceEventId?: string;
	sourceAddress?: string;
	sourceUrl?: string;
};

export type HighlightSourceMeta = {
	key: string;
	title: string;
	href?: string;
	authorPubkey?: string;
	loading: boolean;
};

type HighlightSourceFetcher = {
	fetchEvent: (reference: string) => Promise<NDKEvent | null | undefined>;
};

export function parseHighlightSourceAddress(address: string) {
	const [kindValue, pubkey, ...identifierParts] = address.split(':');
	const identifier = identifierParts.join(':');
	const kind = Number(kindValue);

	if (!Number.isFinite(kind) || !pubkey || !identifier) return undefined;

	return {
		kind,
		pubkey,
		identifier
	};
}

export function getHighlightSourceReference(event: NDKEvent): HighlightSourceReference {
	return {
		key: event.id ?? `highlight:${event.created_at ?? 0}`,
		sourceEventId: getHighlightArticleEventId(event),
		sourceAddress: getHighlightArticleAddress(event),
		sourceUrl: getHighlightSourceUrl(event)
	};
}

export function buildFallbackHighlightSourceMeta(
	reference: HighlightSourceReference
): HighlightSourceMeta {
	if (reference.sourceAddress) {
		const parsedAddress = parseHighlightSourceAddress(reference.sourceAddress);
		if (parsedAddress) {
			return {
				key: reference.key,
				title: parsedAddress.identifier || 'Untitled',
				href: `/a/${nip19.naddrEncode(parsedAddress)}`,
				authorPubkey: parsedAddress.pubkey,
				loading: true
			};
		}
	}

	if (reference.sourceUrl) {
		return {
			key: reference.key,
			title: reference.sourceUrl,
			href: reference.sourceUrl,
			loading: false
		};
	}

	return {
		key: reference.key,
		title: 'Unknown source',
		loading: Boolean(reference.sourceEventId || reference.sourceAddress)
	};
}

function buildResolvedHighlightSourceMeta(
	reference: HighlightSourceReference,
	sourceEvent: NDKEvent | null | undefined
): HighlightSourceMeta {
	if (!sourceEvent) {
		return {
			...buildFallbackHighlightSourceMeta(reference),
			loading: false
		};
	}

	return {
		key: reference.key,
		title:
			sourceEvent.tagValue('title') ||
			extractMarkupTitle(sourceEvent.content) ||
			sourceEvent.dTag ||
			'Untitled',
		href: `/a/${sourceEvent.encode()}`,
		authorPubkey: sourceEvent.pubkey,
		loading: false
	};
}

export async function resolveHighlightSourceMeta(
	fetcher: HighlightSourceFetcher,
	reference: HighlightSourceReference
): Promise<HighlightSourceMeta | undefined> {
	if (reference.sourceEventId) {
		const sourceEvent = await fetcher.fetchEvent(reference.sourceEventId);
		return buildResolvedHighlightSourceMeta(reference, sourceEvent);
	}

	if (reference.sourceAddress) {
		const parsedAddress = parseHighlightSourceAddress(reference.sourceAddress);
		if (!parsedAddress) {
			return {
				key: reference.key,
				title: 'Unknown source',
				loading: false
			};
		}

		const sourceEvent = await fetcher.fetchEvent(nip19.naddrEncode(parsedAddress));
		return buildResolvedHighlightSourceMeta(reference, sourceEvent);
	}

	if (reference.sourceUrl) {
		return {
			key: reference.key,
			title: reference.sourceUrl,
			href: reference.sourceUrl,
			loading: false
		};
	}

	return undefined;
}
