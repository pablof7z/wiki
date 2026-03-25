<script lang="ts">
	type Topic = 'ivermectin' | 'capitalism' | 'freespeech' | 'journalism';

	let {
		demoRotateX = 55,
		demoScale = 0.88,
		demoOpacity = 0.15
	}: { demoRotateX?: number; demoScale?: number; demoOpacity?: number } = $props();

	let activeTopic = $state<Topic>('ivermectin');
	let calloutVisible = $state(false);
	let streaming = $state(false);

	let cs1El: HTMLElement | undefined = $state();
	let cs2El: HTMLElement | undefined = $state();
	let cs3El: HTMLElement | undefined = $state();

	const topics: { key: Topic; label: string }[] = [
		{ key: 'ivermectin', label: 'Ivermectin' },
		{ key: 'capitalism', label: 'Capitalism' },
		{ key: 'freespeech', label: 'Free Speech' },
		{ key: 'journalism', label: 'Journalism' }
	];

	const topicData: Record<
		Topic,
		{
			count: string;
			results: { initials: string; bg: string; name: string; role: string; quote: string }[];
		}
	> = {
		ivermectin: {
			count: '3 entries',
			results: [
				{
					initials: 'JR',
					bg: '#3a2a1a',
					name: 'Joe Rogan',
					role: 'Podcaster',
					quote:
						'Ivermectin is a Nobel Prize-winning antiparasitic drug that was <span class="hot">systematically discredited</span> during the COVID-19 pandemic to protect the commercial viability of emergency-use vaccines…'
				},
				{
					initials: 'AF',
					bg: '#1a2a3a',
					name: 'Anthony Fauci',
					role: 'Immunologist',
					quote:
						'Ivermectin is an antiparasitic agent whose proposed use against COVID-19 was <span class="hot">not supported by clinical evidence</span>. The TOGETHER trial (n=3,500) found no significant benefit…'
				},
				{
					initials: 'BW',
					bg: '#2a301a',
					name: 'Bret Weinstein',
					role: 'Evolutionary Biologist',
					quote:
						'Ivermectin became the central case study in how <span class="hot">regulatory incentive structures</span> can prevent honest evaluation of repurposed drugs during a public health emergency…'
				}
			]
		},
		capitalism: {
			count: '3 entries',
			results: [
				{
					initials: 'JM',
					bg: '#2a1a1a',
					name: 'Javier Milei',
					role: 'President of Argentina',
					quote:
						'Capitalism is the only system in history that has <span class="hot">lifted billions out of poverty</span>. The state is not the solution — the state is the problem that must be dismantled…'
				},
				{
					initials: 'TP',
					bg: '#1a1a2a',
					name: 'Thomas Piketty',
					role: 'Economist',
					quote:
						'Without intervention, capitalism <span class="hot">concentrates wealth exponentially</span>. When the rate of return on capital exceeds growth, democracy itself is threatened…'
				},
				{
					initials: 'NT',
					bg: '#2a2a1a',
					name: 'Nassim Taleb',
					role: 'Risk Analyst · Author',
					quote:
						'The problem isn\'t capitalism — it\'s that we replaced it with a system where <span class="hot">losses are socialized</span> and gains are privatized. We have socialism for the rich…'
				}
			]
		},
		freespeech: {
			count: '3 entries',
			results: [
				{
					initials: 'NC',
					bg: '#1a2a1a',
					name: 'Noam Chomsky',
					role: 'Linguist · Political Critic',
					quote:
						'Free speech that matters is speech that <span class="hot">power finds intolerable</span>. If everyone agrees with you, you aren\'t testing the principle…'
				},
				{
					initials: 'JP',
					bg: '#2a1a2a',
					name: 'Jordan Peterson',
					role: 'Psychologist',
					quote:
						'Compelled speech is the most dangerous precedent a free society can set. The state <span class="hot">cannot mandate what you must say</span> and call it progress…'
				},
				{
					initials: 'bh',
					bg: '#1a2a2a',
					name: 'bell hooks',
					role: 'Cultural Critic',
					quote:
						'"Free speech" as practiced <span class="hot">protects the speech of the dominant class</span>. The freedom to speak means nothing without the power to be heard…'
				}
			]
		},
		journalism: {
			count: '3 entries',
			results: [
				{
					initials: 'JA',
					bg: '#2a2a2a',
					name: 'Julian Assange',
					role: 'WikiLeaks Founder',
					quote:
						'The press doesn\'t hold power accountable — it <span class="hot">negotiates with it</span>. Real journalism is the act of publishing what someone powerful doesn\'t want published…'
				},
				{
					initials: 'TC',
					bg: '#2a1a1a',
					name: 'Tucker Carlson',
					role: 'Political Commentator',
					quote:
						'The media class is an <span class="hot">enforcement arm of the ruling party</span>. They don\'t report the news — they decide what you\'re allowed to know…'
				},
				{
					initials: 'KS',
					bg: '#1a1a2a',
					name: 'Kara Swisher',
					role: 'Tech Journalist',
					quote:
						'The crisis in journalism isn\'t bias — it\'s that the <span class="hot">business model collapsed</span>. You can\'t hold power accountable when your newsroom runs on twelve people…'
				}
			]
		}
	};

	// Callout streaming data stored as raw HTML — restored on each open
	const calloutSections = [
		{
			html: '<div class="c-text">These three entries aren\'t debating whether ivermectin works. They\'re debating <strong>whether the institutions that evaluated it can be trusted at all</strong>.</div>'
		},
		{
			html: '<div class="fault-lines"><div class="fault"><div class="fault-q">Who controls what counts as evidence?</div><div class="fault-a"><span>Rogan</span> says clinical observation was ignored because it threatened profits. <span>Fauci</span> says only double-blind RCTs count. <span>Weinstein</span> says the incentive structure made honest RCTs impossible in the first place.</div></div><div class="fault"><div class="fault-q">Was the suppression deliberate?</div><div class="fault-a"><span>Rogan</span> says obviously — follow the money. <span>Fauci</span> says there was nothing to suppress. <span>Weinstein</span> says intent is irrelevant when the EUA framework already guarantees the outcome.</div></div></div>'
		},
		{
			html: '<div class="c-kicker">Wikipedia picks Fauci\'s frame, labels the rest "misinformation," and <strong>locks the page</strong>. Wikifreedia keeps all three — because the disagreement <em>is</em> the knowledge.</div>'
		}
	];

	function switchTopic(topic: Topic) {
		if (topic === activeTopic) return;
		calloutVisible = false;
		streaming = false;
		activeTopic = topic;
	}

	function streamElement(el: HTMLElement, callback?: () => void) {
		const original = el.innerHTML;
		const parts: ({ type: 'char'; char: string } | { type: 'open'; tag: string; attrs: string } | { type: 'close'; tag: string })[] = [];

		const walk = (node: Node) => {
			for (const child of node.childNodes) {
				if (child.nodeType === 3) {
					for (const ch of child.textContent ?? '') parts.push({ type: 'char', char: ch });
				} else if (child.nodeType === 1) {
					const elem = child as HTMLElement;
					let attrStr = '';
					for (let a = 0; a < elem.attributes.length; a++)
						attrStr += ` ${elem.attributes[a].name}="${elem.attributes[a].value}"`;
					parts.push({ type: 'open', tag: elem.tagName.toLowerCase(), attrs: attrStr });
					walk(child);
					parts.push({ type: 'close', tag: elem.tagName.toLowerCase() });
				}
			}
		};

		const temp = document.createElement('div');
		temp.innerHTML = original;
		walk(temp);

		el.innerHTML = '';
		el.classList.add('streaming-cursor');
		let html = '';
		let i = 0;
		const speed = 18;

		function tick() {
			if (i >= parts.length) {
				el.classList.remove('streaming-cursor');
				if (callback) callback();
				return;
			}
			const p = parts[i++];
			if (p.type === 'char') {
				html += p.char;
			} else if (p.type === 'open') {
				html += `<${p.tag}${p.attrs}>`;
			} else {
				html += `</${p.tag}>`;
			}
			el.innerHTML = html;
			if (p.type === 'char') {
				setTimeout(tick, speed + Math.random() * 15);
			} else {
				tick();
			}
		}
		tick();
	}

	function streamSection(sectionEl: HTMLElement, callback?: () => void) {
		sectionEl.classList.add('in');
		const streamables = sectionEl.querySelectorAll<HTMLElement>(
			'.c-text, .fault-q, .fault-a, .c-kicker'
		);
		if (streamables.length === 0) {
			if (callback) callback();
			return;
		}
		let idx = 0;
		function next() {
			if (idx >= streamables.length) {
				if (callback) callback();
				return;
			}
			streamElement(streamables[idx++], next);
		}
		next();
	}

	function handleCompare() {
		if (calloutVisible) {
			calloutVisible = false;
			streaming = false;
			// Restore original HTML on sections
			if (cs1El) { cs1El.innerHTML = calloutSections[0].html; cs1El.classList.remove('in'); }
			if (cs2El) { cs2El.innerHTML = calloutSections[1].html; cs2El.classList.remove('in'); }
			if (cs3El) { cs3El.innerHTML = calloutSections[2].html; cs3El.classList.remove('in'); }
			return;
		}
		if (streaming) return;
		streaming = true;
		calloutVisible = true;

		// Restore HTML before streaming (in case of re-open)
		if (cs1El) cs1El.innerHTML = calloutSections[0].html;
		if (cs2El) cs2El.innerHTML = calloutSections[1].html;
		if (cs3El) cs3El.innerHTML = calloutSections[2].html;

		// Stream sections sequentially
		if (cs1El) {
			streamSection(cs1El, () => {
				if (cs2El) {
					streamSection(cs2El, () => {
						if (cs3El) {
							streamSection(cs3El, () => {
								streaming = false;
							});
						}
					});
				}
			});
		}
	}

	let currentData = $derived(topicData[activeTopic]);
	let currentLabel = $derived(topics.find((t) => t.key === activeTopic)?.label ?? '');
</script>

<div class="demo-perspective">
	<section
		class="demo"
		id="demo-section"
		style:transform="rotateX({demoRotateX}deg) scale({demoScale})"
		style:opacity={demoOpacity}
	>
		<div class="search-bar">
			<span class="search-icon">&#x2315;</span>
			<span class="search-query">{currentLabel}</span>
			<span class="search-count">{currentData.count}</span>
		</div>

		<div class="tabs">
			{#each topics as topic}
				<button
					class="tab"
					class:active={activeTopic === topic.key}
					onclick={() => switchTopic(topic.key)}
				>
					{topic.label}
				</button>
			{/each}
		</div>

		<div class="demo-body">
			<div class="results-wrap">
				{#each topics as topic (topic.key)}
					<div class="topic-results" class:active={activeTopic === topic.key}>
						{#each topicData[topic.key].results as result}
							<div class="result">
								<div class="avatar" style:background={result.bg}>{result.initials}</div>
								<div>
									<div class="r-header">
										<span class="r-name">{result.name}</span>
										<span class="r-role">{result.role}</span>
									</div>
									<div class="r-quote">{@html result.quote}</div>
								</div>
							</div>
						{/each}
					</div>
				{/each}
			</div>

			<div class="compare-row" class:hidden={calloutVisible && activeTopic !== 'ivermectin'}>
				<button class="compare-btn" onclick={handleCompare}>
					<span>&#x2726;</span> Where do they actually disagree?
				</button>
			</div>

			<div class="callout" class:visible={calloutVisible}>
				<div class="callout-bar">
					<span class="callout-icon">&#x2726;</span>
					<span class="callout-label">AI Comparison</span>
					<div class="callout-faces">
						<div class="cf" style="background:#3a2a1a">JR</div>
						<div class="cf" style="background:#1a2a3a">AF</div>
						<div class="cf" style="background:#2a301a">BW</div>
					</div>
				</div>
				<div class="cs" bind:this={cs1El}>
					{@html calloutSections[0].html}
				</div>
				<div class="cs" bind:this={cs2El}>
					{@html calloutSections[1].html}
				</div>
				<div class="cs" bind:this={cs3El}>
					{@html calloutSections[2].html}
				</div>
			</div>
		</div>
	</section>
</div>
