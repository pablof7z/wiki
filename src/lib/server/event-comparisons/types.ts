export type ComparableEntry = {
	eventId: string;
	authorName: string;
	authorPubkey: string;
	title: string;
	createdAt: number | null;
	kind: number;
	content: string;
};

export type ComparisonPrompt = {
	system: string;
	prompt: string;
};

export type EventComparisonResult = {
	eventIds: string[];
	comparison: string;
	cached: boolean;
};

export interface ComparisonCache {
	get(eventIds: string[]): Promise<string | null>;
	set(eventIds: string[], comparison: string): Promise<void>;
}

export interface ComparisonTextGenerator {
	generateComparison(prompt: ComparisonPrompt): Promise<string>;
}

export type ComparableEventFetcher = (eventIds: string[]) => Promise<ComparableEntry[]>;
export type ComparisonPromptBuilder = (entries: ComparableEntry[]) => ComparisonPrompt;
