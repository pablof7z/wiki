<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ndk } from '$lib/ndk.svelte';
	import ArticleComparison from '$lib/components/ArticleComparison.svelte';
	import ArticleToc from '$lib/components/ArticleToc.svelte';
	import ComparisonVersionsSidebar from '$lib/components/ComparisonVersionsSidebar.svelte';
	import {
		COMPARISON_QUERY_PARAM,
		MAX_COMPARISON_ENTRIES,
		MIN_COMPARISON_ENTRIES,
		buildTopicComparisonHref,
		createComparisonSignature,
		normalizeComparisonMarkup,
		parseComparisonEventIds,
		sanitizeComparisonEventIds,
		type EventComparisonErrorResponse,
		type EventComparisonSuccessResponse
	} from '$lib/utils/article-comparison';
	import { extractMarkupHeadings } from '$lib/utils/markup';
	import { getRenderableTopicEntries } from '$lib/utils/topic-entries';

	const topic = $derived($page.params.topic ?? '');

	const entries = ndk.$subscribe(() => {
		const currentTopic = $page.params.topic;
		if (!currentTopic) return { filters: [] };

		return {
			filters: [{ kinds: [30818 as number], '#d': [currentTopic] }],
			subId: `topic-comparison-${currentTopic}`
		};
	});

	const topicEntries = $derived(getRenderableTopicEntries(entries.events));
	const requestedEntryIds = $derived(
		parseComparisonEventIds($page.url.searchParams.get(COMPARISON_QUERY_PARAM))
	);
	const selectedEntryIds = $derived(sanitizeComparisonEventIds(topicEntries, requestedEntryIds));
	const selectedEntries = $derived.by(() => {
		const entriesById = new Map(topicEntries.map((entry) => [entry.id.toLowerCase(), entry]));

		return selectedEntryIds
			.map((eventId) => entriesById.get(eventId.toLowerCase()))
			.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
	});

	let comparisonResult = $state<EventComparisonSuccessResponse | undefined>(undefined);
	let comparisonError = $state<string | undefined>(undefined);
	let isComparing = $state(false);
	let comparisonRequestKey = 0;

	const renderedComparisonContent = $derived(
		normalizeComparisonMarkup(comparisonResult?.comparison ?? '')
	);
	const comparisonHeadings = $derived.by(() =>
		extractMarkupHeadings(renderedComparisonContent).filter(
			(heading) => heading.level >= 2 && heading.level <= 3
		)
	);

	$effect(() => {
		if (!topicEntries.length) return;
		if (arraysEqual(requestedEntryIds, selectedEntryIds)) return;

		void goto(buildTopicComparisonHref(topic, selectedEntryIds), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	});

	$effect(() => {
		const requestEventIds = [...selectedEntryIds];

		if (
			requestEventIds.length < MIN_COMPARISON_ENTRIES ||
			requestEventIds.length > MAX_COMPARISON_ENTRIES
		) {
			comparisonResult = undefined;
			comparisonError = undefined;
			isComparing = false;
			return;
		}

		const requestSignature = createComparisonSignature(requestEventIds);
		const requestKey = ++comparisonRequestKey;

		isComparing = true;
		comparisonError = undefined;
		comparisonResult = undefined;

		fetchComparison(requestEventIds, requestSignature, requestKey);
	});

	async function fetchComparison(requestEventIds: string[], requestSignature: string, requestKey: number) {
		try {
			const response = await fetch('/api/event-comparisons', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					eventIds: requestEventIds
				})
			});

			const payload = (await response.json().catch(() => null)) as
				| EventComparisonSuccessResponse
				| EventComparisonErrorResponse
				| null;

			if (requestKey !== comparisonRequestKey) return;

			if (!response.ok) {
				comparisonError =
					(payload && 'error' in payload && typeof payload.error === 'string'
						? payload.error
						: 'Unable to compare these entries right now.');
				return;
			}

			if (
				!payload ||
				!('comparison' in payload) ||
				typeof payload.comparison !== 'string' ||
				!Array.isArray(payload.eventIds) ||
				typeof payload.cached !== 'boolean'
			) {
				comparisonError = 'The comparison response was not in the expected format.';
				return;
			}

			if (requestSignature !== createComparisonSignature(selectedEntryIds)) return;

			comparisonResult = payload;
		} catch {
			if (requestKey !== comparisonRequestKey) return;
			comparisonError = 'Unable to compare these entries right now.';
		} finally {
			if (requestKey === comparisonRequestKey) {
				isComparing = false;
			}
		}
	}

	function arraysEqual(left: string[], right: string[]) {
		return left.length === right.length && left.every((value, index) => value === right[index]);
	}

	function updateSelection(nextEntryIds: string[]) {
		const sanitizedEntryIds = sanitizeComparisonEventIds(topicEntries, nextEntryIds);

		void goto(buildTopicComparisonHref(topic, sanitizedEntryIds), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	function toggleEntry(eventId: string) {
		if (selectedEntryIds.includes(eventId)) {
			if (selectedEntryIds.length === 1) return;
			updateSelection(selectedEntryIds.filter((selectedEventId) => selectedEventId !== eventId));
			return;
		}

		if (selectedEntryIds.length >= MAX_COMPARISON_ENTRIES) return;
		updateSelection([...selectedEntryIds, eventId]);
	}
</script>

<svelte:head>
	<title>{topic} comparison | Wikifreedia</title>
	<meta
		name="description"
		content={`Compare alternative Wikifreedia entries for ${topic}.`}
	/>
</svelte:head>

<div class="page-shell-wide pt-6 pb-16">
	<div class="grid gap-8 xl:grid-cols-[minmax(12rem,1fr)_minmax(0,54rem)_minmax(16rem,1fr)] xl:items-start 2xl:grid-cols-[minmax(14rem,1fr)_minmax(0,56rem)_minmax(18rem,1fr)]">
		<aside class="hidden xl:block xl:justify-self-start">
			<div class="sticky top-32 w-full max-w-[15rem] 2xl:max-w-[17rem]">
				<ArticleToc headings={comparisonHeadings} />
			</div>
		</aside>

		<article class="min-w-0 xl:w-full">
			<ArticleComparison
				{topic}
				entries={selectedEntries}
				{comparisonResult}
				comparisonError={comparisonError}
				{isComparing}
				comparisonContent={renderedComparisonContent}
			/>

			<div class="mt-12 space-y-6 xl:hidden">
				<ArticleToc headings={comparisonHeadings} />
				<ComparisonVersionsSidebar
					entries={topicEntries}
					selectedEntryIds={selectedEntryIds}
					onToggleEntry={toggleEntry}
				/>
			</div>
		</article>

		<aside class="hidden xl:block xl:justify-self-end">
			<div class="sticky top-32 w-full max-w-[20rem] 2xl:max-w-[22rem]">
				<ComparisonVersionsSidebar
					entries={topicEntries}
					selectedEntryIds={selectedEntryIds}
					onToggleEntry={toggleEntry}
				/>
			</div>
		</aside>
	</div>
</div>
