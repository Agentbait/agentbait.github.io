"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { flushSync } from "react-dom";

type MorphViewTransition = { finished: Promise<void> };
type MorphDocument = Document & { startViewTransition?: (update: () => void) => MorphViewTransition };

const codeUrl = "https://github.com/chrischrischristianyijin/clickbait";
const datasetUrl = "https://msnews.github.io/";
const bairUrl = "https://bair.berkeley.edu/";
const skyUrl = "https://sky.cs.berkeley.edu/";
const ziruiUrl = "https://zwcolin.github.io/";
const davidUrl = "https://dchan.cc/";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetUrl = (path: string) => `${basePath}${path}`;

const storyboardCandidates = [
  {
    id: "A",
    title: "Marshawn playing in charity soccer game went exactly as you'd expect.",
    abstract: "If there was ever a sport-athlete combination that we'd never expect to work out, it'd be Marshawn Lynch dabbling in soccer.",
    target: true,
  },
  {
    id: "B",
    title: "Sofia Vergara and Joe Manganiello Celebrate 4-Year Wedding Anniversary: 'Mi Amor!'",
    abstract: "Sofia Vergara and Joe Manganiello Celebrate 4-Year Wedding Anniversary",
  },
  {
    id: "C",
    title: "The Coolest And Craziest McDonald's Across The Country",
    abstract: "Sometimes, the Golden Arches know how to pull out all the stops.",
  },
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

function TypewriterTitle({ text }: { text: string }) {
  let characterOffset = 0;
  const words = text.split(" ");

  return words.map((word, wordIndex) => {
    const wordStart = characterOffset;
    characterOffset += word.length + 1;
    return (
      <span key={`${word}-${wordIndex}`}>
        <span className="typewriter-word">
          {Array.from(word).map((character, characterIndex) => {
            const index = wordStart + characterIndex;
            return (
              <span
                className="typewriter-char"
                key={`${character}-${index}`}
                style={{ "--key-delay": `${index * 28}ms`, "--key-delay-fast": `${index * 10}ms` } as CSSProperties}
              >
                {character}
              </span>
            );
          })}
        </span>
        {wordIndex < words.length - 1 && " "}
      </span>
    );
  });
}

function InteractiveClickWord() {
  const [completed, setCompleted] = useState(false);
  const [selectedVisible, setSelectedVisible] = useState(false);
  const hideSelectedTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (hideSelectedTimer.current !== null) window.clearTimeout(hideSelectedTimer.current);
  }, []);

  function completeWord() {
    if (completed) return;
    setCompleted(true);
    setSelectedVisible(true);
    hideSelectedTimer.current = window.setTimeout(() => setSelectedVisible(false), 2600);
  }

  return (
    <span className={`click-completion ${completed ? "is-complete" : ""}`}>
      <button
        type="button"
        className="click-word"
        aria-label={completed ? "Click, selected" : "Complete the word Click"}
        aria-pressed={completed}
        onClick={completeWord}
      >
        <span aria-hidden="true">Cl</span>
        <span className="click-letter-slot" aria-hidden="true">
          {completed ? <span className="click-letter">i</span> : <span className="click-placeholder">_</span>}
        </span>
        <span aria-hidden="true">ck</span>
      </button>
      <span className={`click-selected-note ${selectedVisible ? "is-visible" : ""}`} aria-live="polite">{selectedVisible ? "selected" : ""}</span>
    </span>
  );
}

function CandidateStoryboard({ stage, instanceId, showEditorHand }: { stage: AttackStage; instanceId: string; showEditorHand: boolean }) {
  const rewritten = ["rewrite-complete", "return", "rescan", "selected", "final"].includes(stage);
  const focused = ["focus", "rewrite-title", "rewrite-complete"].includes(stage);
  const inspectedId = stage === "scan-a" ? "A" : stage === "scan-b" ? "C" : stage === "rescan" ? "B" : null;
  const selectedId = stage === "original-selected" ? "B" : ["selected", "final"].includes(stage) ? "A" : null;

  return (
    <div className={`storyboard-board ${focused ? "is-focused" : ""} ${rewritten ? "is-rewritten" : ""} ${showEditorHand ? "full-edit" : "quick-edit"}`} role="group" aria-label="Automatically animated AgentBait fixed-slate comparison using the MIND example from Figure 1">
      <section className="candidate-set" aria-labelledby={`${instanceId}-candidate-set-title`}>
        <header>
          <div><span>Candidate Set</span><b id={`${instanceId}-candidate-set-title`}>Three fixed MIND snippets</b></div>
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
                  <small className="paper-abstract">
                    <span className="paper-abstract-label">Abstract</span>
                    <span className="paper-abstract-copy">{item.abstract}</span>
                  </small>
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
          <small>Original → Rewritten</small>
          <div className="editorial-title">
            <p className="original-edit-line">Marshawn playing in charity soccer game <del className="weak-expression">went exactly as you&apos;d expect.</del></p>
            <h3 className="typewriter-title"><TypewriterTitle text={rewrittenMarshawnTitle} /></h3>
          </div>
        </div>
        {showEditorHand && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="editor-hand" src={assetUrl("/editor-hand.png")} alt="" aria-hidden="true" fetchPriority="high" />
        )}
        {stage === "focus" && <span className="focus-not-selected">Not selected</span>}
      </section>

      <aside className={`choice-summary ${["selected", "final"].includes(stage) ? "is-visible" : ""}`} aria-label="Chooser decision before and after rewriting">
        <p><span>Before</span><b>Click B</b><i aria-hidden="true">→</i><span>After</span><b>Click A</b></p>
        <small>Same candidate set. Only the target snippet was rewritten.</small>
      </aside>
    </div>
  );
}

function useStoryboardPlayback(ref: RefObject<HTMLElement | null>) {
  const [stage, setStage] = useState<AttackStage>("candidate-set");
  const [showEditorHand, setShowEditorHand] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const elapsedRef = useRef(0);
  const stageRef = useRef<AttackStage>("candidate-set");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      const visibilityFrame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(visibilityFrame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.25, rootMargin: "-8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedMotionFrame = window.requestAnimationFrame(() => {
        setShowEditorHand(false);
        stageRef.current = "final";
        setStage("final");
      });
      return () => window.cancelAnimationFrame(reducedMotionFrame);
    }

    if (!isVisible) return;

    let animationFrame = 0;
    let lastFrameTime: number | null = null;
    const timeline: Array<[AttackStage, number]> = [["scan-a", 500], ["scan-b", 1200], ["original-selected", 2200], ["focus", 3400], ["rewrite-title", 5000], ["rewrite-complete", 7900], ["return", 9400], ["rescan", 10200], ["selected", 11300], ["final", 12600]];

    const update = (now: number) => {
      if (lastFrameTime !== null) {
        const frameDelta = Math.min(now - lastFrameTime, 100);
        elapsedRef.current = (elapsedRef.current + frameDelta) % 20000;
      }
      lastFrameTime = now;
      const elapsed = elapsedRef.current;

      let nextStage: AttackStage = "candidate-set";
      for (const [candidateStage, delay] of timeline) {
        if (elapsed >= delay) nextStage = candidateStage;
        else break;
      }
      if (stageRef.current !== nextStage) {
        stageRef.current = nextStage;
        setStage(nextStage);
      }

      animationFrame = window.requestAnimationFrame(update);
    };

    animationFrame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isVisible]);

  return { stage, showEditorHand };
}

export default function Home() {
  const demoRef = useRef<HTMLElement>(null);
  const [heroFlipped, setHeroFlipped] = useState(false);
  const { stage, showEditorHand } = useStoryboardPlayback(demoRef);
  const [copied, setCopied] = useState(false);
  const [paperGraph, setPaperGraph] = useState(false);
  const [frontRewrite, setFrontRewrite] = useState<"a" | "b">("b");
  const [creditsOpen, setCreditsOpen] = useState(false);

  const toggleRewriteCards = () => {
    setFrontRewrite((current) => current === "a" ? "b" : "a");
  };

  const togglePaperGraph = () => {
    const updateGraph = () => setPaperGraph((current) => !current);
    const morphDocument = document as MorphDocument;

    if (!morphDocument.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      updateGraph();
      return;
    }

    document.documentElement.classList.add("is-native-graph-morph");
    const transition = morphDocument.startViewTransition(() => flushSync(updateGraph));
    transition.finished.finally(() => document.documentElement.classList.remove("is-native-graph-morph"));
  };

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
          <a href={assetUrl("/paper.pdf")}>Paper</a>
          <a href="#results">Results</a>
          <a href="#examples">Examples</a>
          <a href={codeUrl} target="_blank" rel="noreferrer">Code</a>
        </nav>
      </header>

      <article>
        <section className="hero-feature" aria-labelledby="paper-title">
        <header className="article-header">
          <p className="hero-eyebrow">01 · Agent-legible presentation effects</p>
          <h1 id="paper-title">You Won&apos;t Believe This <InteractiveClickWord /></h1>
          <p className="subtitle">Content Rewriting for Agentic Choice</p>
          <p className="standfirst">Can changing only one item&apos;s presentation change the chooser&apos;s decision?</p>
          <div className="paper-identity">
            <div className="byline">
              <div className="byline-copy">
                <p><strong>Tianyi Jin</strong>, <a className="author-link" href={ziruiUrl} target="_blank" rel="noreferrer"><strong>Zirui Wang</strong></a> and <a className="author-link" href={davidUrl} target="_blank" rel="noreferrer"><strong>David M. Chan</strong></a></p>
                <p>University of California, Berkeley</p>
              </div>
              <div className="affiliation-logos" aria-label="Research affiliations">
                <a href={bairUrl} target="_blank" rel="noreferrer" aria-label="Visit Berkeley Artificial Intelligence Research">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={assetUrl("/bair-logo.png")} width="205" height="146" alt="Berkeley Artificial Intelligence Research" />
                </a>
                <a href={skyUrl} target="_blank" rel="noreferrer" aria-label="Visit Sky Computing Lab">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={assetUrl("/sky-logo.png")} width="264" height="243" alt="Sky Computing Lab" />
                </a>
              </div>
            </div>
            <div className="paper-links" aria-label="Paper resources">
              <a href={assetUrl("/paper.pdf")}>Paper ↗</a>
              <a href={codeUrl} target="_blank" rel="noreferrer">Code ↗</a>
              <a href={datasetUrl} target="_blank" rel="noreferrer">Dataset ↗</a>
              <a href="#demo">Demo ↓</a>
            </div>
          </div>
        </header>

        <section ref={demoRef} className={`attack-demo stage-${stage}`} id="demo" aria-label="AgentBait fixed-set chooser replay and training loop">
          <div className={`hero-flip-card ${heroFlipped ? "is-flipped" : ""}`}>
            <div
              className="hero-flip-inner"
              role="button"
              tabIndex={0}
              aria-label={heroFlipped ? "Show narrative replay" : "Show paper graph"}
              onClick={() => setHeroFlipped((current) => !current)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setHeroFlipped((current) => !current);
                }
              }}
            >
              <div className="hero-flip-face hero-flip-front" aria-hidden={heroFlipped}>
                <CandidateStoryboard stage={stage} instanceId="hero" showEditorHand={showEditorHand} />
              </div>
              <div className="hero-flip-face hero-flip-back" aria-hidden={!heroFlipped}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetUrl("/agentbait-method.png")} alt="AgentBait pipeline showing a trainable advisor, frozen rewriter, fixed candidate list and target-agent selection reward." />
              </div>
            </div>
            <span className="hero-flip-hint" aria-hidden="true">{heroFlipped ? "Click to return" : "View graph"}<i>↻</i></span>
          </div>
          <div className="demo-caption">
            <p className="caption-copy">A list of competing documents is shown to the target agent. We choose one target document from the list and generate a rewriting strategy for only that document. A separate rewriting model then revises the target document&apos;s title and abstract, while all other documents in the list remain exactly the same. The target agent selects from this updated list, and whether the rewritten target document is selected is used to train the advisor.</p>
          </div>
        </section>
        </section>

        <section className="story-section abstract-section" id="abstract" aria-labelledby="abstract-title">
          <div className="section-label">02 · Abstract</div>
          <div className="abstract-layout">
            <div className="abstract-copy">
              <h2 id="abstract-title">Abstract</h2>
              <p>Language models are increasingly used as agents to help humans decide what information is surfaced. This usage incentivizes content creators to optimize content in ways that appeal not only to humans, but also to agents that mediate access to them. In this paper, we study selection shifts induced by rewriting in agentic decision-making. Given a set of competing content snippets, we rewrite only one snippet while leaving the rest unchanged, and then measure how it impacts the agent&apos;s choice.</p>
              <p>We operationalize this setup with AgentBait, an advisor-rewriter framework in which the advisor learns to propose rewriting strategies and the rewriter revises the snippet. While a rewriter with a fixed prompt improves target snippet selection from 17.1% to 34.8%, our AgentBait raises its selection to 98.5%. We further show that the advisor trained with AgentBait effectively transfers to setups with different agents, languages, and snippets in other domains (e.g., scientific papers).</p>
              <p>However, higher target selection can reflect unsupported rewrites rather than better content. Adding a reward for support from the original snippet redirects the advisor toward more supported rewriting strategies, revealing a trade-off between factuality and target selection. Together, our results show that once agents mediate access to information, content can be rewritten to be chosen by the agent, even when selection and usefulness diverge.</p>
            </div>
          </div>
        </section>

        <section className="story-section setting" id="setting" aria-labelledby="setting-title">
          <div className="section-label">03 · Interactive setting</div>
          <div className="story-grid setting-grid">
            <div className="prose">
              <h2 id="setting-title">Same slate. One rewrite.<br />Can the decision change?</h2>
              <p>The candidate list has already been constructed. Only the target presentation may change.</p>
            </div>
          </div>
          <figure className={`slate-figure controlled-figure ${paperGraph ? "is-paper-graph" : ""}`} data-graph-view={paperGraph ? "paper" : "narrative"} aria-labelledby="setting-figure-title slate-caption">
            <div className="controlled-figure-head">
              <h3 className="experiment-thesis morph-copy" id="setting-figure-title">
                <span className="view-copy paper-view-copy" aria-hidden={!paperGraph}>Advisor–rewriter setting</span>
              </h3>
              <button
                type="button"
                className="graph-view-toggle"
                aria-label={paperGraph ? "Show narrative figure" : "Show paper graph"}
                aria-controls="setting-view-stage"
                aria-pressed={paperGraph}
                onClick={togglePaperGraph}
              >
                <span>{paperGraph ? "Narrative view" : "Paper graph"}</span>
                <i aria-hidden="true">⇄</i>
              </button>
            </div>
            <div className="setting-view-stage" id="setting-view-stage">
            <div className="paper-method-view" aria-hidden={!paperGraph}>
              <div className="setting-view-content paper-method-figure" tabIndex={paperGraph ? 0 : -1}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="paper-method-artwork"
                  src={assetUrl("/paper-method-transparent.png")}
                  alt="AgentBait narrative pipeline: a target document is selected from a fixed candidate slate, rewritten by a frozen rewriter under a learned advisor strategy, returned to the slate for target-agent selection, and the selection reward updates the advisor."
                  width={3782}
                  height={1416}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className="system-graph-view" aria-hidden={paperGraph}>
            <div className="setting-view-content paper-graph-stage">
            <ol className="process-spine" aria-label="AgentBait process: read the target, edit it, then select from the fixed slate">
              <li><b>01</b><span>Read</span></li>
              <li><b>02</b><span>Edit</span></li>
              <li><b>03</b><span>Select</span></li>
            </ol>

            <div className="concept-triptych" aria-label="Advisor, rewriter and selection pipeline">
              <span className="cross-panel-path strategy-path" aria-hidden="true">
                <i className="strategy-source-port" />
                <span className="strategy-token">Strategy s</span>
              </span>
              <span className="cross-panel-path rewrite-path" aria-hidden="true"><i /></span>
              <section className="triptych-panel advisor-panel" aria-labelledby="advisor-panel-title">
                <header><div className="panel-heading-line"><span>01 · Target input</span><em className="training-state is-trained">Trained</em></div><h4 id="advisor-panel-title">Advisor</h4><p className="panel-description morph-copy"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}>Receives only the extracted target document and proposes a rewriting strategy.</span><span className="view-copy paper-view-copy" aria-hidden={!paperGraph}>πθ(s | xB) · target only</span></p></header>
                <div className="advisor-visual">
                  <span className="arch-fragment" aria-hidden="true" />
                  <div className="scholar-fragment" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetUrl("/advisor-scholar.png")} alt="" />
                  </div>
                  <div className="advisor-intake-animation" aria-hidden="true">
                    <div className="upstream-slate">
                      <span>Outside advisor · fixed slate</span>
                      <ol>
                        <li><b>A</b><span>Candidate A</span></li>
                        <li className="upstream-target"><b>B</b><span>Target B</span></li>
                        <li><b>C</b><span>Candidate C</span></li>
                      </ol>
                    </div>
                    <span className="advisor-input-boundary" />
                    <span className="target-extraction-trace"><i>Extract B</i></span>
                  </div>
                  <article className="advisor-target-document">
                    <small>Advisor input · target only</small>
                    <p><b>B</b><span>Target document</span></p>
                    <em>Title + abstract</em>
                  </article>
                </div>
                <p className="strategy-note"><span className="strategy-note-label morph-copy"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}>Advisor suggests</span><span className="view-copy paper-view-copy" aria-hidden={!paperGraph}>Strategy s</span></span><b><span className="strategy-initial">“Try a sharper, more specific framing.”</span><span className="strategy-updated">“Push the hook further, but keep it specific.”</span><span className="paper-strategy-formula" aria-hidden={!paperGraph}>s = specificity + narrative tension</span></b></p>
              </section>

              <section className="triptych-panel rewriter-panel" aria-labelledby="rewriter-panel-title">
                <header><div className="panel-heading-line"><span>02 · Edit</span><em className="training-state">Frozen</em></div><h4 id="rewriter-panel-title">Frozen Rewriter</h4><p className="panel-description morph-copy"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}>Applies the strategy to the target title and abstract only.</span><span className="view-copy paper-view-copy" aria-hidden={!paperGraph}>Rewrites target xB under s</span></p></header>
                <div className="rewriter-visual">
                  <div className="paper-fragment">
                    <small>Original title</small>
                    <p>A study of <del>news recommendation</del></p>
                    <small>Rewritten title</small>
                    <p className="rewritten-line">What Makes a Model Choose This?</p>
                    <span className="paper-graph-formula" aria-hidden={!paperGraph}>xB + s → x′B</span>
                  </div>
                  <span className="rewriter-control-input" aria-hidden="true"><small>Control input</small><b>Strategy s</b></span>
                  <div className="rewrite-hand-motion" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="triptych-quill" src={assetUrl("/rewriter-hand-strings.png")} alt="" />
                  </div>
                  <div className="rewrite-transfer" aria-hidden="true"><span><b>B</b>Candidate B</span><i>››</i></div>
                </div>
              </section>

              <section className="triptych-panel selection-panel" aria-labelledby="selection-panel-title">
                <header><div className="panel-heading-line"><span>03 · Select</span><em className="training-state">Frozen</em></div><h4 className="morph-copy" id="selection-panel-title"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}>Same Chooser</span><span className="view-copy paper-view-copy" aria-hidden={!paperGraph}>Chooser</span></h4><p className="panel-description morph-copy"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}>Selects from the same candidate identities and order, with only the target rewritten.</span><span className="view-copy paper-view-copy" aria-hidden={!paperGraph}>Selects y from candidate slate C</span></p></header>
                <div className="selection-visual">
                  <span className="selection-beam" aria-hidden="true" />
                  <ol className="selection-candidates" aria-label="Chooser selection from the fixed candidate set">
                    <li><b>A</b><span>Candidate A</span></li>
                    <li className="selected-candidate"><b>B</b><span>Candidate B</span><em className="morph-copy"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}>Selected</span><span className="view-copy paper-view-copy" aria-hidden={!paperGraph}>Target · Selected</span></em><i className="feedback-origin" aria-hidden="true" /></li>
                    <li><b>C</b><span>Candidate C</span></li>
                  </ol>
                  <span className="selector-hand-motion" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="selector-hand" src={assetUrl("/selector-hand.png")} alt="" />
                  </span>
                </div>
              </section>
            </div>

            <div className="policy-feedback" aria-label="Chooser decision becomes a scalar reward; GRPO uses it to update only the advisor policy">
              <span className="feedback-descent" aria-hidden="true"><i /></span>
              <span className="reward-node"><small>Reward</small><b>r</b></span>
              <span className="feedback-return" aria-hidden="true"><i /></span>
              <span className="feedback-ascent" aria-hidden="true"><i /></span>
              <p><span>Selection outcome defines the reward</span><b>GRPO updates the advisor policy.</b></p>
            </div>
            </div>
            </div>
            </div>
            <figcaption className="morph-copy" id="slate-caption"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}><b>Figure 2 | AgentBait system schematic.</b> The advisor and frozen rewriter receive only the extracted target document; only the chooser sees the full fixed slate. Policy: Qwen3.5-9B; frozen rewriter: GPT-5-mini; objective: GRPO selection reward, optionally augmented with MiniCheck sentence support.</span><span className="view-copy paper-view-copy paper-graph-caption" aria-hidden={!paperGraph}><b>Figure 2.</b> Overview of our target-only advisor–rewriter setting.</span></figcaption>
          </figure>
        </section>

        <section className="story-section results" id="results" aria-labelledby="results-title">
          <div className="section-label">04 · Key findings</div>
          <div className="story-grid solo-grid">
            <div className="prose"><h2 className="compact-section-title" id="results-title">How presentation becomes a decision signal</h2><p className="lead">A controlled sequence of effects, transfer, and failure.</p></div>
          </div>

          <div className="finding-sequence" aria-label="A four-step sequence from presentation sensitivity to a source-support failure mode">
            <article className="finding-step sensitivity-step">
              <p className="finding-step-label"><span>01</span><b>Sensitivity</b></p>
              <h3>Presentation already matters</h3>
              <div className="finding-step-metric finding-step-shift" aria-label="Target selection increases from 17.1 percent for the original target to 34.8 percent with a prompt rewriter"><span><b>17.1%</b><small>Original</small></span><i aria-hidden="true">→</i><span className="outcome"><b>34.8%</b><small>Prompt rewrite</small></span></div>
            </article>
            <article className="finding-step optimization-step">
              <p className="finding-step-label"><span>02</span><b>Optimization</b></p>
              <h3>Training amplifies the effect</h3>
              <div className="finding-step-metric finding-step-shift" aria-label="Target selection increases from 34.8 percent with a prompt rewriter to 98.5 percent with the trained advisor"><span><b>34.8%</b><small>Prompt rewrite</small></span><i aria-hidden="true">→</i><span className="outcome"><b>98.5%</b><small>Trained advisor</small></span></div>
            </article>
            <article className="finding-step transfer-step">
              <p className="finding-step-label"><span>03</span><b>Transfer</b></p>
              <h3>The learned advice generalizes</h3>
              <ul className="finding-step-domains" aria-label="Generalizes across agents, languages, and document domains"><li>Agents</li><li>Languages</li><li>Domains</li></ul>
            </article>
            <article className="finding-step failure-step">
              <p className="finding-step-label"><span>04</span><b>Failure mode</b></p>
              <h3>Selection can outrun support</h3>
              <div className="finding-step-metric finding-step-contrast" aria-label="The unconstrained trained advisor reaches 98.5 percent target selection with 2.0 percent source support"><span className="outcome"><b>98.5%</b><small>Selected</small></span><i aria-hidden="true">·</i><span className="support-value"><b>2.0%</b><small>Supported</small></span></div>
            </article>
          </div>
        </section>

        <section className="story-section case-study" id="examples" aria-labelledby="example-title">
          <div className="section-label">05 · Examples as editorial redlines</div>
          <div className="story-grid solo-grid">
            <div className="prose"><h2 id="example-title">One airport story,<br />two routes to selection</h2><p>Both rewrites win selection. The redline shows the difference: one reframes the available evidence, while the other introduces a mechanism absent from the source.</p></div>
          </div>
          <figure className="example-figure" aria-labelledby="example-caption">
            <aside className="example-source" aria-label="Fixed original target">
              <span>Original target</span>
              <div className="source-card-content">
                <p>Why Tokyo&apos;s Haneda is one of the world&apos;s most punctual airports</p>
                <small><b>Abstract</b>Haneda, officially called Tokyo International Airport, is the world&apos;s fifth busiest airport. Yet it delivered 85.6% of its flights on time in 2018, making it the most punctual mega airport in the world.</small>
              </div>
            </aside>
            <div
              className={`rewrite-card-deck is-${frontRewrite}-front`}
              role="button"
              tabIndex={0}
              aria-label={`${frontRewrite === "a" ? "Unconstrained rewrite A" : "Support-aware rewrite B"} is in front. Activate to swap rewrite cards.`}
              onClick={toggleRewriteCards}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleRewriteCards();
                }
              }}
            >
              <article className="rewrite-card rewrite-card-a unsupported">
                <header><b>A · Unconstrained</b><span>Technical authority · Novelty</span></header>
                <h3><mark>AI-Driven</mark> Runway Scheduling: How <mark>Sensor Fusion and ML</mark> Boosted Haneda&apos;s 85.6% On-Time Rate</h3>
                <div className="rewrite-abstract"><span>Abstract</span><p>Tokyo International Airport achieved an 85.6% on-time performance in 2018, which the rewrite attributes to a proprietary AI-based predictive maintenance and dynamic scheduling system. It describes sensor fusion, delay forecasting, and reinforcement-learning runway scheduling as mechanisms behind the reported punctuality.</p></div>
                <dl><div><dt>MiniCheck support ↑</dt><dd>0.014</dd></div><div><dt>Worst-sentence ↑</dt><dd>0.006</dd></div></dl>
              </article>
              <article className="rewrite-card rewrite-card-b supported">
                <header><b>B · Support-aware</b><span>Operational puzzle · Stakes</span></header>
                <h3><span className="support-aware-underline">How Tokyo&apos;s Haneda Beats the Odds:</span> Inside the Operations That Deliver 85.6% On-Time Flights</h3>
                <div className="rewrite-abstract"><span>Abstract</span><p>Tokyo International Airport is the world&apos;s fifth-busiest airport, yet in 2018 it achieved an 85.6% on-time rate. This feature probes the paradox: what management choices, scheduling practices, ground operations, and airport-airline coordination let Haneda run so punctually at massive scale?</p></div>
                <dl><div><dt>MiniCheck support ↑</dt><dd>0.623</dd></div><div><dt>Worst-sentence ↑</dt><dd>0.051</dd></div></dl>
              </article>
              <span className="rewrite-deck-hint" aria-hidden="true">Click to bring {frontRewrite === "a" ? "B" : "A"} forward <i>↻</i></span>
            </div>
            <figcaption id="example-caption"><b>Figure 3 | Haneda qualitative comparison.</b> The list is fixed and only the target text changes. Model: GPT-5-mini target agent; metrics: target selection and MiniCheck support; example n=1.</figcaption>
          </figure>
        </section>

        <section className="story-section results detailed-results" aria-label="Detailed tables for the key findings">

          <div className="finding-block">
            <figure className="evidence-figure" aria-labelledby="table-one-title main-results-caption">
              <div className="figure-heading"><div><p className="figure-number">Table 1 · Target-agent transfer</p><h3 id="table-one-title">Optimization amplifies the presentation effect</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
              <p className="table-takeaway">Prompt-only rewriting raises target selection from 17.1% to 34.8%, while the RL-trained advisor reaches 98.5%. Gains remain positive across all held-out target agents, although transfer strength varies.</p>
              <div className="table-scroll"><table className="results-table"><thead><tr><th>Condition</th><th>Method</th><th className="train-target-column">GPT-5-mini<small>train target</small></th><th>GPT-5.5</th><th>Gemini 3 Flash</th><th>Gemini 3.1 Pro</th><th>Sonnet 4.6</th><th>Opus 4.8</th></tr></thead><tbody>
                {mainResults.map((row,rowIndex)=><tr key={`${row.group}-${row.method}`} className={row.method.includes("MiniCheck")?"constrained-row":""}><th>{row.group}</th><td>{row.method}</td>{row.values.map((value,index)=><td key={index} className={index===0?"train-target-column":undefined} style={{"--score":`${value}%`} as React.CSSProperties}><span>{value.toFixed(1)}</span>{rowIndex>0&&<small>{value-mainResults[0].values[index]>=0?"+":""}{(value-mainResults[0].values[index]).toFixed(1)}</small>}</td>)}</tr>)}
              </tbody></table></div>
              <figcaption id="main-results-caption"><b>Table 1 | Target selection on 1,000 unseen MIND-English news impressions.</b> GPT-5-mini is the training target and frozen rewriter; Qwen3.5-9B is the advisor policy. Row-wise chance is 16.9%. Small values are percentage-point changes from original text for the same evaluator. Target documents do not appear in training; transfer columns use no additional training.</figcaption>
            </figure>
          </div>

          <div className="finding-block">
            <figure className="evidence-figure" aria-labelledby="table-two-title support-results-caption">
              <div className="figure-heading"><div><p className="figure-number">Table 2 · Source-support tradeoff</p><h3 id="table-two-title">Selection can outrun source support</h3></div><p className="metric-definition"><b>Metrics</b> Selection and support (0–100) ↑</p></div>
              <p className="table-takeaway">The unconstrained advisor reaches 98.5% target selection with only 2.0% MiniCheck support. Adding a source-support reward partially recovers support while reducing selection.</p>
              <div className="table-scroll"><table className="support-table"><thead><tr><th>Condition</th><th>Target selected (%)</th><th>MiniCheck support (%)</th><th>Constraint</th></tr></thead><tbody>{supportResults.map(row=><tr key={row.method} className={row.constrained?"constrained-row":""}><th>{row.method}</th><td className="score-bar-cell" style={{"--score":`${row.selection}%`} as React.CSSProperties}><b>{row.selection.toFixed(1)}</b></td><td className="score-bar-cell score-bar-support" style={{"--score":`${row.support}%`} as React.CSSProperties}><b>{row.support.toFixed(1)}</b></td><td>{row.constrained?"MiniCheck":"None"}</td></tr>)}</tbody></table></div>
              <figcaption id="support-results-caption"><b>Table 2 | Source-support tradeoff on 1,000 unseen MIND-English impressions.</b> Target selection uses the GPT-5-mini chooser; source support is scored with MiniCheck-Flan. The original target-selection baseline is 17.1%.</figcaption>
            </figure>
          </div>
        </section>

        <section className="story-section transfer" aria-labelledby="transfer-title">
          <div className="section-label">06 · Robustness, transfer and failure</div>
          <div className="story-grid solo-grid"><div className="prose"><h2 id="transfer-title">Transfer across languages,<br />news datasets and academic documents</h2><p>The English MIND-trained advisor is evaluated without additional training. Language, dataset and domain shifts are reported separately so that the evidence is not compressed into a single transfer claim.</p></div></div>

          <figure className="evidence-figure robustness-figure" aria-labelledby="table-three-title language-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 3 · Language transfer</p><h3 id="table-three-title">The learned advisor transfers across languages</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <p className="table-takeaway">Trained only on English MIND, the advisor remains above 93% selection in every evaluated language without additional training. Direct rewriter training is less stable, falling to 27.8% in Swahili.</p>
            <div className="table-scroll"><table className="transfer-table language-table"><thead><tr><th>Language</th><th>Original</th><th>Prompt rewriter</th><th>Prompt advisor</th><th>RL rewriter</th><th>RL advisor</th><th>RL rewriter + MC</th><th>RL advisor + MC</th></tr></thead><tbody>{languageResults.map(row=><tr key={row.label} className={row.label==="Average"?"summary-row":""}><th>{row.label}</th>{row.values.map((value,index)=><td key={index}><b>{value.toFixed(1)}</b>{index>0&&<small>+{(value-row.values[0]).toFixed(1)}</small>}</td>)}</tr>)}</tbody></table></div>
            <figcaption id="language-caption"><b>Table 3 | Language transfer; paper Table 4.</b> The English row is the training language. Each language uses 1,000 aligned impressions; Arabic, Spanish, Swahili, Turkish and Chinese preserve the same MIND rows, targets, candidate order and slate structure. Advisor: Qwen3.5-9B; frozen rewriter and chooser: GPT-5-mini.</figcaption>
          </figure>

          <figure className="evidence-figure robustness-figure" aria-labelledby="table-four-title dataset-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 4 · Dataset transfer</p><h3 id="table-four-title">The effect extends beyond the training dataset</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <p className="table-takeaway">Without additional training, the advisor reaches 98.1% on EB-NeRD English and 98.2% on EB-NeRD Danish. The result therefore extends beyond translation of the original MIND evaluation set.</p>
            <div className="table-scroll"><table className="transfer-table dataset-table"><thead><tr><th>Dataset</th><th>Language</th><th>Original</th><th>Prompt rewriter</th><th>Prompt advisor</th><th>RL rewriter</th><th>RL advisor</th><th>RL rewriter + MC</th><th>RL advisor + MC</th></tr></thead><tbody>{datasetResults.map(row=><tr key={`${row.dataset}-${row.language}`}><th>{row.dataset}</th><td>{row.language}</td>{row.values.map((value,index)=><td key={index}><b>{value.toFixed(1)}</b>{index>0&&<small>+{(value-row.values[0]).toFixed(1)}</small>}</td>)}</tr>)}</tbody></table></div>
            <figcaption id="dataset-caption"><b>Table 4 | News-dataset transfer; paper Table 5.</b> Every setting contains 1,000 impressions and receives no additional training. MIND-Danish changes display language. EB-NeRD is a distinct Danish news dataset; the English version translates the same EB-NeRD slates.</figcaption>
          </figure>

          <figure className="evidence-figure robustness-figure" aria-labelledby="table-five-title academic-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 5 · Domain transfer</p><h3 id="table-five-title">Cross-domain transfer is harder, but remains substantial</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <p className="table-takeaway">On scientific-document selection, the MIND-trained advisor reaches 63.6%, compared with 42.7% for the prompt-only advisor and 32.7% for the RL-trained direct rewriter.</p>
            <div className="table-scroll"><table className="academic-table"><thead><tr><th>Condition</th><th>Method</th><th>Selection rate</th><th>Gain over original</th></tr></thead><tbody>{academicResults.map(row=>{const gain=Math.max(0,row.selection-9.9);return <tr key={`${row.group}-${row.method}`} className={row.method.includes("MiniCheck")?"constrained-row":""}><th>{row.group}</th><td>{row.method}</td><td className="score-bar-cell" style={{"--score":`${row.selection}%`} as React.CSSProperties}><b>{row.selection.toFixed(1)}</b></td><td className="score-bar-cell gain-score" style={{"--score":`${gain}%`} as React.CSSProperties}>{row.selection===9.9?"—":`+${gain.toFixed(1)} pp`}</td></tr>})}</tbody></table></div>
            <figcaption id="academic-caption"><b>Table 5 | Cross-domain academic transfer; paper Table 6.</b> Evaluation uses 1,000 impressions drawn from SciRepEval-derived scientific documents, with mean / maximum slate sizes of 9.29 / 10. The target agent is GPT-5-mini; all learned policies are trained only on English MIND, with no additional academic-domain training.</figcaption>
          </figure>
        </section>

        <section className="story-section resources" id="resources" aria-label="BibTeX citation">
          <div className="section-label">07 · BibTeX</div>
          <div className="citation"><div className="citation-body"><pre>{bibtex}</pre><button type="button" onClick={copyCitation}>{copied ? "Copied" : "Copy BibTeX"}</button></div></div>
        </section>
      </article>

      <footer className={`site-footer${creditsOpen ? " is-credits-open" : ""}`}>
        <div
          className="footer-credits-reveal"
          id="visual-sources-panel"
          aria-hidden={!creditsOpen}
        >
          <div className="footer-credits-panel">
            <div className="footer-credits-inner">
              <header className="footer-credits-heading">
                <p className="footer-credits-kicker">Image credits</p>
                <h2>Visual Sources &amp; Adaptations</h2>
                <p>Artwork records, rights notes, and the transformations used in the interactive method figure.</p>
              </header>

              <div className="visual-credits-grid">
                <article className="visual-credit">
                  <p className="visual-credit-role">01 · Advisor figure</p>
                  <h3><cite>Saint Jerome in his Study</cite></h3>
                  <p className="visual-credit-byline">Antonello da Messina · about 1475</p>
                  <dl>
                    <div><dt>Collection</dt><dd>The National Gallery, London · NG1418</dd></div>
                    <div><dt>Rights</dt><dd>Public-domain artwork; source scan marked Public Domain.</dd></div>
                    <div><dt>Adaptations</dt><dd>Cropped and isolated from the architectural setting; surrounding objects removed and reconstructed; transparent background, mirrored orientation, tonal adjustment, and animation added.</dd></div>
                  </dl>
                  <a
                    className="visual-credit-source"
                    href="https://commons.wikimedia.org/wiki/File:Antonello_da_Messina_-_St_Jerome_in_his_study_-_National_Gallery_London.jpg"
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={creditsOpen ? 0 : -1}
                  >View original source ↗</a>
                </article>

                <article className="visual-credit">
                  <p className="visual-credit-role">02 · Rewriter hands</p>
                  <h3>Hand-and-quill visual</h3>
                  <p className="visual-credit-byline">Generated and edited with ChatGPT · 2026</p>
                  <dl>
                    <div><dt>Collection</dt><dd>Not applicable</dd></div>
                    <div><dt>Rights</dt><dd>AI-assisted project visual; not presented as a public-domain artwork.</dd></div>
                    <div><dt>Adaptations</dt><dd>Background separated and tightly cropped; the second version adds puppet strings and ties, warmer color treatment, recomposition, and animation.</dd></div>
                  </dl>
                  <p className="visual-credit-source-unavailable">No external source record</p>
                </article>

                <article className="visual-credit">
                  <p className="visual-credit-role">03 · Chooser hand</p>
                  <h3>Pointing-hand asset</h3>
                  <p className="visual-credit-byline">AI-assisted extraction from a user-supplied image · 2026</p>
                  <dl>
                    <div><dt>Collection</dt><dd>Original artwork and institution unverified</dd></div>
                    <div><dt>Rights</dt><dd>Source license unverified; no public-domain claim is made.</dd></div>
                    <div><dt>Adaptations</dt><dd>Hand and sleeve isolated from the supplied image; background removed, edges retouched, tightly cropped, rotated, color-adjusted, and animated.</dd></div>
                  </dl>
                  <p className="visual-credit-source-unavailable">No reliable external source record</p>
                </article>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bar">
          <p><b>AgentBait</b> · UC Berkeley · 2026</p>
          <button
            type="button"
            className="footer-credits-toggle"
            aria-expanded={creditsOpen}
            aria-controls="visual-sources-panel"
            aria-label={creditsOpen ? "Close visual source credits" : "Open visual source credits"}
            onClick={() => setCreditsOpen((open) => !open)}
          >
            <span><b>Visual sources:</b> Selected visual elements are adapted from public-domain artworks. Full image credits and modification details are available <u>here</u>.</span>
            <span className="footer-credits-toggle-mark" aria-hidden="true">↑</span>
          </button>
          <a href="#paper">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
