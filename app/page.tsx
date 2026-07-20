"use client";

import { useEffect, useRef, useState } from "react";

const codeUrl = "https://github.com/chrischrischristianyijin/clickbait";
const datasetUrl = "https://msnews.github.io/";

const storyboardCandidates = [
  { id: "A", title: "Marshawn playing in charity soccer game went exactly as you'd expect.", target: true },
  { id: "B", title: "Sofia Vergara and Joe Manganiello Celebrate 4-Year Wedding Anniversary: 'Mi Amor!'" },
  { id: "C", title: "The Coolest And Craziest McDonald's Across The Country" },
];

const rewrittenMarshawnTitle = "When Marshawn Lynch Took the Pitch: An Inside Look …";

const mainResults = [
  { group: "Reference", method: "Original text", values: [17.1, 17.1, 17.1, 17.3, 17.6, 17.5] },
  { group: "Prompting only", method: "Rewriter only", values: [34.8, 24.1, 40.7, 20.2, 24.4, 41.0] },
  { group: "Prompting only", method: "Advisor + rewriter", values: [43.9, 39.4, 48.8, 27.0, 34.2, 51.5] },
  { group: "RL-trained rewriter", method: "Rewriter only", values: [95.9, 85.3, 97.4, 54.8, 49.2, 75.9] },
  { group: "RL-trained rewriter", method: "+ MiniCheck", values: [43.4, 26.3, 39.7, 18.6, 24.1, 43.9] },
  { group: "RL-trained advisor", method: "Advisor + rewriter", values: [98.5, 93.3, 98.9, 78.7, 65.0, 94.1] },
  { group: "RL-trained advisor", method: "+ MiniCheck", values: [68.6, 53.2, 65.8, 37.5, 41.0, 68.8] },
];

const languageResults = [
  { label: "English (en)", values: [17.1, 34.8, 43.9, 95.9, 98.5, 43.4, 68.6] },
  { label: "Arabic (ar)", values: [16.1, 28.9, 39.9, 81.0, 95.5, 33.6, 64.5] },
  { label: "Spanish (es)", values: [17.8, 31.2, 42.8, 85.8, 98.0, 35.7, 66.5] },
  { label: "Swahili (sw)", values: [17.6, 23.8, 39.4, 27.8, 93.7, 27.2, 62.2] },
  { label: "Turkish (tr)", values: [17.5, 30.3, 39.2, 86.7, 95.8, 31.1, 59.9] },
  { label: "Chinese (zh-CN)", values: [17.3, 33.2, 43.4, 87.1, 96.6, 36.8, 67.4] },
  { label: "Average", values: [17.3, 29.5, 40.9, 73.7, 95.9, 32.9, 64.1] },
];

const datasetResults = [
  { dataset: "MIND", language: "English", values: [17.1, 34.8, 43.9, 95.9, 98.5, 43.4, 68.6] },
  { dataset: "MIND", language: "Danish", values: [16.5, 31.1, 40.9, 95.0, 97.9, 35.6, 65.0] },
  { dataset: "EB-NeRD", language: "English", values: [12.8, 43.8, 57.7, 93.1, 98.1, 50.2, 81.2] },
  { dataset: "EB-NeRD", language: "Danish", values: [11.6, 32.2, 47.8, 86.1, 98.2, 40.4, 71.7] },
];

const academicResults = [
  { group: "Reference", method: "Without rewriting", selection: 9.9 },
  { group: "Prompting only", method: "Rewriter-only", selection: 33.7 },
  { group: "Prompting only", method: "Advisor-rewriter", selection: 42.7 },
  { group: "RL-trained rewriter", method: "Rewriter-only", selection: 32.7 },
  { group: "RL-trained rewriter", method: "+ MiniCheck", selection: 24.8 },
  { group: "RL-trained advisor", method: "Advisor-rewriter", selection: 63.6 },
  { group: "RL-trained advisor", method: "+ MiniCheck", selection: 47.3 },
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

type AttackStage = "candidate-set" | "scan-a" | "scan-b" | "original-selected" | "focus" | "rewrite-title" | "rewrite-complete" | "return" | "rescan" | "selected" | "final";

function MetaLine({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="figure-meta">
      {items.map((item) => (
        <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
      ))}
    </dl>
  );
}

function CandidateStoryboard({ stage }: { stage: AttackStage }) {
  const rewritten = ["rewrite-complete", "return", "rescan", "selected", "final"].includes(stage);
  const focused = ["focus", "rewrite-title", "rewrite-complete"].includes(stage);
  const inspectedId = stage === "scan-a" ? "A" : stage === "scan-b" ? "C" : stage === "rescan" ? "B" : null;
  const selectedId = stage === "original-selected" ? "B" : ["selected", "final"].includes(stage) ? "A" : null;

  return (
    <div className={`storyboard-board ${focused ? "is-focused" : ""} ${rewritten ? "is-rewritten" : ""}`} role="group" aria-label="Automatically animated AgentBait fixed-slate comparison using the MIND example from Figure 1">
      <section className="candidate-set" aria-labelledby="candidate-set-title">
        <header>
          <div><span>Candidate Set</span><b id="candidate-set-title">Three fixed MIND snippets</b></div>
          <small>{rewritten ? "Same candidate set · target text updated" : "Original presentation"}</small>
        </header>
        <ol>
          {storyboardCandidates.map((item) => {
            const selected = item.id === selectedId;
            const inspected = item.id === inspectedId;
            return (
              <li key={item.id} className={`candidate-card ${item.target ? "is-target" : ""} ${selected ? "is-selected" : ""} ${inspected ? "is-inspected" : ""}`}>
                <span className="paper-rank">{item.id}.</span>
                <span className="paper-copy">
                  <b>{item.target && rewritten ? rewrittenMarshawnTitle : item.title}</b>
                </span>
                {selected && <span className="decision-label">Selected</span>}
                {item.target && stage === "original-selected" && <span className="not-selected-label">Not selected</span>}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rewrite-focus" aria-label="Target title rewriting">
        <header><span>Target snippet · A</span>{rewritten && <b>Rewritten</b>}</header>
        <div className="rewrite-field title-field">
          <small>Title</small>
          {stage === "rewrite-title" ? (
            <h3 className="editing-title"><del><span className="selection-highlight">Marshawn playing in charity soccer game went exactly as you&apos;d expect.</span></del><span className="typed-title">{rewrittenMarshawnTitle}</span><i className="text-cursor" aria-hidden="true" /></h3>
          ) : (
            <h3>{stage === "rewrite-complete" ? rewrittenMarshawnTitle : "Marshawn playing in charity soccer game went exactly as you'd expect."}{stage === "focus" && <i className="text-cursor" aria-hidden="true" />}</h3>
          )}
        </div>
        {stage === "focus" && <span className="focus-not-selected">Not selected</span>}
      </section>

      <aside className={`choice-summary ${["selected", "final"].includes(stage) ? "is-visible" : ""}`} aria-label="Chooser decision before and after rewriting">
        <p><span>Before</span><b>Click B</b><i aria-hidden="true">→</i><span>After</span><b>Click A</b></p>
        <small>Same candidate set. Only the target snippet was rewritten.</small>
      </aside>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<AttackStage>("candidate-set");
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
        timers = [window.setTimeout(() => setStage("final"), 0)];
        return;
      }
      timers = [
        window.setTimeout(() => setStage("scan-a"), 500),
        window.setTimeout(() => setStage("scan-b"), 1200),
        window.setTimeout(() => setStage("original-selected"), 2000),
        window.setTimeout(() => setStage("focus"), 3200),
        window.setTimeout(() => setStage("rewrite-title"), 4000),
        window.setTimeout(() => setStage("rewrite-complete"), 6200),
        window.setTimeout(() => setStage("return"), 8000),
        window.setTimeout(() => setStage("rescan"), 8700),
        window.setTimeout(() => setStage("selected"), 9600),
        window.setTimeout(() => setStage("final"), 11000),
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
          setStage("candidate-set");
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
        <section className="hero-feature" aria-labelledby="paper-title">
        <header className="article-header">
          <h1 id="paper-title">You Won&apos;t Believe This Click</h1>
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

        <section ref={demoRef} className={`attack-demo stage-${stage}`} id="demo" aria-label="AgentBait fixed-set chooser replay">
          <CandidateStoryboard stage={stage} />
          <p className="demo-caption"><b>Figure 1 | MIND example reproduced from the paper.</b> The candidate set and order remain fixed. Only target snippet A is rewritten; the chooser changes from B to A. The animation depicts selection, not an explicit reranking step.</p>
        </section>
        </section>

        <section className="story-section question" id="question" aria-labelledby="question-title">
          <div className="section-label">01 · Research question</div>
          <div className="story-grid solo-grid">
            <div className="prose">
              <h2 id="question-title">Does a better presentation become a different decision?</h2>
              <p className="lead">Recommendation is usually studied as a ranking problem. Here, ranking has already happened. Candidate identities, order and chooser prompt remain fixed. Only one target item&apos;s title and abstract may change.</p>
              <p>AgentBait separates strategy from prose. A trainable advisor proposes how to rewrite; a frozen model performs the edit; a target agent selects one item from the unchanged slate.</p>
            </div>
          </div>
          <blockquote><p>Same candidates. Same order. Same chooser. A different rendering of one item.</p></blockquote>
        </section>

        <section className="story-section results" id="results" aria-labelledby="results-title">
          <div className="section-label">02 · Key findings</div>
          <div className="story-grid solo-grid">
            <div className="prose"><h2 id="results-title">A strong selection effect—and a separate support problem</h2><p className="lead">The largest number is only interpretable beside its baseline, evaluator, dataset and factuality condition.</p></div>
          </div>

          <div className="finding-block">
            <header className="finding-heading"><span>Finding 1</span><h3 id="finding-one">Rewriting changes selection</h3></header>
            <figure className="evidence-figure" aria-labelledby="main-results-caption">
              <div className="figure-heading"><div><p className="figure-number">Table 1</p><h3>Target selection under original and rewritten presentations</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
              <MetaLine items={[{label:"Dataset",value:"MIND · English"},{label:"Sample",value:"1,000 unseen impressions"},{label:"Policy",value:"Qwen3.5-9B"},{label:"Rewriter",value:"GPT-5-mini"},{label:"Baseline",value:"Original; chance = 16.9%"}]} />
              <div className="table-scroll"><table className="results-table"><thead><tr><th>Condition</th><th>Method</th><th>GPT-5-mini<small>train target</small></th><th>GPT-5.5</th><th>Gemini 3 Flash</th><th>Gemini 3.1 Pro</th><th>Sonnet 4.6</th><th>Opus 4.8</th></tr></thead><tbody>
                {mainResults.map((row,rowIndex)=><tr key={`${row.group}-${row.method}`} className={row.method.includes("MiniCheck")?"constrained-row":""}><th>{row.group}</th><td>{row.method}</td>{row.values.map((value,index)=><td key={index} style={{"--score":`${value}%`} as React.CSSProperties}><span>{value.toFixed(1)}</span>{rowIndex>0&&<small>{value-mainResults[0].values[index]>=0?"+":""}{(value-mainResults[0].values[index]).toFixed(1)}</small>}</td>)}</tr>)}
              </tbody></table></div>
              <figcaption id="main-results-caption"><b>Table 1 | Target selection on unseen English news impressions.</b> Small values are percentage-point changes from original text for the same evaluator. Target documents do not appear in training; transfer columns use no additional training.</figcaption>
            </figure>
          </div>

          <div className="finding-block">
            <header className="finding-heading"><span>Finding 2</span><h3 id="finding-two">Selection can outrun source support</h3></header>
            <figure className="evidence-figure" aria-labelledby="support-results-caption">
              <div className="figure-heading"><div><p className="figure-number">Table 2</p><h3>Selection and source support under rewriting</h3></div><p className="metric-definition"><b>Metrics</b> Selection and support (0–100) ↑</p></div>
              <MetaLine items={[{label:"Dataset",value:"MIND · English"},{label:"Sample",value:"1,000 unseen impressions"},{label:"Chooser",value:"GPT-5-mini"},{label:"Support",value:"MiniCheck-Flan"},{label:"Baseline",value:"Original selection = 17.1%"}]} />
              <div className="table-scroll"><table className="support-table"><thead><tr><th>Condition</th><th>Target selected (%)</th><th>MiniCheck support (%)</th><th>Constraint</th></tr></thead><tbody>{supportResults.map(row=><tr key={row.method} className={row.constrained?"constrained-row":""}><th>{row.method}</th><td><b>{row.selection.toFixed(1)}</b></td><td><b>{row.support.toFixed(1)}</b></td><td>{row.constrained?"MiniCheck":"None"}</td></tr>)}</tbody></table></div>
              <figcaption id="support-results-caption"><b>Table 2 | Factuality tradeoff on MIND-English.</b> Unconstrained RL produces the highest selection and lowest source support. MiniCheck recovers support while reducing selection.</figcaption>
            </figure>
          </div>
        </section>

        <section className="story-section transfer" aria-labelledby="transfer-title">
          <div className="section-label">03 · Robustness, transfer and failure</div>
          <div className="story-grid solo-grid"><div className="prose"><h2 id="transfer-title">Transfer across languages, news datasets and academic documents</h2><p>The English MIND-trained advisor is evaluated without additional training. Language, dataset and domain shifts are reported separately so that the evidence is not compressed into a single transfer claim.</p></div></div>

          <figure className="evidence-figure robustness-figure" aria-labelledby="language-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 3</p><h3>Cross-lingual transfer on fixed MIND slates</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <MetaLine items={[{label:"Training",value:"English MIND only"},{label:"Sample",value:"1,000 aligned impressions per language"},{label:"Advisor",value:"Qwen3.5-9B"},{label:"Rewriter / chooser",value:"GPT-5-mini"}]} />
            <div className="table-scroll"><table className="transfer-table language-table"><thead><tr><th>Language</th><th>Original</th><th>Prompt rewriter</th><th>Prompt advisor</th><th>RL rewriter</th><th>RL advisor</th><th>RL rewriter + MC</th><th>RL advisor + MC</th></tr></thead><tbody>{languageResults.map(row=><tr key={row.label} className={row.label==="Average"?"summary-row":""}><th>{row.label}</th>{row.values.map((value,index)=><td key={index}><b>{value.toFixed(1)}</b>{index>0&&<small>+{(value-row.values[0]).toFixed(1)}</small>}</td>)}</tr>)}</tbody></table></div>
            <figcaption id="language-caption"><b>Table 3 | Language transfer; paper Table 4.</b> The English row is the training language. Arabic, Spanish, Swahili, Turkish and Chinese preserve the same MIND rows, targets, candidate order and slate structure.</figcaption>
          </figure>

          <figure className="evidence-figure robustness-figure" aria-labelledby="dataset-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 4</p><h3>Transfer across news datasets</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <MetaLine items={[{label:"Training dataset",value:"MIND · English"},{label:"Evaluation",value:"1,000 impressions per setting"},{label:"Out-of-domain dataset",value:"EB-NeRD"},{label:"Protocol",value:"No additional training"}]} />
            <div className="table-scroll"><table className="transfer-table dataset-table"><thead><tr><th>Dataset</th><th>Language</th><th>Original</th><th>Prompt rewriter</th><th>Prompt advisor</th><th>RL rewriter</th><th>RL advisor</th><th>RL rewriter + MC</th><th>RL advisor + MC</th></tr></thead><tbody>{datasetResults.map(row=><tr key={`${row.dataset}-${row.language}`}><th>{row.dataset}</th><td>{row.language}</td>{row.values.map((value,index)=><td key={index}><b>{value.toFixed(1)}</b>{index>0&&<small>+{(value-row.values[0]).toFixed(1)}</small>}</td>)}</tr>)}</tbody></table></div>
            <figcaption id="dataset-caption"><b>Table 4 | News-dataset transfer; paper Table 5.</b> MIND-Danish changes display language. EB-NeRD is a distinct Danish news dataset; the English version translates the same EB-NeRD slates.</figcaption>
          </figure>

          <figure className="evidence-figure robustness-figure" aria-labelledby="academic-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 5</p><h3>Transfer to academic document selection</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <MetaLine items={[{label:"Dataset",value:"SciRepEval-derived scientific documents"},{label:"Sample",value:"1,000 impressions"},{label:"Mean / max slate",value:"9.29 / 10 candidates"},{label:"Target agent",value:"GPT-5-mini"},{label:"Training",value:"English MIND only"}]} />
            <div className="table-scroll"><table className="academic-table"><thead><tr><th>Condition</th><th>Method</th><th>Selection rate</th><th>Gain over original</th></tr></thead><tbody>{academicResults.map(row=><tr key={`${row.group}-${row.method}`} className={row.method.includes("MiniCheck")?"constrained-row":""}><th>{row.group}</th><td>{row.method}</td><td><b>{row.selection.toFixed(1)}</b></td><td>{row.selection===9.9?"—":`+${(row.selection-9.9).toFixed(1)} pp`}</td></tr>)}</tbody></table></div>
            <figcaption id="academic-caption"><b>Table 5 | Cross-domain academic transfer; paper Table 6.</b> The MIND-trained advisor reaches 63.6% selection without further academic-domain training; MiniCheck reduces selection to 47.3% while retaining a +37.4 point gain over original text.</figcaption>
          </figure>
        </section>

        <section className="story-section setting" id="setting" aria-labelledby="setting-title">
          <div className="section-label">04 · Experimental setting</div>
          <div className="story-grid setting-grid">
            <div className="prose">
              <h2 id="setting-title">A controlled intervention after retrieval</h2>
              <p>The primary experiment uses held-out MIND news impressions. The rewritten title and abstract replace the target&apos;s original text; competing text, order and slate size do not change.</p>
            </div>
          </div>
          <figure className="slate-figure controlled-figure" aria-labelledby="setting-figure-title slate-caption">
            <h3 className="experiment-thesis" id="setting-figure-title">Only the target text changes. The candidate set and chooser conditions remain fixed.</h3>
            <div className="constant-ribbon">
              <b>Held constant across conditions</b>
              <ul><li>Candidate identity</li><li>Order</li><li>Slate size</li><li>Non-target text</li><li>Chooser prompt</li></ul>
            </div>

            <div className="experiment-diagram">
              <section className="candidate-panel" aria-labelledby="candidate-panel-title">
                <header><span>Block 1</span><h4 id="candidate-panel-title">Fixed candidate set</h4></header>
                <ol>
                  <li><b>A</b><p>Competitor text</p><em>Fixed</em></li>
                  <li className="treated-candidate"><b>B</b><p>Target title + abstract</p><em>Treated</em></li>
                  <li><b>C</b><p>Competitor text</p><em>Fixed</em></li>
                </ol>
              </section>

              <section className="intervention-panel" aria-labelledby="intervention-title">
                <header><span>Block 2</span><h4 id="intervention-title">Intervention pipeline</h4></header>
                <ol className="intervention-steps">
                  <li><span>01</span><div><b>Advisor</b><p>Proposes an editorial strategy</p></div></li>
                  <li className="rewrite-step"><span>02</span><div><b>Frozen rewriter</b><p>Rewrites target B only</p></div></li>
                  <li><span>03</span><div><b>Chooser agent</b><p>Selects one item from the same candidate set</p></div></li>
                </ol>
              </section>

              <aside className="reward-panel" aria-labelledby="reward-title">
                <header><span>Block 3</span><h4 id="reward-title">Reward / Constraint</h4></header>
                <dl><div><dt>Selection reward</dt><dd>Was target B selected?</dd></div><div><dt>Optional constraint</dt><dd>Source support</dd></div></dl>
                <p>MiniCheck sentence support</p>
              </aside>
            </div>
            <figcaption id="slate-caption"><b>Figure 2 | AgentBait system.</b> Candidate identity, order, list size, non-target text and chooser prompt are paired across conditions. Policy: Qwen3.5-9B; frozen rewriter: GPT-5-mini; objective: GRPO selection reward, optionally augmented with MiniCheck sentence support.</figcaption>
          </figure>
        </section>

        <section className="story-section case-study" id="examples" aria-labelledby="example-title">
          <div className="section-label">05 · Examples as editorial redlines</div>
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

        <section className="story-section resources" id="resources" aria-label="Paper resources and citation">
          <div className="section-label">07 · Paper resources and citation</div>
          <div className="resource-links"><a href="/paper.pdf"><span>Paper</span><b>Full manuscript · PDF</b><em>↗</em></a><a href={codeUrl} target="_blank" rel="noreferrer"><span>Code</span><b>Implementation and evaluation</b><em>↗</em></a><a href={datasetUrl} target="_blank" rel="noreferrer"><span>Dataset</span><b>MIND source dataset</b><em>↗</em></a><a href="#demo"><span>Demo</span><b>Replay Figure 1</b><em>↑</em></a></div>
          <details className="citation" open><summary><span>Citation</span><b>BibTeX</b></summary><div className="citation-body"><pre>{bibtex}</pre><button type="button" onClick={copyCitation}>{copied ? "Copied" : "Copy BibTeX"}</button></div></details>
        </section>
      </article>

      <footer><p><b>AgentBait</b> · UC Berkeley · 2026</p><p>This page is an editorial reading companion. Claims and numbers should be read with their stated experimental conditions.</p><a href="#paper">Back to top ↑</a></footer>
    </main>
  );
}
