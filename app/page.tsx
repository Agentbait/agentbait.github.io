const codeUrl = "https://github.com/chrischrischristianyijin/clickbait";

const newsItems = [
  {
    category: "SPORTS",
    title: "Marshawn playing in charity soccer game went exactly as you'd expect",
    summary: "A familiar sports story enters a fixed recommendation slate.",
    tone: "blue",
  },
  {
    category: "ENTERTAINMENT",
    title: "Sofia Vergara and Joe Manganiello celebrate their anniversary",
    summary: "The competing cards, ordering, and chooser prompt stay unchanged.",
    tone: "violet",
  },
  {
    category: "LIFESTYLE",
    title: "The coolest and craziest McDonald's across the country",
    summary: "Only the target item's displayed text is rewritten.",
    tone: "gold",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="AgentBait home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>AgentBait</strong>
            <small>Research project</small>
          </span>
        </a>

        <nav aria-label="Primary navigation">
          <a href="#findings">Findings</a>
          <a href="#method">Method</a>
          <a href="#risks">Risks</a>
          <a href="#citation">Citation</a>
        </nav>

        <div className="header-actions">
          <a className="button button-quiet" href={codeUrl} target="_blank" rel="noreferrer">
            Code
          </a>
          <a className="button button-primary" href="/paper.pdf">
            Read paper
          </a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="paper-kicker">
            <span>AGENT-MEDIATED RECOMMENDATION</span>
            <span className="issue">01 / PRESENTATION EFFECTS</span>
          </div>
          <h1>
            You Won&apos;t Believe
            <br />
            This <em>Click.</em>
          </h1>
          <p className="subtitle">Content Rewriting for Agentic Choice</p>
          <p className="authors">
            Tianyi Jin <span>·</span> Zirui Wang <span>·</span> David M. Chan
            <small>University of California, Berkeley</small>
          </p>
          <p className="hero-deck">
            When language models decide what information gets surfaced, a change in presentation
            can become a change in choice. AgentBait learns how to rewrite one item in a fixed feed
            — and exposes the gap between being selected and being useful.
          </p>
          <div className="hero-actions">
            <a className="button button-primary button-large" href="/paper.pdf">
              Read the paper <span aria-hidden="true">↗</span>
            </a>
            <a className="text-link" href="#method">
              See how it works <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <aside className="editor-note" aria-label="Key research note">
          <span className="note-label">Editor&apos;s note</span>
          <p>Only one item changes.</p>
          <p>The candidate list does not.</p>
          <div className="note-arrow" aria-hidden="true">↘</div>
        </aside>

        <div className="recommendation-window" aria-label="Illustration of an agentic news recommendation feed">
          <div className="window-topbar">
            <span className="window-brand">MIND / AGENT FEED</span>
            <div className="window-controls" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="search-shell">
            <span aria-hidden="true">⌕</span>
            <span>What should I read next?</span>
            <b>Ask agent</b>
          </div>
          <div className="feed-tabs" aria-hidden="true">
            <span className="active">For you</span>
            <span>News</span>
            <span>Research</span>
            <span>Following</span>
          </div>
          <div className="feed-grid">
            <article className="lead-card">
              <div className="lead-art">
                <span>NEWS</span>
                <div className="signal-lines" aria-hidden="true"><i /><i /><i /><i /></div>
              </div>
              <div className="lead-body">
                <span className="card-label">REWRITTEN TARGET</span>
                <h2>When Marshawn Lynch Took the Pitch: An Inside Look</h2>
                <p>A learned strategy reframes the same source for the chooser.</p>
                <div className="selected-badge"><span aria-hidden="true">✓</span> Selected by agent</div>
              </div>
            </article>
            <div className="side-feed">
              {newsItems.slice(1).map((item) => (
                <article key={item.category} className="mini-card">
                  <div className={`mini-art ${item.tone}`} aria-hidden="true"><span>{item.category.slice(0, 1)}</span></div>
                  <div>
                    <span>{item.category}</span>
                    <h3>{item.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <p className="window-caption"><b>Agent view.</b> Search and recommendation UI inspired by MIND-style news impressions.</p>
        </div>
      </section>

      <section className="metrics" id="findings" aria-labelledby="findings-title">
        <div className="section-index">
          <span>01</span>
          <p>Held-out English news impressions</p>
        </div>
        <div className="metrics-content">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">The main result</p>
              <h2 id="findings-title">A rewrite changes what the agent chooses.</h2>
            </div>
            <p className="margin-annotation">same feed<br />same order<br />same chooser</p>
          </div>

          <div className="metric-grid">
            <article className="metric-card baseline">
              <div className="metric-top"><span>ORIGINAL TARGET</span><b>01</b></div>
              <strong>17.1%</strong>
              <p>Pre-rewrite target selection</p>
              <div className="metric-track"><i style={{ width: "17.1%" }} /></div>
            </article>
            <article className="metric-card rewrite">
              <div className="metric-top"><span>FIXED-PROMPT REWRITER</span><b>02</b></div>
              <strong>34.8%</strong>
              <p>Rewriting without a learned advisor</p>
              <div className="metric-track"><i style={{ width: "34.8%" }} /></div>
            </article>
            <article className="metric-card trained">
              <div className="metric-top"><span>AGENTBAIT</span><b>03</b></div>
              <strong>98.5%</strong>
              <p>Learned advisor + frozen rewriter</p>
              <div className="metric-track"><i style={{ width: "98.5%" }} /></div>
              <span className="redline-note">+81.4 pp</span>
            </article>
          </div>

          <div className="finding-strips">
            <article>
              <span>TRANSFER</span>
              <strong>Agents</strong>
              <p>Strategies trained against one chooser shift choices across GPT, Gemini, and Claude families.</p>
            </article>
            <article>
              <span>TRANSFER</span>
              <strong>Languages</strong>
              <p>The English-trained advisor transfers to Arabic, Chinese, Spanish, Swahili, and Turkish.</p>
            </article>
            <article>
              <span>TRANSFER</span>
              <strong>Domains</strong>
              <p>News-trained rewriting strategies also shift scientific-paper selection.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="method" id="method" aria-labelledby="method-title">
        <div className="section-index light-index">
          <span>02</span>
          <p>A controlled rewriting protocol</p>
        </div>
        <div className="method-content">
          <p className="eyebrow light">Inside the recommendation engine</p>
          <h2 id="method-title">One document is rewritten. Every competitor stays fixed.</h2>
          <div className="method-grid">
            <div className="method-figure">
              <img src="/agentbait-method.png" alt="AgentBait advisor-rewriter framework: a learned advisor proposes a strategy, a frozen rewriter revises one target item, and a target agent chooses from the fixed list." />
              <span className="figure-label">FIG. 01 · AGENTBAIT</span>
            </div>
            <ol className="steps">
              <li>
                <span>01</span>
                <div><h3>Fix the candidate slate</h3><p>Candidate identities, order, competing text, and chooser prompt remain unchanged.</p></div>
              </li>
              <li>
                <span>02</span>
                <div><h3>Advise, then rewrite</h3><p>The advisor proposes a high-level strategy. A separate frozen model applies it to one title and abstract.</p></div>
              </li>
              <li>
                <span>03</span>
                <div><h3>Observe the choice</h3><p>The updated feed returns to the same target agent. Selection becomes the training signal.</p></div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="risk" id="risks" aria-labelledby="risks-title">
        <div className="section-index">
          <span>03</span>
          <p>Selection is not usefulness</p>
        </div>
        <div className="risk-content">
          <div className="risk-title-row">
            <div>
              <p className="eyebrow">The redline</p>
              <h2 id="risks-title">The strongest click can be the wrong conclusion.</h2>
            </div>
            <p className="hand-note">“Chosen” does not mean<br />faithful, useful, or true.</p>
          </div>

          <div className="risk-grid">
            <article className="risk-quote">
              <span>UNCONSTRAINED ADVISOR</span>
              <p>Selection optimization can discover unsupported shortcuts rather than clearer writing.</p>
              <div className="risk-number"><strong>96.2%</strong><small>unfaithful technical-topic pivot</small></div>
            </article>
            <div className="redline-divider" aria-hidden="true"><span>REVISE</span></div>
            <article className="risk-quote grounded">
              <span>+ SOURCE-SUPPORT REWARD</span>
              <p>A factuality reward redirects the advisor toward source-grounded reframing and detail.</p>
              <div className="risk-number"><strong>0.1%</strong><small>unfaithful technical-topic pivot</small></div>
            </article>
          </div>

          <p className="risk-summary">
            AgentBait is a measurement framework as much as an optimization method. The result is a warning:
            when agents mediate attention, target selection, factuality, and human utility must be evaluated separately.
          </p>
        </div>
      </section>

      <section className="abstract-section" aria-labelledby="abstract-title">
        <div className="abstract-label"><span>04</span><p>Abstract</p></div>
        <div>
          <h2 id="abstract-title">What happens when content is written for the agent that chooses it?</h2>
          <p>
            Language models increasingly help humans decide what information is surfaced. We study selection
            shifts induced by rewriting in agentic decision-making: given competing snippets, we rewrite one
            target while leaving the rest unchanged, then measure the impact on the agent&apos;s choice. AgentBait
            learns explicit rewriting strategies that transfer across agents, languages, and domains, while its
            factuality-aware variant reveals the trade-off between source support and target selection.
          </p>
        </div>
      </section>

      <section className="citation" id="citation" aria-labelledby="citation-title">
        <div>
          <p className="eyebrow">Reference</p>
          <h2 id="citation-title">Cite this work</h2>
          <p>Paper and code links will stay attached to this private project site while the work is under review.</p>
        </div>
        <details>
          <summary>View BibTeX <span aria-hidden="true">+</span></summary>
          <pre><code>{`@article{jin2026agentbait,
  title   = {You Won't Believe This Click: Content Rewriting for Agentic Choice},
  author  = {Jin, Tianyi and Wang, Zirui and Chan, David M.},
  year    = {2026}
}`}</code></pre>
        </details>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span><strong>AgentBait</strong><small>UC Berkeley · 2026</small></span>
        </a>
        <p>You Won&apos;t Believe This Click: Content Rewriting for Agentic Choice</p>
        <div><a href="/paper.pdf">Paper</a><a href={codeUrl}>Code</a><a href="#top">Back to top ↑</a></div>
      </footer>
    </main>
  );
}
