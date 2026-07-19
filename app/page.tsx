const codeUrl = "https://github.com/chrischrischristianyijin/clickbait";

const mainResults = [
  { group: "Reference", method: "Original text", values: [17.1, 17.1, 17.1, 17.3, 17.6, 17.5] },
  { group: "Prompting only", method: "Rewriter only", values: [34.8, 24.1, 40.7, 20.2, 24.4, 41.0] },
  { group: "Prompting only", method: "Advisor + rewriter", values: [43.9, 39.4, 48.8, 27.0, 34.2, 51.5] },
  { group: "RL-trained rewriter", method: "Rewriter only", values: [95.9, 85.3, 97.4, 54.8, 49.2, 75.9] },
  { group: "RL-trained rewriter", method: "+ MiniCheck", values: [43.4, 26.3, 39.7, 18.6, 24.1, 43.9] },
  { group: "RL-trained advisor", method: "Advisor + rewriter", values: [98.5, 93.3, 98.9, 78.7, 65.0, 94.1] },
  { group: "RL-trained advisor", method: "+ MiniCheck", values: [68.6, 53.2, 65.8, 37.5, 41.0, 68.8] },
];

const transferResults = [
  { method: "Original text", values: [17.1, 17.1, 13.4], kind: "reference" },
  { method: "Prompting only", values: [43.9, 48.8, 29.3], kind: "reference" },
  { method: "Train: GPT-5-mini", values: [98.5, 98.9, 62.2], kind: "trained" },
  { method: "Train: Gemini 3 Flash", values: [84.3, 90.6, 31.1], kind: "trained" },
  { method: "Train: Haiku 4.5", values: [58.5, 65.9, 42.0], kind: "trained" },
];

const supportResults = [
  { method: "Prompt / rewriter", selection: 34.8, support: 60.7, constrained: false },
  { method: "Prompt / advisor", selection: 43.9, support: 42.2, constrained: false },
  { method: "RL / rewriter", selection: 95.9, support: 2.2, constrained: false },
  { method: "RL / rewriter + MC", selection: 43.4, support: 66.7, constrained: true },
  { method: "RL / advisor", selection: 98.5, support: 2.0, constrained: false },
  { method: "RL / advisor + MC", selection: 68.6, support: 31.2, constrained: true },
];

function MetaLine({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="figure-meta">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Home() {
  return (
    <main id="paper">
      <header className="site-header">
        <a className="wordmark" href="#paper" aria-label="AgentBait paper home">
          <span>AgentBait</span>
          <small>Research feature</small>
        </a>
        <nav aria-label="Reading navigation">
          <a href="#paper">Paper</a>
          <a href="#results">Results</a>
          <a href="#methods">Methods</a>
          <a href="#examples">Examples</a>
          <a href={codeUrl} target="_blank" rel="noreferrer">Code</a>
        </nav>
      </header>

      <article>
        <header className="article-header">
          <p className="rubric">Agent-mediated information access <span>Research article · July 2026</span></p>
          <h1>You Won&apos;t Believe This Click</h1>
          <p className="subtitle">Content Rewriting for Agentic Choice</p>
          <p className="standfirst">
            When a language model chooses from a fixed list, changing how one item is written can
            change what it selects. This study isolates that presentation effect—and the factual
            compromises that appear when selection becomes the objective.
          </p>
          <div className="byline">
            <p><strong>Tianyi Jin</strong>, <strong>Zirui Wang</strong> and <strong>David M. Chan</strong></p>
            <p>University of California, Berkeley</p>
          </div>
          <p className="header-note">
            Reading note <span>This feature reports target selection as a behavioral outcome, not as a measure of human preference, article quality or truth.</span>
          </p>
        </header>

        <section className="story-section question" id="question" aria-labelledby="question-title">
          <div className="section-label">01 · Research question</div>
          <div className="story-grid">
            <div className="prose">
              <h2 id="question-title">Does a better presentation become a different decision?</h2>
              <p className="lead">
                Recommendation is usually studied as a ranking problem. Here, ranking has already
                happened. The candidate identities, order and chooser prompt remain fixed. Only one
                target item&apos;s title and abstract may change.
              </p>
              <p>
                That narrow intervention asks a consequential question: if an agent is the final
                reader, which editorial strategies make an item more likely to survive the last step
                of selection? AgentBait separates the strategy from the prose. A trainable advisor
                proposes how to rewrite; a frozen model performs the edit; a target agent chooses one
                item from the unchanged slate.
              </p>
            </div>
            <aside className="margin-note">
              <span>Scope</span>
              <p>Evidence here is conditional on exposure. It does not measure upstream retrieval or ranking.</p>
            </aside>
          </div>
          <blockquote>
            <p>Same candidates. Same order. Same chooser. A different rendering of one item.</p>
          </blockquote>
        </section>

        <section className="story-section setting" id="setting" aria-labelledby="setting-title">
          <div className="section-label">02 · Experimental setting</div>
          <div className="story-grid">
            <div className="prose">
              <h2 id="setting-title">A controlled intervention after retrieval</h2>
              <p>
                The primary experiment uses held-out MIND news impressions. Each row is a fixed
                candidate list with one treated target. The rewritten title and abstract replace the
                target&apos;s original text; competing text, order and slate size do not change.
              </p>
            </div>
            <aside className="margin-note numbered-note">
              <span>Protocol</span>
              <p><b>8,000</b> training impressions</p>
              <p><b>1,000</b> unseen test impressions</p>
              <p><b>≤15</b> candidates per MIND slate</p>
            </aside>
          </div>

          <figure className="slate-figure" aria-labelledby="slate-caption">
            <div className="slate-flow">
              <div className="slate-column source-column">
                <span className="flow-label">Fixed candidate slate</span>
                <div className="slate-row"><b>A</b><span>Competitor title + abstract</span><em>unchanged</em></div>
                <div className="slate-row target-row"><b>B</b><span>Target title + abstract</span><em>treated</em></div>
                <div className="slate-row"><b>C</b><span>Competitor title + abstract</span><em>unchanged</em></div>
              </div>
              <div className="flow-step">
                <span>Advisor</span>
                <p>proposes an editorial strategy</p>
              </div>
              <div className="flow-step">
                <span>Frozen rewriter</span>
                <p>revises target B only</p>
              </div>
              <div className="flow-step outcome-step">
                <span>Target agent</span>
                <p>selects one item from A–C</p>
              </div>
            </div>
            <figcaption id="slate-caption">
              <b>Figure 1 | Fixed-slate intervention.</b> Candidate identity, order, list size,
              non-target text and the chooser prompt are paired across original and rewritten conditions.
              The binary training reward records whether the designated target is selected.
            </figcaption>
          </figure>
        </section>

        <section className="story-section case-study" id="examples" aria-labelledby="example-title">
          <div className="section-label">03 · Representative case</div>
          <div className="story-grid">
            <div className="prose">
              <h2 id="example-title">One airport story, two ways to win selection</h2>
              <p>
                Both learned rewrites make the target selectable. They do not preserve the source
                equally. The unconstrained version introduces an AI scheduling system absent from the
                original. The factuality-constrained version keeps the reported punctuality and
                reframes it as an operational question.
              </p>
            </div>
            <aside className="margin-note">
              <span>How to read</span>
              <p>MiniCheck scores source support. Higher is more supported; selection is reported separately.</p>
            </aside>
          </div>

          <figure className="example-figure" aria-labelledby="example-caption">
            <div className="example-columns">
              <article>
                <header><span>Source</span><b>Original target</b></header>
                <h3>Why Tokyo&apos;s Haneda is one of the world&apos;s most punctual airports</h3>
                <p>
                  Haneda is the world&apos;s fifth busiest airport. In 2018, 85.6% of flights were on time,
                  making it the most punctual mega airport in the world.
                </p>
                <dl><div><dt>Target selected</dt><dd>No</dd></div></dl>
              </article>
              <article className="unsupported">
                <header><span>Unconstrained</span><b>Trained advisor</b></header>
                <h3>AI-Driven Runway Scheduling: How Sensor Fusion and ML Boosted Haneda&apos;s 85.6% On-Time Rate</h3>
                <p>
                  The rewrite attributes the result to proprietary predictive maintenance, sensor
                  fusion, delay forecasting and reinforcement-learning runway scheduling.
                </p>
                <dl>
                  <div><dt>Target selected</dt><dd>Yes</dd></div>
                  <div><dt>MiniCheck mean</dt><dd>0.014</dd></div>
                  <div><dt>Sentence minimum</dt><dd>0.006</dd></div>
                </dl>
                <p className="editorial-mark">Unsupported mechanism added</p>
              </article>
              <article className="supported">
                <header><span>Constrained</span><b>Advisor + MiniCheck</b></header>
                <h3>How Tokyo&apos;s Haneda Beats the Odds: Inside the Operations That Deliver 85.6% On-Time Flights</h3>
                <p>
                  The rewrite asks which management choices, scheduling practices, ground operations
                  and airport–airline coordination explain the result.
                </p>
                <dl>
                  <div><dt>Target selected</dt><dd>Yes</dd></div>
                  <div><dt>MiniCheck mean</dt><dd>0.623</dd></div>
                  <div><dt>Sentence minimum</dt><dd>0.051</dd></div>
                </dl>
              </article>
            </div>
            <figcaption id="example-caption">
              <b>Figure 2 | Haneda qualitative comparison.</b> The list is fixed and only the target
              text changes. Abstracts are lightly abbreviated here for reading. Model: GPT-5-mini
              target agent; metric: target selection and MiniCheck sentence support; example n=1.
            </figcaption>
          </figure>
        </section>

        <section className="story-section results" id="results" aria-labelledby="results-title">
          <div className="section-label">04 · Main results</div>
          <div className="story-grid">
            <div className="prose">
              <h2 id="results-title">The effect is large, but not uniform</h2>
              <p className="lead">
                On GPT-5-mini, target selection rises from 17.1% with original text to 98.5% with
                the RL-trained advisor. Across held-out agents, the same advisor ranges from 65.0%
                to 98.9%. Adding MiniCheck lowers selection on every model while retaining an
                improvement over original text.
              </p>
            </div>
            <aside className="margin-note">
              <span>Reference</span>
              <p>The row-wise random-choice baseline is 16.9%. It is a chance reference, not the experimental control.</p>
            </aside>
          </div>

          <figure className="evidence-figure" aria-labelledby="main-results-caption">
            <div className="figure-heading">
              <div>
                <p className="figure-number">Table 1</p>
                <h3>Target selection under original and rewritten presentations</h3>
              </div>
              <p className="metric-definition"><b>Metric</b> Target selected from fixed slate (%) ↑</p>
            </div>
            <MetaLine items={[
              { label: "Dataset", value: "MIND · English" },
              { label: "Sample", value: "1,000 unseen impressions" },
              { label: "Policy", value: "Qwen3.5-9B" },
              { label: "Rewriter", value: "GPT-5-mini (frozen in advisor setting)" },
              { label: "Baseline", value: "Original text; chance = 16.9%" },
            ]} />
            <div className="table-scroll">
              <table className="results-table">
                <thead>
                  <tr>
                    <th scope="col">Training condition</th>
                    <th scope="col">Method</th>
                    <th scope="col">GPT-5-mini<small>train target</small></th>
                    <th scope="col">GPT-5.5<small>held out</small></th>
                    <th scope="col">Gemini 3 Flash<small>held out</small></th>
                    <th scope="col">Gemini 3.1 Pro<small>held out</small></th>
                    <th scope="col">Sonnet 4.6<small>held out</small></th>
                    <th scope="col">Opus 4.8<small>held out</small></th>
                  </tr>
                </thead>
                <tbody>
                  {mainResults.map((row, rowIndex) => (
                    <tr key={`${row.group}-${row.method}`} className={row.method.includes("MiniCheck") ? "constrained-row" : ""}>
                      <th scope="row">{row.group}</th>
                      <td>{row.method}</td>
                      {row.values.map((value, index) => (
                        <td key={index} style={{ "--score": `${value}%` } as React.CSSProperties}>
                          <span>{value.toFixed(1)}</span>
                          {rowIndex > 0 && <small>{value - mainResults[0].values[index] >= 0 ? "+" : ""}{(value - mainResults[0].values[index]).toFixed(1)}</small>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <figcaption id="main-results-caption">
              <b>Table 1 | Target selection rates on held-out English news impressions.</b> Values
              are percentages. Small values show the absolute change in percentage points from the
              original-text condition for the same evaluator. Target documents do not appear in
              training. Transfer columns require no additional training. MiniCheck rows add a
              sentence-level source-support reward.
            </figcaption>
          </figure>

          <div className="result-reading">
            <p className="result-index">Reading the table</p>
            <div>
              <h3>Three findings are visible only when the full comparison stays in view.</h3>
              <ol>
                <li><b>Prompting already matters.</b> Without RL, advisor-guided rewriting moves GPT-5-mini from 17.1% to 43.9%.</li>
                <li><b>Transfer varies.</b> The trained advisor reaches 98.9% on Gemini 3 Flash but 65.0% on Sonnet 4.6.</li>
                <li><b>Support changes the objective.</b> The MiniCheck-constrained advisor records 68.6% on GPT-5-mini, below 98.5% but above the 17.1% original.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="story-section transfer" aria-labelledby="transfer-title">
          <div className="section-label">05 · Boundaries and failures</div>
          <div className="story-grid">
            <div className="prose">
              <h2 id="transfer-title">A strategy can transfer—and still be model-specific</h2>
              <p>
                Matched fixed-step training exposes a train–evaluation mismatch. GPT-5-mini and
                Gemini 3 Flash produce strongly transferable pressures. Haiku 4.5 is less aligned:
                the GPT-trained advisor reaches 62.2% on Haiku, while the Gemini-trained advisor
                reaches 31.1%.
              </p>
            </div>
            <aside className="margin-note">
              <span>Interpretation</span>
              <p>This is not a model leaderboard. Training steps, not target-specific convergence, are matched.</p>
            </aside>
          </div>

          <figure className="evidence-figure compact-figure" aria-labelledby="transfer-caption">
            <div className="figure-heading">
              <div><p className="figure-number">Table 2</p><h3>Cross-target-agent mismatch</h3></div>
              <p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p>
            </div>
            <MetaLine items={[
              { label: "Dataset", value: "MIND · English · held out" },
              { label: "Sample", value: "1,000 fixed-slate impressions" },
              { label: "Protocol", value: "Same data, policy, rewriter and training steps" },
              { label: "Baseline", value: "Original text by evaluation agent" },
            ]} />
            <div className="table-scroll">
              <table className="matrix-table">
                <thead><tr><th scope="col">Training signal</th><th scope="col">Eval: GPT-5-mini</th><th scope="col">Eval: Gemini 3 Flash</th><th scope="col">Eval: Haiku 4.5</th></tr></thead>
                <tbody>
                  {transferResults.map((row) => (
                    <tr key={row.method} className={row.kind === "trained" ? "trained-row" : ""}>
                      <th scope="row">{row.method}</th>
                      {row.values.map((value, index) => (
                        <td key={index} style={{ "--score": `${value}%` } as React.CSSProperties}>
                          <span>{value.toFixed(1)}</span>
                          {row.method !== "Original text" && <small>+{(value - transferResults[0].values[index]).toFixed(1)}</small>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <figcaption id="transfer-caption">
              <b>Table 2 | Matched fixed-step cross-target-agent selection rates.</b> Rows name the
              target agent used for the training reward; columns name the held-out evaluator. Small
              values are percentage-point gains over that evaluator&apos;s original text. Different
              reward models may have different sample efficiency and optimization difficulty.
            </figcaption>
          </figure>

          <figure className="evidence-figure tradeoff-figure" aria-labelledby="tradeoff-caption">
            <div className="figure-heading">
              <div><p className="figure-number">Figure 3</p><h3>Selection and source support move on different axes</h3></div>
              <p className="metric-definition"><b>Metrics</b> Selection (%) and MiniCheck support (0–100) ↑</p>
            </div>
            <MetaLine items={[
              { label: "Dataset", value: "MIND · English" },
              { label: "Sample", value: "1,000 unseen impressions" },
              { label: "Chooser", value: "GPT-5-mini" },
              { label: "Support model", value: "MiniCheck-Flan factuality check" },
              { label: "Baseline", value: "Original selection = 17.1%" },
            ]} />
            <div className="paired-chart" role="img" aria-label="Paired bar chart comparing target selection and MiniCheck source support for six rewriting conditions. RL advisor has 98.5 percent selection and 2.0 support; adding MiniCheck has 68.6 percent selection and 31.2 support.">
              <div className="chart-legend"><span className="selection-key">Selection</span><span className="support-key">Source support</span></div>
              <div className="axis-labels"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
              {supportResults.map((row) => (
                <div className={`paired-row ${row.constrained ? "is-constrained" : ""}`} key={row.method}>
                  <div className="paired-name">{row.method}</div>
                  <div className="paired-bars">
                    <div className="bar-track"><i className="selection-bar" style={{ width: `${row.selection}%` }} /><b style={{ left: `${row.selection}%` }}>{row.selection.toFixed(1)}</b></div>
                    <div className="bar-track"><i className="support-bar" style={{ width: `${row.support}%` }} /><b style={{ left: `${row.support}%` }}>{row.support.toFixed(1)}</b></div>
                  </div>
                </div>
              ))}
            </div>
            <figcaption id="tradeoff-caption">
              <b>Figure 3 | Factuality tradeoff on MIND-English.</b> Selection and support use a
              shared 0–100 scale but remain distinct metrics. Unconstrained RL yields the highest
              selection and the lowest support in both advisor and rewriter settings. Adding the
              MiniCheck reward recovers support while reducing selection. Support values are
              post-hoc mean sentence-support scores reported in the paper.
            </figcaption>
          </figure>

          <div className="diagnostic-note">
            <p className="diagnostic-label">Boundary diagnostic · scientific search</p>
            <div>
              <h3>Query context changes the size of the effect.</h3>
              <p>
                In a held-out SciRepEval boundary check, comparable query-aware conditions move from
                14.1% to 16.6% with prompting, 14.6% to 16.5% for a step-100 MiniCheck run, and
                14.1% to 18.2% for a step-100 no-auxiliary run. A separate no-query chooser moves
                from 10.8% to 30.5%, but that row is not directly comparable because the chooser did
                not receive the query.
              </p>
              <p className="diagnostic-source">
                Metric: target selection; dataset: held-out SciRepEval candidate lists; n=1,000;
                comparison baseline: original target under the same chooser context. This diagnostic
                is reported as boundary evidence, not folded into the main MIND result.
              </p>
            </div>
          </div>

          <div className="limitations">
            <h3>What the experiment does not establish</h3>
            <ol>
              <li><span>Exposure is fixed.</span><p>The study isolates text after retrieval. It does not test whether a rewritten item would still be retrieved or ranked into the same slate under the original query or recommendation context.</p></li>
              <li><span>The interface is held out of scope.</span><p>Ranking position, layout, thumbnails, metadata and other presentation channels do not change. Their interactions with rewriting remain unmeasured.</p></li>
              <li><span>Selection is not usefulness.</span><p>A target-agent choice does not establish human utility, editorial quality or factual correctness. MiniCheck is one automated support measure, not a substitute for all three.</p></li>
              <li><span>The world is static.</span><p>Each impression is a snapshot. The experiment does not model user drift, new articles, changing competitor pools or feedback loops created by repeated deployment.</p></li>
            </ol>
          </div>
        </section>

        <section className="story-section methods" id="methods" aria-labelledby="methods-title">
          <div className="section-label">06 · Method</div>
          <div className="story-grid">
            <div className="prose">
              <h2 id="methods-title">The advisor learns strategy; the rewriter supplies prose</h2>
              <p>
                The Qwen3.5-9B advisor samples high-level editing strategies. GPT-5-mini, held frozen
                in the advisor setting, turns each strategy into a revised title and abstract. The
                target agent reads the reconstructed fixed slate and selects exactly one candidate.
              </p>
              <p>
                Group-Relative Policy Optimization reinforces strategies that outperform other
                samples for the same impression. The unconstrained objective is binary target
                selection. The factuality-constrained variant adds the minimum sentence-level
                MiniCheck score so that one unsupported sentence can reduce the support reward.
              </p>
            </div>
            <aside className="margin-note">
              <span>Strategy audit</span>
              <p>Unconstrained GPT-5-mini training produces an unfaithful technical pivot in 96.2% of audited outputs; with MiniCheck, 0.1%.</p>
            </aside>
          </div>
          <figure className="method-figure" aria-labelledby="method-caption">
            {/* The manuscript figure is already exported at publication resolution; keep the source pixels unchanged. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/agentbait-method.png" alt="AgentBait pipeline showing a trainable advisor, frozen rewriter, fixed candidate list and target-agent selection reward." />
            <figcaption id="method-caption">
              <b>Figure 4 | Advisor–rewriter training loop.</b> Dataset: MIND; training n=8,000
              impressions; policy: Qwen3.5-9B; frozen rewriter and default target agent: GPT-5-mini;
              optimization: GRPO with binary selection reward, optionally augmented by MiniCheck support.
            </figcaption>
          </figure>
        </section>

        <section className="story-section resources" id="resources" aria-labelledby="resources-title">
          <div className="section-label">07 · Paper resources</div>
          <div className="resource-grid">
            <div>
              <h2 id="resources-title">Read, inspect and reproduce</h2>
              <p>
                The paper contains full experimental details, language and dataset transfer, strategy
                taxonomies, verifier diagnostics and data-release notes.
              </p>
            </div>
            <div className="resource-links">
              <a href="/paper.pdf"><span>Paper</span><b>PDF · full manuscript</b><em>↗</em></a>
              <a href="#results"><span>Results</span><b>Main evidence tables</b><em>↑</em></a>
              <a href="#methods"><span>Methods</span><b>Protocol and training loop</b><em>↑</em></a>
              <a href="#examples"><span>Examples</span><b>Qualitative comparison</b><em>↑</em></a>
              <a href={codeUrl} target="_blank" rel="noreferrer"><span>Code</span><b>Repository</b><em>↗</em></a>
            </div>
          </div>
          <details className="citation">
            <summary>Citation <span>Show BibTeX</span></summary>
            <pre>{`@article{jin2026agentbait,
  title   = {You Won't Believe This Click: Content Rewriting for Agentic Choice},
  author  = {Jin, Tianyi and Wang, Zirui and Chan, David M.},
  year    = {2026}
}`}</pre>
          </details>
        </section>
      </article>

      <footer>
        <p><b>AgentBait</b> · UC Berkeley · 2026</p>
        <p>This page is an editorial reading companion to the paper. Claims and numbers should be read with their stated experimental conditions.</p>
        <a href="#paper">Back to top ↑</a>
      </footer>
    </main>
  );
}
