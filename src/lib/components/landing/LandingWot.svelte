<section class="wot-section" id="wot-section">
	<div class="wot-inner">
		<div class="wot-header">
			<div class="wot-eyebrow">The hard question</div>
			<div class="wot-heading">"Without gatekeepers, won't it just be chaos?"</div>
			<div class="wot-sub">
				No editorial board. No admins. No locks. So what stops Wikifreedia from drowning in spam,
				conspiracy theories, and hate speech?
			</div>
		</div>

		<!-- Row 1: Trust graph + text -->
		<div class="wot-row">
			<div class="wot-text">
				<div class="landing-callout" style="margin-top: 0;">
					<div class="landing-callout-label">Their answer</div>
					<div class="landing-callout-text">
						Appoint an <strong>editorial priesthood</strong> to decide what's true. The result is a political body pretending to be neutral.
					</div>
				</div>

				<div class="landing-callout">
					<div class="landing-callout-label">Our answer</div>
					<div class="landing-callout-text">
						<strong>Web of Trust.</strong> You decide who you trust. Your trust network filters the noise. The more people vouch for an author, the more visible they become — <strong>to you</strong>.
					</div>
				</div>

				<p style="margin-top: 1.5rem;">
					No one is silenced. No one is banned. But spam doesn't propagate — because
					<strong>no one trusts spammers</strong>.
				</p>
			</div>
			<div class="wot-visual">
				<svg class="trust-graph" viewBox="0 0 340 280">
					<!-- Cluster A: warm tones (medical skeptics) -->
					<circle cx="60" cy="100" r="18" fill="rgba(204,102,68,0.25)" stroke="rgba(204,102,68,0.4)" stroke-width="1.5" />
					<circle cx="95" cy="75" r="12" fill="rgba(204,102,68,0.15)" stroke="rgba(204,102,68,0.25)" stroke-width="1" />
					<circle cx="40" cy="140" r="10" fill="rgba(204,102,68,0.12)" stroke="rgba(204,102,68,0.2)" stroke-width="1" />
					<circle cx="100" cy="130" r="8" fill="rgba(204,102,68,0.1)" stroke="rgba(204,102,68,0.15)" stroke-width="1" />
					<circle cx="70" cy="60" r="6" fill="rgba(204,102,68,0.08)" stroke="rgba(204,102,68,0.12)" stroke-width="1" />
					<line x1="60" y1="100" x2="95" y2="75" class="edge-strong" />
					<line x1="60" y1="100" x2="40" y2="140" class="edge-strong" />
					<line x1="60" y1="100" x2="100" y2="130" class="edge-strong" />
					<line x1="95" y1="75" x2="70" y2="60" class="edge-strong" />

					<!-- Cluster B: cool tones -->
					<circle cx="270" cy="110" r="16" fill="rgba(100,140,200,0.2)" stroke="rgba(100,140,200,0.35)" stroke-width="1.5" />
					<circle cx="300" cy="80" r="11" fill="rgba(100,140,200,0.12)" stroke="rgba(100,140,200,0.2)" stroke-width="1" />
					<circle cx="245" cy="145" r="9" fill="rgba(100,140,200,0.1)" stroke="rgba(100,140,200,0.15)" stroke-width="1" />
					<circle cx="290" cy="140" r="7" fill="rgba(100,140,200,0.08)" stroke="rgba(100,140,200,0.12)" stroke-width="1" />
					<circle cx="260" cy="75" r="6" fill="rgba(100,140,200,0.08)" stroke="rgba(100,140,200,0.12)" stroke-width="1" />
					<line x1="270" y1="110" x2="300" y2="80" class="edge-strong" style="stroke:rgba(100,140,200,0.2)" />
					<line x1="270" y1="110" x2="245" y2="145" class="edge-strong" style="stroke:rgba(100,140,200,0.2)" />
					<line x1="270" y1="110" x2="290" y2="140" class="edge-strong" style="stroke:rgba(100,140,200,0.2)" />
					<line x1="300" y1="80" x2="260" y2="75" class="edge-strong" style="stroke:rgba(100,140,200,0.2)" />

					<!-- Cluster C: green tones -->
					<circle cx="170" cy="210" r="14" fill="rgba(120,180,100,0.15)" stroke="rgba(120,180,100,0.25)" stroke-width="1.5" />
					<circle cx="145" cy="240" r="9" fill="rgba(120,180,100,0.1)" stroke="rgba(120,180,100,0.15)" stroke-width="1" />
					<circle cx="200" cy="235" r="8" fill="rgba(120,180,100,0.08)" stroke="rgba(120,180,100,0.12)" stroke-width="1" />
					<circle cx="170" cy="260" r="5" fill="rgba(120,180,100,0.06)" stroke="rgba(120,180,100,0.1)" stroke-width="1" />
					<line x1="170" y1="210" x2="145" y2="240" class="edge-strong" style="stroke:rgba(120,180,100,0.2)" />
					<line x1="170" y1="210" x2="200" y2="235" class="edge-strong" style="stroke:rgba(120,180,100,0.2)" />
					<line x1="145" y1="240" x2="170" y2="260" class="edge-strong" style="stroke:rgba(120,180,100,0.2)" />

					<!-- Cross-cluster weak links -->
					<line x1="100" y1="130" x2="170" y2="210" class="edge-weak" />
					<line x1="245" y1="145" x2="170" y2="210" class="edge-weak" />
					<line x1="95" y1="75" x2="260" y2="75" class="edge-weak" />

					<!-- Spam nodes: isolated -->
					<circle cx="30" cy="240" r="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
					<circle cx="320" cy="230" r="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
					<circle cx="310" cy="250" r="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" stroke-width="1" />

					<!-- Cluster labels -->
					<text x="55" y="40" fill="#cc6644" opacity="0.5">skeptics</text>
					<text x="250" y="55" fill="rgba(100,140,200,0.5)">institutional</text>
					<text x="155" y="195" fill="rgba(120,180,100,0.5)">independent</text>
					<text x="10" y="265" fill="rgba(255,255,255,0.12)" font-size="12">spam</text>
					<text x="293" y="265" fill="rgba(255,255,255,0.12)" font-size="12">spam</text>
				</svg>
				<div class="cluster-label" style="bottom:0.75rem;left:1rem;color:rgba(255,255,255,0.15);font-size:0.8rem">
					Isolated nodes = invisible. No trust = no reach.
				</div>
			</div>
		</div>

		<!-- Row 2: Flat vs 3D comparison -->
		<div class="wot-row reverse">
			<div class="wot-text">
				<div class="landing-callout" style="margin-top: 0;">
					<div class="landing-callout-label">The difference</div>
					<div class="landing-callout-text">
						Wikipedia flattens every topic into a <strong>single line</strong> — one version wins, the rest are erased.
					</div>
				</div>

				<p>
					Wikifreedia captures the <em>full topology</em> of a subject: clusters of powerful,
					conflicting perspectives — each internally coherent, externally contested.
				</p>
				<p>
					You don't get a single answer. You get a <strong>map of the disagreement</strong>, with every
					faction visible, every argument traceable.
				</p>
			</div>
			<div>
				<div class="dimension-compare">
					<div class="dim-card flat">
						<div class="dim-label">Wikipedia</div>
						<div class="flat-visual">
							<div class="flat-line">
								<div class="flat-dot winner" style="left:62%">
									<div class="flat-arrow">&larr; "consensus"</div>
								</div>
								<div class="flat-dot" style="left:20%;opacity:0.25"></div>
								<div class="flat-dot" style="left:85%;opacity:0.15"></div>
							</div>
						</div>
						<div style="font-size:0.8rem;color:#555;margin-top:0.75rem">
							One dot survives. The rest: "misinformation."
						</div>
					</div>
					<div class="dim-card threed">
						<div class="dim-label active">Wikifreedia</div>
						<div class="threed-visual">
							<div class="td-dot" style="left:15%;top:25%;width:14px;height:14px;background:rgba(204,102,68,0.4)"></div>
							<div class="td-dot" style="left:25%;top:15%;width:9px;height:9px;background:rgba(204,102,68,0.25)"></div>
							<div class="td-dot" style="left:10%;top:45%;width:7px;height:7px;background:rgba(204,102,68,0.2)"></div>
							<div class="td-cluster" style="left:5%;top:8%;width:100px;height:80px;border-color:rgba(204,102,68,0.1)"></div>

							<div class="td-dot" style="left:65%;top:35%;width:12px;height:12px;background:rgba(100,140,200,0.35)"></div>
							<div class="td-dot" style="left:78%;top:25%;width:8px;height:8px;background:rgba(100,140,200,0.2)"></div>
							<div class="td-dot" style="left:72%;top:55%;width:7px;height:7px;background:rgba(100,140,200,0.15)"></div>
							<div class="td-cluster" style="left:58%;top:15%;width:90px;height:75px;border-color:rgba(100,140,200,0.1)"></div>

							<div class="td-dot" style="left:40%;top:70%;width:10px;height:10px;background:rgba(120,180,100,0.3)"></div>
							<div class="td-dot" style="left:50%;top:80%;width:7px;height:7px;background:rgba(120,180,100,0.2)"></div>
							<div class="td-cluster" style="left:32%;top:60%;width:75px;height:55px;border-color:rgba(120,180,100,0.1)"></div>
						</div>
						<div style="font-size:0.8rem;color:#666;margin-top:0.75rem">
							Every cluster visible. Every tension navigable.
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="wot-bottom">
			<div class="wot-kicker">
				We don't flatten knowledge into a single answer. We give you the tools to
				<strong>navigate the full landscape</strong> — and decide for yourself what's true.
			</div>
		</div>
	</div>
</section>
