"use client";

import { useEffect, useRef, useState } from "react";

const codeUrl = "https://github.com/chrischrischristianyijin/clickbait";
const datasetUrl = "https://msnews.github.io/";

const candidates = [
  { id: 1, category: "Politics", age: "38m", title: "Senate budget talks enter their final week" },
  { id: 2, category: "Technology", age: "1h", title: "New chip design cuts data-center energy use" },
  { id: 3, category: "Health", age: "2h", title: "Researchers map a pathway for immune response" },
  { id: 4, category: "Business", age: "2h", title: "Airlines revise summer capacity forecasts" },
  { id: 5, category: "Culture", age: "3h", title: "Museum reopens its modern photography archive" },
  { id: 6, category: "World", age: "4h", title: "Coastal cities prepare for higher seasonal tides" },
  { id: 7, category: "Science", age: "5h", title: "Ocean temperature records prompt new analysis" },
  { id: 8, category: "Travel", age: "6h", title: "Why Tokyo's Haneda is one of the world's most punctual airports", target: true },
];

const demoCandidates = candidates.filter(({ id }) => [1, 3, 6, 8].includes(id));

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

const robustnessResults = [
  { setting: "Language", label: "English", advisor: 98.5, constrained: 68.6 },
  { setting: "Language", label: "Arabic", advisor: 95.5, constrained: 64.5 },
  { setting: "Language", label: "Spanish", advisor: 98.0, constrained: 66.5 },
  { setting: "Language", label: "Swahili", advisor: 93.7, constrained: 62.2 },
  { setting: "Language", label: "Turkish", advisor: 95.8, constrained: 59.9 },
  { setting: "Language", label: "Chinese", advisor: 96.6, constrained: 67.4 },
  { setting: "Dataset", label: "MIND-Danish", advisor: 97.9, constrained: 65.0 },
  { setting: "Dataset", label: "EB-NeRD English", advisor: 98.1, constrained: 81.2 },
  { setting: "Dataset", label: "EB-NeRD Danish", advisor: 98.2, constrained: 71.7 },
];

const supportResults = [
  { method: "Prompt / rewriter", selection: 34.8, support: 60.7, constrained: false },
  { method: "Prompt / advisor", selection: 43.9, support: 42.2, constrained: false },
  { method: "RL / rewriter", selection: 95.9, support: 2.2, constrained: false },
  { method: "RL / rewriter + MC", selection: 43.4, support: 66.7, constrained: true },
  { method: "RL / advisor", selection: 98.5, support: 2.0, constrained: false },
  { method: "RL / advisor + MC", selection: 68.6, support: 31.2, constrained: true },
];

const bibtex = `@article{jin2026agentbait,
  title   = {You Won't Believe This Click: Content Rewriting for Agentic Choice},
  author  = {Jin, Tianyi and Wang, Zirui and Chan, David M.},
  year    = {2026}
}`;

type AttackStage = "idle" | "advisor" | "rewriter" | "chooser" | "complete" | "constrained";

function MetaLine({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="figure-meta">
      {items.map((item) => (
        <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
      ))}
    </dl>
  );
}

type SlateVariant = "without-minicheck" | "with-minicheck";

function NewsSlate({ variant, stage }: { variant: SlateVariant; stage: AttackStage }) {
  const selectedId = variant === "without-minicheck" && ["complete", "constrained"].includes(stage)
    ? 8
    : variant === "with-minicheck" && stage === "constrained"
      ? 8
      : 3;
  const rewriteVisible = ["rewriter", "chooser", "complete", "constrained"].includes(stage);
  return (
    <ol className="news-slate" aria-label={`${variant} candidate slate after target rewriting`}>
      {demoCandidates.map((item) => {
        const selected = item.id === selectedId;
        return (
          <li key={item.id} className={`${item.target ? "is-target" : ""} ${selected ? "is-selected" : ""}`}>
            <span className="rank">{String(item.id).padStart(2, "0")}</span>
            <span className="news-copy">
              <small>{item.category} · {item.age}</small>
              <b>
                {item.target && variant === "with-minicheck" && stage === "constrained" ? (
                  <>
                    <mark className="grounded-injection">How Tokyo&apos;s Haneda Beats the Odds:</mark> Inside the Operations That Deliver 85.6% On-Time Flights
                  </>
                ) : item.target && rewriteVisible ? (
                  <>
                    <mark>AI-Driven</mark> Runway Scheduling: How <mark>Sensor Fusion and ML</mark> Boosted Haneda&apos;s 85.6% On-Time Rate
                  </>
                ) : item.title}
              </b>
            </span>
            <span className="selection-state">{selected ? "Selected" : item.target ? "Target" : ""}</span>
          </li>
        );
      })}
      <li className="slate-omission" aria-label="Four of eight candidates are shown; omitted candidates remain fixed">
        <span>4 of 8 candidates shown · order unchanged</span>
      </li>
    </ol>
  );
}

export default function Home() {
  const [stage, setStage] = useState<AttackStage>("idle");
  const [copied, setCopied] = useState(false);
  const demoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = demoRef.current;
    if (!node) return;

    let timers: number[] = [];
    const clearTimers = () => timers.forEach((timer) => window.clearTimeout(timer));
    const schedulePlayback = () => {
      clearTimers();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timers = [window.setTimeout(() => setStage("constrained"), 0)];
        return;
      }
      timers = [
        window.setTimeout(() => setStage("advisor"), 500),
        window.setTimeout(() => setStage("rewriter"), 1200),
        window.setTimeout(() => setStage("chooser"), 1950),
        window.setTimeout(() => setStage("complete"), 2750),
        window.setTimeout(() => setStage("constrained"), 4700),
      ];
    };

    if (typeof IntersectionObserver === "undefined") {
      schedulePlayback();
      return clearTimers;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          schedulePlayback();
        } else {
          clearTimers();
          setStage("idle");
        }
      },
      { threshold: 0.25, rootMargin: "-8% 0px" },
    );
    observer.observe(node);
    return () => {
      clearTimers();
      observer.disconnect();
    };
  }, []);

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main id="paper">
      <header className="site-header">
        <a className="wordmark" href="#paper" aria-label="AgentBait paper home"><span>AgentBait</span><small>Research feature</small></a>
        <nav aria-label="Reading navigation">
          <a href="/paper.pdf">Paper</a>
          <a href="#results">Results</a>
          <a href="#methods">Methods</a>
          <a href="#examples">Examples</a>
          <a href={codeUrl} target="_blank" rel="noreferrer">Code</a>
        </nav>
      </header>

      <article>
        <header className="article-header">
          <p className="rubric">Agent-mediated information access <span>Working paper · July 2026</span></p>
          <h1>You Won&apos;t Believe This Click</h1>
          <p className="subtitle">Content Rewriting for Agentic Choice</p>
          <p className="standfirst">Small textual rewrites can systematically manipulate LLM-based recommendation agents.</p>
          <div className="paper-identity">
            <div className="byline">
              <p><strong>Tianyi Jin</strong>, <strong>Zirui Wang</strong> and <strong>David M. Chan</strong></p>
              <p>University of California, Berkeley</p>
            </div>
            <div className="paper-links" aria-label="Paper resources">
              <a href="/paper.pdf">Paper ↗</a>
              <a href={codeUrl} target="_blank" rel="noreferrer">Code ↗</a>
              <a href={datasetUrl} target="_blank" rel="noreferrer">Dataset ↗</a>
              <a href="#demo">Demo ↓</a>
            </div>
          </div>
        </header>

        <section ref={demoRef} className={`attack-demo stage-${stage}`} id="demo" aria-labelledby="demo-title">
          <div className="demo-heading">
            <div>
              <p className="section-label-inline">Interactive Figure 1</p>
              <h2 id="demo-title">The cards do not move. The chooser does.</h2>
            </div>
            <div className="demo-action autoplay-indicator" aria-label={`Automatic demonstration status: ${stage}`}>
              <span><i className="autoplay-dot" aria-hidden="true" /> Auto play</span>
              <p>MIND-style fixed slate · GPT-5-mini chooser</p>
            </div>
          </div>

          <div className="attack-stage" aria-label="Automatically animated AgentBait fixed-slate comparison">
            <section className="baseline-strip" aria-labelledby="baseline-title">
              <header><span>Original baseline</span><b id="baseline-title">Target unselected</b></header>
              <p className="baseline-title"><span>08</span><b>Why Tokyo&apos;s Haneda is one of the world&apos;s most punctual airports</b></p>
              <dl>
                <div><dt>Selection</dt><dd>17.1%</dd></div>
                <div><dt>Order</dt><dd>Fixed</dd></div>
              </dl>
            </section>

            <section className="attack-pipeline" aria-label="Attack process">
              <p className="pipeline-heading">Attack process</p>
              <ol>
                <li className={stage !== "idle" ? "active" : ""}><span>01</span><div><b>Advisor</b><small>technical-topic pivot</small></div></li>
                <li className={["rewriter", "chooser", "complete", "constrained"].includes(stage) ? "active" : ""}><span>02</span><div><b>Frozen rewriter</b><small>injects authority cues</small></div></li>
                <li className={["chooser", "complete", "constrained"].includes(stage) ? "active" : ""}><span>03</span><div><b>Chooser agent</b><small>selects one candidate</small></div></li>
                <li className={["complete", "constrained"].includes(stage) ? "active" : ""}><span>04</span><div><b>Selection reward</b><small>98.5 selection · support 2.0</small></div></li>
                <li className={stage === "constrained" ? "active factuality" : ""}><span>05</span><div><b>MiniCheck</b><small>grounded rewrite · support 31.2</small></div></li>
              </ol>
              <p className="fixed-order-note">Slot 08 stays slot 08</p>
            </section>

            <div className="result-windows" aria-label="Rewriting outcomes with and without MiniCheck">
              <section className="slate-panel result-window without-minicheck" aria-labelledby="without-minicheck-title">
                <header><span>Without MiniCheck</span><b id="without-minicheck-title">{["complete", "constrained"].includes(stage) ? "Target selected" : "Selection optimized"}</b></header>
                <NewsSlate variant="without-minicheck" stage={stage} />
                <dl className="demo-metrics">
                  <div><dt>Reported selection rate</dt><dd>{["complete", "constrained"].includes(stage) ? "98.5%" : "—"}</dd></div>
                  <div className="support-metric"><dt>MiniCheck support</dt><dd>{["complete", "constrained"].includes(stage) ? "2.0 / 100" : "—"}</dd></div>
                </dl>
              </section>

              <section className="slate-panel result-window with-minicheck" aria-labelledby="with-minicheck-title">
                <header><span>With MiniCheck</span><b id="with-minicheck-title">{stage === "constrained" ? "Target also selected" : "Grounded constraint"}</b></header>
                <NewsSlate variant="with-minicheck" stage={stage} />
                <dl className="demo-metrics">
                  <div><dt>Reported selection rate</dt><dd>{stage === "constrained" ? "68.6%" : "—"}</dd></div>
                  <div className="support-metric"><dt>MiniCheck support</dt><dd>{stage === "constrained" ? "31.2 / 100" : "—"}</dd></div>
                </dl>
              </section>
            </div>
          </div>
          <p className="demo-status">
            {stage === "idle" && "Ready · one title and abstract may change; every competing candidate stays fixed."}
            {stage === "advisor" && "Advisor is proposing a strategy: force a technical topic into the target."}
            {stage === "rewriter" && "Rewriter is adding technical authority cues unsupported by the source."}
            {stage === "chooser" && "Chooser is reading the same eight candidates in the same order."}
            {stage === "complete" && "Selection flips to the target while source support falls. Aggregate rates shown: MIND-En, n=1,000, Table 1."}
            {stage === "constrained" && "Both chooser runs select the target. MiniCheck changes the rewrite and raises source support from 2.0 to 31.2 while retaining a 68.6% selection rate."}
          </p>
          <p className="demo-caption"><b>Interactive Figure 1 | Didactic replay of the paper&apos;s fixed-slate intervention.</b> The two right-hand windows compare the endpoints directly: the target is selected both without and with MiniCheck, while the support score and rewrite strategy differ. Haneda rewrites and aggregate MIND-En metrics are paper-reported; the eight-item interface is an explanatory reconstruction.</p>
        </section>

        <section className="story-section question" id="question" aria-labelledby="question-title">
          <div className="section-label">01 · Research question</div>
          <div className="story-grid">
            <div className="prose">
              <h2 id="question-title">Does a better presentation become a different decision?</h2>
              <p className="lead">Recommendation is usually studied as a ranking problem. Here, ranking has already happened. Candidate identities, order and chooser prompt remain fixed. Only one target item&apos;s title and abstract may change.</p>
              <p>AgentBait separates strategy from prose. A trainable advisor proposes how to rewrite; a frozen model performs the edit; a target agent selects one item from the unchanged slate.</p>
            </div>
            <aside className="margin-note"><span>Scope</span><p>Evidence is conditional on exposure. It does not measure upstream retrieval or ranking.</p></aside>
          </div>
          <blockquote><p>Same candidates. Same order. Same chooser. A different rendering of one item.</p></blockquote>
        </section>

        <section className="story-section setting" id="setting" aria-labelledby="setting-title">
          <div className="section-label">02 · Experimental setting</div>
          <div className="story-grid">
            <div className="prose">
              <h2 id="setting-title">A controlled intervention after retrieval</h2>
              <p>The primary experiment uses held-out MIND news impressions. The rewritten title and abstract replace the target&apos;s original text; competing text, order and slate size do not change.</p>
            </div>
            <aside className="margin-note numbered-note"><span>Protocol</span><p><b>8,000</b> training impressions</p><p><b>1,000</b> unseen test impressions</p><p><b>≤15</b> candidates per MIND slate</p></aside>
          </div>
          <figure className="slate-figure" aria-labelledby="slate-caption">
            <div className="slate-flow">
              <div className="slate-column"><span className="flow-label">Candidate pool</span><div className="slate-row"><b>A</b><span>Competitor text</span><em>fixed</em></div><div className="slate-row target-row"><b>B</b><span>Target title + abstract</span><em>treated</em></div><div className="slate-row"><b>C</b><span>Competitor text</span><em>fixed</em></div></div>
              <div className="flow-step"><span>Advisor</span><p>proposes an editorial strategy</p></div>
              <div className="flow-step"><span>Frozen rewriter</span><p>revises target B only</p></div>
              <div className="flow-step"><span>Chooser agent</span><p>selects one item</p></div>
              <div className="flow-step reward-step"><span>Reward / constraint</span><p>selection + source support</p></div>
            </div>
            <figcaption id="slate-caption"><b>Figure 2 | AgentBait system.</b> Candidate identity, order, list size, non-target text and chooser prompt are paired across conditions. Policy: Qwen3.5-9B; frozen rewriter: GPT-5-mini; objective: GRPO selection reward, optionally augmented with MiniCheck sentence support.</figcaption>
          </figure>
        </section>

        <section className="story-section case-study" id="examples" aria-labelledby="example-title">
          <div className="section-label">03 · Examples as editorial redlines</div>
          <div className="story-grid">
            <div className="prose"><h2 id="example-title">One airport story, two ways to win selection</h2><p>Both learned rewrites make the target selectable. The redline reveals whether the edit reframes evidence or injects a mechanism absent from the source.</p></div>
            <aside className="margin-note"><span>How to read</span><p><del>Struck text</del> is displaced source framing. <mark>Red text</mark> is introduced by the rewrite.</p></aside>
          </div>
          <figure className="example-figure" aria-labelledby="example-caption">
            <div className="example-source"><span>Original target</span><p>Why Tokyo&apos;s Haneda is one of the world&apos;s most punctual airports</p><small>Haneda is the world&apos;s fifth busiest airport. In 2018, 85.6% of flights were on time.</small></div>
            <div className="redline-columns">
              <article className="unsupported">
                <header><span>Attack strategy 01</span><b>Technical authority · novelty</b></header>
                <p className="deleted-title"><del>Why Tokyo&apos;s Haneda is one of the world&apos;s most punctual airports</del></p>
                <h3><mark>AI-Driven</mark> Runway Scheduling: How <mark>Sensor Fusion and ML</mark> Boosted Haneda&apos;s 85.6% On-Time Rate</h3>
                <p>The rewrite attributes the result to proprietary predictive maintenance, sensor fusion, delay forecasting and reinforcement-learning scheduling.</p>
                <dl><div><dt>Target selected</dt><dd>Yes</dd></div><div><dt>MiniCheck mean</dt><dd>0.014</dd></div><div><dt>Sentence minimum</dt><dd>0.006</dd></div></dl>
                <p className="editorial-mark">Unsupported mechanism added</p>
              </article>
              <article className="supported">
                <header><span>Attack strategy 02</span><b>Operational puzzle · stakes</b></header>
                <p className="deleted-title"><del>Why Tokyo&apos;s Haneda is one of the world&apos;s most punctual airports</del></p>
                <h3><mark>How Tokyo&apos;s Haneda Beats the Odds:</mark> Inside the Operations That Deliver 85.6% On-Time Flights</h3>
                <p>The rewrite asks which management choices, scheduling practices, ground operations and airport–airline coordination explain the result.</p>
                <dl><div><dt>Target selected</dt><dd>Yes</dd></div><div><dt>MiniCheck mean</dt><dd>0.623</dd></div><div><dt>Sentence minimum</dt><dd>0.051</dd></div></dl>
                <p className="editorial-mark grounded-mark">Factual core preserved</p>
              </article>
            </div>
            <figcaption id="example-caption"><b>Figure 3 | Haneda qualitative comparison.</b> The list is fixed and only the target text changes. Model: GPT-5-mini target agent; metrics: target selection and MiniCheck support; example n=1.</figcaption>
          </figure>
        </section>

        <section className="story-section results" id="results" aria-labelledby="results-title">
          <div className="section-label">04 · Key findings</div>
          <div className="story-grid">
            <div className="prose"><h2 id="results-title">A strong selection effect—and a separate support problem</h2><p className="lead">The largest number is only interpretable beside its baseline, evaluator, dataset and factuality condition.</p></div>
            <aside className="margin-note"><span>Reference</span><p>Row-wise random choice is 16.9%. The experimental control is original text under the same target agent.</p></aside>
          </div>

          <div className="finding-spread">
            <figure aria-labelledby="finding-one">
              <header><span>Finding 1</span><h3 id="finding-one">Rewriting changes selection</h3></header>
              <div className="finding-bars" role="img" aria-label="Selection rates: original 17.1, prompting advisor 43.9, constrained advisor 68.6, RL advisor 98.5 percent.">
                {[{label:"Original",value:17.1},{label:"Prompt advisor",value:43.9},{label:"RL advisor + MC",value:68.6},{label:"RL advisor",value:98.5}].map((item) => <div key={item.label}><span>{item.label}</span><i style={{width:`${item.value}%`}} /><b>{item.value}%</b></div>)}
              </div>
              <figcaption><b>Selection rate · MIND-En · GPT-5-mini · n=1,000 · Table 1.</b> The full model comparison appears below.</figcaption>
            </figure>
            <figure aria-labelledby="finding-two">
              <header><span>Finding 2</span><h3 id="finding-two">Selection can outrun support</h3></header>
              <div className="finding-pairs">
                <div><p>RL advisor</p><span><i style={{width:"98.5%"}} />Selection <b>98.5</b></span><span className="support"><i style={{width:"2%"}} />Support <b>2.0</b></span></div>
                <div><p>RL advisor + MiniCheck</p><span><i style={{width:"68.6%"}} />Selection <b>68.6</b></span><span className="support"><i style={{width:"31.2%"}} />Support <b>31.2</b></span></div>
              </div>
              <figcaption><b>Target selection and MiniCheck sentence support · MIND-En · Table 1.</b> Metrics share a 0–100 scale but are not interchangeable.</figcaption>
            </figure>
          </div>

          <details className="full-results" open>
            <summary><span>Full experimental table</span><b>Table 1 · collapse / expand</b></summary>
            <figure className="evidence-figure" aria-labelledby="main-results-caption">
              <div className="figure-heading"><div><p className="figure-number">Table 1</p><h3>Target selection under original and rewritten presentations</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
              <MetaLine items={[{label:"Dataset",value:"MIND · English"},{label:"Sample",value:"1,000 unseen impressions"},{label:"Policy",value:"Qwen3.5-9B"},{label:"Rewriter",value:"GPT-5-mini"},{label:"Baseline",value:"Original; chance = 16.9%"}]} />
              <div className="table-scroll"><table className="results-table"><thead><tr><th>Condition</th><th>Method</th><th>GPT-5-mini<small>train target</small></th><th>GPT-5.5</th><th>Gemini 3 Flash</th><th>Gemini 3.1 Pro</th><th>Sonnet 4.6</th><th>Opus 4.8</th></tr></thead><tbody>
                {mainResults.map((row,rowIndex)=><tr key={`${row.group}-${row.method}`} className={row.method.includes("MiniCheck")?"constrained-row":""}><th>{row.group}</th><td>{row.method}</td>{row.values.map((value,index)=><td key={index} style={{"--score":`${value}%`} as React.CSSProperties}><span>{value.toFixed(1)}</span>{rowIndex>0&&<small>{value-mainResults[0].values[index]>=0?"+":""}{(value-mainResults[0].values[index]).toFixed(1)}</small>}</td>)}</tr>)}
              </tbody></table></div>
              <figcaption id="main-results-caption"><b>Table 1 | Target selection on unseen English news impressions.</b> Small values are percentage-point changes from original text for the same evaluator. Target documents do not appear in training; transfer columns use no additional training.</figcaption>
            </figure>
          </details>
        </section>

        <section className="story-section transfer" aria-labelledby="transfer-title">
          <div className="section-label">05 · Robustness, transfer and failure</div>
          <div className="story-grid"><div className="prose"><h2 id="transfer-title">Transfer is broad, but not uniform</h2><p>Model family, display language, dataset and factuality constraint all change the observed effect. Reporting only 98.5% would hide those differences.</p></div><aside className="margin-note"><span>Interpretation</span><p>Cross-agent rows use matched training steps, not target-specific convergence. They are not a model leaderboard.</p></aside></div>

          <figure className="evidence-figure compact-figure" aria-labelledby="transfer-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 2</p><h3>Cross-target-agent mismatch</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <MetaLine items={[{label:"Dataset",value:"MIND · English"},{label:"Sample",value:"1,000 fixed slates"},{label:"Protocol",value:"Matched data, policy, rewriter, steps"},{label:"Baseline",value:"Original text by evaluator"}]} />
            <div className="table-scroll"><table className="matrix-table"><thead><tr><th>Training signal</th><th>Eval: GPT-5-mini</th><th>Eval: Gemini 3 Flash</th><th>Eval: Haiku 4.5</th></tr></thead><tbody>{transferResults.map(row=><tr key={row.method} className={row.kind==="trained"?"trained-row":""}><th>{row.method}</th>{row.values.map((value,index)=><td key={index} style={{"--score":`${value}%`} as React.CSSProperties}><span>{value.toFixed(1)}</span>{row.method!=="Original text"&&<small>+{(value-transferResults[0].values[index]).toFixed(1)}</small>}</td>)}</tr>)}</tbody></table></div>
            <figcaption id="transfer-caption"><b>Table 2 | Matched fixed-step cross-target-agent selection.</b> Rows name the training reward model; columns name the evaluator. GPT-5-mini and Gemini transfer strongly to one another; Haiku is less aligned.</figcaption>
          </figure>

          <figure className="evidence-figure robustness-figure" aria-labelledby="robustness-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 3</p><h3>Language and dataset transfer</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <MetaLine items={[{label:"Training",value:"English MIND only"},{label:"Sample",value:"1,000 impressions per evaluation"},{label:"Advisor",value:"Qwen3.5-9B"},{label:"Rewriter / chooser",value:"GPT-5-mini"}]} />
            <div className="table-scroll"><table className="robustness-table"><thead><tr><th>Transfer axis</th><th>Evaluation setting</th><th>RL advisor</th><th>RL advisor + MiniCheck</th><th>Constraint cost</th></tr></thead><tbody>{robustnessResults.map(row=><tr key={row.label}><th>{row.setting}</th><td>{row.label}</td><td><b>{row.advisor.toFixed(1)}</b></td><td className="constraint-cell"><b>{row.constrained.toFixed(1)}</b></td><td>{(row.constrained-row.advisor).toFixed(1)} pp</td></tr>)}</tbody></table></div>
            <figcaption id="robustness-caption"><b>Table 3 | Zero-shot language and dataset transfer.</b> Translated MIND variants preserve rows, targets, candidate order and slate structure. EB-NeRD is a distinct Danish news dataset; English is a translated version of the same EB-NeRD slates.</figcaption>
          </figure>

          <figure className="evidence-figure tradeoff-figure" aria-labelledby="tradeoff-caption">
            <div className="figure-heading"><div><p className="figure-number">Figure 4</p><h3>Selection and source support move on different axes</h3></div><p className="metric-definition"><b>Metrics</b> Selection and support (0–100) ↑</p></div>
            <MetaLine items={[{label:"Dataset",value:"MIND · English"},{label:"Sample",value:"1,000 unseen impressions"},{label:"Chooser",value:"GPT-5-mini"},{label:"Support",value:"MiniCheck-Flan"},{label:"Baseline",value:"Original selection = 17.1%"}]} />
            <div className="paired-chart" role="img" aria-label="Paired bars compare selection and MiniCheck source support across six rewriting conditions."><div className="chart-legend"><span className="selection-key">Selection</span><span className="support-key">Source support</span></div><div className="axis-labels"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>{supportResults.map(row=><div className={`paired-row ${row.constrained?"is-constrained":""}`} key={row.method}><div className="paired-name">{row.method}</div><div className="paired-bars"><div className="bar-track"><i className="selection-bar" style={{width:`${row.selection}%`}}/><b style={{left:`${row.selection}%`}}>{row.selection.toFixed(1)}</b></div><div className="bar-track"><i className="support-bar" style={{width:`${row.support}%`}}/><b style={{left:`${row.support}%`}}>{row.support.toFixed(1)}</b></div></div></div>)}</div>
            <figcaption id="tradeoff-caption"><b>Figure 4 | Factuality tradeoff on MIND-English.</b> Unconstrained RL produces the highest selection and lowest source support. MiniCheck recovers support while reducing selection.</figcaption>
          </figure>

          <div className="limitations"><h3>What the experiment does not establish</h3><ol><li><span>Exposure is fixed.</span><p>It does not test whether rewritten text would still be retrieved or ranked into the same slate.</p></li><li><span>Interface effects are excluded.</span><p>Position, layout, thumbnails and metadata do not change in the paper experiment.</p></li><li><span>Selection is not usefulness.</span><p>A chooser decision does not establish human utility, editorial quality or factual correctness.</p></li><li><span>The world is static.</span><p>The experiment does not model user drift, new articles, changing pools or feedback loops.</p></li></ol></div>
        </section>

        <section className="story-section methods" id="methods" aria-labelledby="methods-title">
          <div className="section-label">06 · Methods</div>
          <div className="story-grid"><div className="prose"><h2 id="methods-title">The advisor learns strategy; the rewriter supplies prose</h2><p>The Qwen3.5-9B advisor samples high-level strategies. GPT-5-mini, frozen in the advisor setting, turns each strategy into a revised title and abstract. GRPO reinforces strategies that lead the target agent to select the treated item.</p><p>The factuality-constrained variant adds the minimum sentence-level MiniCheck score, allowing one unsupported sentence to reduce the support reward.</p></div><aside className="margin-note"><span>Strategy audit</span><p>Unconstrained GPT-5-mini training produces an unfaithful technical pivot in 96.2% of audited outputs; with MiniCheck, 0.1%.</p></aside></div>
          <figure className="method-figure" aria-labelledby="method-caption">
            {/* The source is the publication-resolution figure exported with the manuscript. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/agentbait-method.png" alt="AgentBait pipeline showing a trainable advisor, frozen rewriter, fixed candidate list and target-agent selection reward." />
            <figcaption id="method-caption"><b>Figure 5 | Advisor–rewriter training loop.</b> MIND training n=8,000; policy: Qwen3.5-9B; frozen rewriter and default target: GPT-5-mini; optimization: GRPO with binary selection reward, optionally augmented by MiniCheck support.</figcaption>
          </figure>
        </section>

        <section className="story-section resources" id="resources" aria-labelledby="resources-title">
          <div className="section-label">07 · Abstract, resources and citation</div>
          <div className="abstract-grid"><div><p className="figure-number">Abstract</p><h2 id="resources-title">A post-retrieval presentation effect</h2></div><p>Language-model agents increasingly mediate which documents users see. We study whether one item&apos;s short-text presentation can alter an agent&apos;s choice from a fixed candidate list. AgentBait trains an advisor to propose rewriting strategies for a frozen rewriter. Selection gains transfer across target agents, languages and datasets, while unconstrained optimization can reduce source faithfulness. The results isolate a conditional selection effect—not end-to-end retrieval quality or human usefulness.</p></div>
          <div className="resource-links"><a href="/paper.pdf"><span>Paper</span><b>Full manuscript · PDF</b><em>↗</em></a><a href={codeUrl} target="_blank" rel="noreferrer"><span>Code</span><b>Implementation and evaluation</b><em>↗</em></a><a href={datasetUrl} target="_blank" rel="noreferrer"><span>Dataset</span><b>MIND source dataset</b><em>↗</em></a><a href="#demo"><span>Demo</span><b>Replay Interactive Figure 1</b><em>↑</em></a></div>
          <details className="citation" open><summary><span>Citation</span><b>BibTeX</b></summary><div className="citation-body"><pre>{bibtex}</pre><button type="button" onClick={copyCitation}>{copied ? "Copied" : "Copy BibTeX"}</button></div></details>
        </section>
      </article>

      <footer><p><b>AgentBait</b> · UC Berkeley · 2026</p><p>This page is an editorial reading companion. Claims and numbers should be read with their stated experimental conditions.</p><a href="#paper">Back to top ↑</a></footer>
    </main>
  );
}
