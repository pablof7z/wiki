import NDK, { NDKEvent, NDKKind, type NDKTag, type NostrEvent } from '@nostr-dev-kit/ndk';

export const NIP22_COMMENT_KIND = 1111;

export type CommentThreadNode = {
	comment: NDKEvent;
	replies: CommentThreadNode[];
};

function relayHint(event: NDKEvent): string {
	return event.relay?.url ?? '';
}

function buildRootReferenceTag(event: NDKEvent): NDKTag {
	if (event.isParamReplaceable()) {
		return ['A', event.tagAddress(), relayHint(event)];
	}

	return ['E', event.id, relayHint(event), event.pubkey];
}

function buildParentReferenceTags(event: NDKEvent): NDKTag[] {
	if (event.isParamReplaceable()) {
		const tags: NDKTag[] = [['a', event.tagAddress(), relayHint(event)]];

		if (event.id) {
			tags.push(['e', event.id, relayHint(event), event.pubkey]);
		}

		return tags;
	}

	return [['e', event.id, relayHint(event), event.pubkey]];
}

export function buildNip22CommentTags(root: NDKEvent, parent: NDKEvent): NDKTag[] {
	const tags: NDKTag[] = [buildRootReferenceTag(root)];

	if (root.kind !== undefined) {
		tags.push(['K', String(root.kind)]);
	}

	if (root.pubkey) {
		tags.push(['P', root.pubkey, relayHint(root)]);
	}

	tags.push(...buildParentReferenceTags(parent));

	if (parent.kind !== undefined) {
		tags.push(['k', String(parent.kind)]);
	}

	if (parent.pubkey) {
		tags.push(['p', parent.pubkey, relayHint(parent)]);
	}

	return tags;
}

export function createNip22CommentEvent(
	ndk: NDK,
	input: {
		root: NDKEvent;
		parent: NDKEvent;
		content: string;
	}
): NDKEvent {
	const comment = new NDKEvent(ndk, {
		kind: NIP22_COMMENT_KIND,
		content: input.content.trim()
	} as NostrEvent);

	comment.tags.push(...buildNip22CommentTags(input.root, input.parent));
	return comment;
}

export function isDirectReplyToRoot(comment: NDKEvent, root: NDKEvent): boolean {
	if (root.isParamReplaceable()) {
		const parentAddress = comment.getMatchingTags('a')[0]?.[1];
		if (parentAddress === root.tagAddress()) return true;
	}

	const parentEventId = comment.getMatchingTags('e')[0]?.[1];
	return parentEventId === root.id;
}

export function getCommentParentId(comment: NDKEvent): string | undefined {
	const parentKind = comment.getMatchingTags('k')[0]?.[1];
	if (parentKind !== String(NIP22_COMMENT_KIND)) return undefined;
	return comment.getMatchingTags('e')[0]?.[1];
}

export function buildCommentThread(comments: Iterable<NDKEvent>, root: NDKEvent): CommentThreadNode[] {
	const sortedComments = Array.from(comments).sort(
		(left, right) => (left.created_at ?? 0) - (right.created_at ?? 0)
	);
	const nodesById = new Map<string, CommentThreadNode>();
	const roots: CommentThreadNode[] = [];

	for (const comment of sortedComments) {
		if (!comment.id) continue;

		const node: CommentThreadNode = {
			comment,
			replies: []
		};

		nodesById.set(comment.id, node);
	}

	for (const comment of sortedComments) {
		if (!comment.id) continue;

		const node = nodesById.get(comment.id);
		if (!node) continue;

		const parentId = getCommentParentId(comment);
		if (parentId) {
			const parentNode = nodesById.get(parentId);
			if (parentNode) {
				parentNode.replies.push(node);
				continue;
			}
		}

		if (isDirectReplyToRoot(comment, root) || !parentId) {
			roots.push(node);
		}
	}

	return roots.sort((left, right) => (right.comment.created_at ?? 0) - (left.comment.created_at ?? 0));
}

export function flattenCommentThread(
	nodes: CommentThreadNode[],
	depth = 0
): Array<{ comment: NDKEvent; depth: number }> {
	return nodes.flatMap((node) => {
		const flattenedReplies = node.replies.sort(
			(left, right) => (left.comment.created_at ?? 0) - (right.comment.created_at ?? 0)
		);

		return [
			{ comment: node.comment, depth },
			...flattenCommentThread(flattenedReplies, depth + 1)
		];
	});
}
