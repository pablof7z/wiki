import type { Component } from 'svelte';
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

export type NDKWrapper = {
	kinds?: number[];
	from?: (event: NDKEvent) => NDKEvent;
};

export type MentionComponent = Component<{
	ndk: NDKSvelte;
	bech32: string;
	class?: string;
}>;

export type EventComponent = Component<{
	ndk: NDKSvelte;
	event: NDKEvent;
	class?: string;
}>;

export type HandlerInfo = {
	component: EventComponent;
	wrapper: NDKWrapper | null;
	priority: number;
};

export class ContentRenderer {
	mentionComponent: MentionComponent | null = null;
	fallbackComponent: EventComponent | null = null;

	private handlers = new Map<number, HandlerInfo>();
	private mentionPriority = 0;
	private fallbackPriority = 0;

	addKind(target: NDKWrapper | number[], component: EventComponent, priority = 1) {
		if (Array.isArray(target)) {
			for (const kind of target) {
				const existing = this.handlers.get(kind);
				if (!existing || priority >= existing.priority) {
					this.handlers.set(kind, { component, wrapper: null, priority });
				}
			}

			return;
		}

		const kinds = target.kinds ?? [];
		const wrapper = target.from ? target : null;

		for (const kind of kinds) {
			const existing = this.handlers.get(kind);
			if (!existing || priority >= existing.priority) {
				this.handlers.set(kind, { component, wrapper, priority });
			}
		}
	}

	setMentionComponent(component: MentionComponent | null, priority = 1) {
		if (priority >= this.mentionPriority) {
			this.mentionComponent = component;
			this.mentionPriority = priority;
		}
	}

	setFallbackComponent(component: EventComponent | null, priority = 1) {
		if (priority >= this.fallbackPriority) {
			this.fallbackComponent = component;
			this.fallbackPriority = priority;
		}
	}

	getKindHandler(kind: number | undefined): HandlerInfo | undefined {
		if (kind === undefined) {
			return undefined;
		}

		return this.handlers.get(kind);
	}

	clone() {
		const renderer = new ContentRenderer();
		renderer.mentionComponent = this.mentionComponent;
		renderer.fallbackComponent = this.fallbackComponent;
		renderer.mentionPriority = this.mentionPriority;
		renderer.fallbackPriority = this.fallbackPriority;

		for (const [kind, handler] of this.handlers) {
			renderer.handlers.set(kind, handler);
		}

		return renderer;
	}
}
