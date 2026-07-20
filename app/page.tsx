"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { flushSync } from "react-dom";

type MorphViewTransition = { finished: Promise<void> };
type MorphDocument = Document & { startViewTransition?: (update: () => void) => MorphViewTransition };

const codeUrl = "https://github.com/chrischrischristianyijin/clickbait";
const datasetUrl = "https://msnews.github.io/";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const assetUrl = (path: string) => `${basePath}${path}`;

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

function useStoryboardPlayback(ref: RefObject<HTMLElement | null>, setFlipped: (flipped: boolean) => void, playing: boolean) {
  const [stage, setStage] = useState<AttackStage>("candidate-set");
  const [showEditorHand, setShowEditorHand] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const elapsedRef = useRef(0);
  const stageRef = useRef<AttackStage>("candidate-set");
  const flippedRef = useRef(false);

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
        flippedRef.current = false;
        setFlipped(false);
      });
      return () => window.cancelAnimationFrame(reducedMotionFrame);
    }

    if (!isVisible || !playing) return;

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

      const nextFlipped = elapsed >= 14600 && elapsed < 19000;
      if (flippedRef.current !== nextFlipped) {
        flippedRef.current = nextFlipped;
        setFlipped(nextFlipped);
      }

      animationFrame = window.requestAnimationFrame(update);
    };

    animationFrame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isVisible, playing, setFlipped]);

  return { stage, showEditorHand };
}

export default function Home() {
  const demoRef = useRef<HTMLElement>(null);
  const heroAnimationRef = useRef<HTMLDivElement>(null);
  const [heroFlipped, setHeroFlipped] = useState(false);
  const [heroPlaying, setHeroPlaying] = useState(true);
  const { stage, showEditorHand } = useStoryboardPlayback(demoRef, setHeroFlipped, heroPlaying);
  const [copied, setCopied] = useState(false);
  const [paperGraph, setPaperGraph] = useState(false);

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

  useEffect(() => {
    const animationSurface = heroAnimationRef.current;
    if (!animationSurface || typeof animationSurface.getAnimations !== "function") return;
    animationSurface.getAnimations({ subtree: true }).forEach((animation) => {
      if (heroPlaying) animation.play();
      else animation.pause();
    });
  }, [heroPlaying]);

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
          <p className="standfirst">We rewrite one target item&apos;s title and abstract, then ask the same LLM chooser to select again from the same candidate list.</p>
          <div className="paper-identity">
            <div className="byline">
              <p><strong>Tianyi Jin</strong>, <strong>Zirui Wang</strong> and <strong>David M. Chan</strong></p>
              <p>University of California, Berkeley</p>
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
          <div className={`hero-flip-card ${heroFlipped ? "is-flipped" : ""} ${heroPlaying ? "" : "is-paused"}`}>
            <div ref={heroAnimationRef} className="hero-flip-inner">
              <div className="hero-flip-face hero-flip-front" aria-hidden={heroFlipped}>
                <CandidateStoryboard stage={stage} instanceId="hero" showEditorHand={showEditorHand} />
              </div>
              <div className="hero-flip-face hero-flip-back" aria-hidden={!heroFlipped}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetUrl("/agentbait-method.png")} alt="AgentBait pipeline showing a trainable advisor, frozen rewriter, fixed candidate list and target-agent selection reward." />
              </div>
            </div>
            <button
              type="button"
              className="playback-toggle"
              aria-label={heroPlaying ? "Pause hero animation" : "Play hero animation"}
              onClick={() => setHeroPlaying((current) => !current)}
            >
              <span className={`playback-icon ${heroPlaying ? "is-pause" : "is-play"}`} aria-hidden="true" />
            </button>
          </div>
          <div className="demo-caption">
            <p className="caption-question">Can rewriting a document make it more likely to be chosen over the same competitors?</p>
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
              <h2 id="setting-title">Same slate. One rewrite.<br />A different decision.</h2>
              <p>The candidate list has already been constructed. Only the target presentation may change.</p>
            </div>
          </div>
          <figure className={`slate-figure controlled-figure ${paperGraph ? "is-paper-graph" : ""}`} data-graph-view={paperGraph ? "paper" : "narrative"} aria-labelledby="setting-figure-title slate-caption">
            <div className="controlled-figure-head">
              <h3 className="experiment-thesis morph-copy" id="setting-figure-title">
                <span className="view-copy narrative-view-copy" aria-hidden={paperGraph}>Only the target text changes. The candidate set and chooser conditions remain fixed.</span>
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
            <div className="constant-ribbon">
              <div className="constant-ribbon-title"><span aria-hidden="true">×</span><b>Held constant across conditions</b></div>
              <ul><li>Candidate identity</li><li>Order</li><li>Slate size</li><li>Non-target text</li><li>Chooser prompt</li></ul>
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
              <span className="cross-panel-path strategy-path" aria-hidden="true"><i /></span>
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
                    <span className="advisor-input-boundary"><i>Advisor input</i></span>
                    <span className="target-extraction-trace"><i>Extract B</i></span>
                  </div>
                  <article className="advisor-target-document">
                    <small>Advisor input · target only</small>
                    <p><b>B</b><span>Target document</span></p>
                    <em>Title + abstract</em>
                  </article>
                </div>
                <p className="strategy-note"><span className="strategy-note-label morph-copy"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}>Strategy note</span><span className="view-copy paper-view-copy" aria-hidden={!paperGraph}>Strategy s</span></span><b><span className="strategy-initial">Increase specificity and narrative tension</span><span className="strategy-updated">Policy updated: sharpen specificity and narrative tension</span><span className="paper-strategy-formula" aria-hidden={!paperGraph}>s = specificity + narrative tension</span></b></p>
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
                  <span className="ink-bottle" aria-hidden="true" />
                  <div className="rewrite-hand-motion" aria-hidden="true">
                    <span className="strategy-control-tag">Advisor strategy</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="triptych-quill" src={assetUrl("/rewriter-hand-strings.png")} alt="" />
                  </div>
                  <div className="rewrite-transfer" aria-hidden="true"><span><b>B</b>Candidate B</span><i>››</i></div>
                </div>
              </section>

              <section className="triptych-panel selection-panel" aria-labelledby="selection-panel-title">
                <header><div className="panel-heading-line"><span>03 · Select</span><em className="training-state">Frozen</em></div><h4 className="morph-copy" id="selection-panel-title"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}>Same Chooser</span><span className="view-copy paper-view-copy" aria-hidden={!paperGraph}>Chooser</span></h4><p className="panel-description morph-copy"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}>Selects one item from the unchanged candidate slate.</span><span className="view-copy paper-view-copy" aria-hidden={!paperGraph}>Selects y from candidate slate C</span></p></header>
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
            <figcaption className="morph-copy" id="slate-caption"><span className="view-copy narrative-view-copy" aria-hidden={paperGraph}><b>Figure 2 | AgentBait system schematic.</b> The advisor and frozen rewriter receive only the extracted target document; only the chooser sees the full fixed slate. Candidate identity, order, list size, non-target text and chooser prompt are paired across conditions. Policy: Qwen3.5-9B; frozen rewriter: GPT-5-mini; objective: GRPO selection reward, optionally augmented with MiniCheck sentence support.</span><span className="view-copy paper-view-copy paper-graph-caption" aria-hidden={!paperGraph}><b>Figure 2.</b> Overview of our target-only advisor–rewriter setting.</span></figcaption>
          </figure>
        </section>

        <section className="story-section results" id="results" aria-labelledby="results-title">
          <div className="section-label">04 · Key findings</div>
          <div className="story-grid solo-grid">
            <div className="prose"><h2 id="results-title">Four conclusions from the controlled comparison</h2><p className="lead">Presentation changes decisions. Learned strategies transfer. Selection and factual quality can diverge, and constraints alter the policy itself.</p></div>
          </div>

          <div className="finding-summary" aria-label="Four principal findings">
            <article>
              <p className="finding-summary-kicker">Finding 1</p>
              <h3>Presentation alone changes agent decisions</h3>
              <div className="finding-shift" aria-label="Target selection increases from 17.1 percent for the original target to 34.8 percent with standalone rewriting"><span><b>17.1%</b><small>Original target</small></span><i aria-hidden="true">→</i><span className="outcome"><b>34.8%</b><small>Standalone rewriting</small></span></div>
              <p className="finding-summary-copy">The chooser moves before advisor training begins.</p>
            </article>
            <article>
              <p className="finding-summary-kicker">Finding 2</p>
              <h3>Learned advice produces strong, transferable selection strategies</h3>
              <div className="finding-shift" aria-label="Target selection increases from 17.1 percent for the original target to 98.5 percent with the trained advisor"><span><b>17.1%</b><small>Original target</small></span><i aria-hidden="true">→</i><span className="outcome"><b>98.5%</b><small>Trained advisor</small></span></div>
              <p className="finding-summary-copy">The learned strategies remain effective across target agents, languages and document domains.</p>
            </article>
            <article>
              <p className="finding-summary-kicker">Finding 3</p>
              <h3>Selection success and factual quality can diverge</h3>
              <div className="finding-equation" aria-label="More selected does not mean more faithful"><b>More selected</b><i aria-hidden="true">≠</i><b>more faithful</b></div>
              <p className="finding-summary-copy">Unconstrained optimization can discover unsupported shortcuts rather than better content.</p>
            </article>
            <article>
              <p className="finding-summary-kicker">Finding 4</p>
              <h3>Constraints change what the advisor learns, not merely how its outputs are scored.</h3>
              <div className="finding-equation" aria-label="Reward-only training differs from training with a factuality constraint"><b>Reward only</b><i aria-hidden="true">≠</i><b>reward + constraint</b></div>
              <p className="finding-summary-copy">Adding MiniCheck changes the learned strategy distribution, not only the final evaluation rubric.</p>
            </article>
          </div>

          <div className="transfer-strip"><span>The effect travels</span><ul><li>Across agents</li><li>Across languages</li><li>From news to scientific-paper selection</li></ul></div>

          <div className="finding-block">
            <header className="finding-heading"><span>Evidence table 1</span><h3 id="finding-one">Complete target-agent comparison</h3></header>
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
            <header className="finding-heading"><span>Evidence table 2</span><h3 id="finding-two">Selection can outrun source support</h3></header>
            <figure className="evidence-figure" aria-labelledby="support-results-caption">
              <div className="figure-heading"><div><p className="figure-number">Table 2</p><h3>Selection and source support under rewriting</h3></div><p className="metric-definition"><b>Metrics</b> Selection and support (0–100) ↑</p></div>
              <MetaLine items={[{label:"Dataset",value:"MIND · English"},{label:"Sample",value:"1,000 unseen impressions"},{label:"Chooser",value:"GPT-5-mini"},{label:"Support",value:"MiniCheck-Flan"},{label:"Baseline",value:"Original selection = 17.1%"}]} />
              <div className="table-scroll"><table className="support-table"><thead><tr><th>Condition</th><th>Target selected (%)</th><th>MiniCheck support (%)</th><th>Constraint</th></tr></thead><tbody>{supportResults.map(row=><tr key={row.method} className={row.constrained?"constrained-row":""}><th>{row.method}</th><td className="score-bar-cell" style={{"--score":`${row.selection}%`} as React.CSSProperties}><b>{row.selection.toFixed(1)}</b></td><td className="score-bar-cell score-bar-support" style={{"--score":`${row.support}%`} as React.CSSProperties}><b>{row.support.toFixed(1)}</b></td><td>{row.constrained?"MiniCheck":"None"}</td></tr>)}</tbody></table></div>
              <figcaption id="support-results-caption"><b>Table 2 | Factuality tradeoff on MIND-English.</b> Unconstrained RL produces the highest selection and lowest source support. MiniCheck recovers support while reducing selection.</figcaption>
            </figure>
          </div>
        </section>

        <section className="story-section transfer" aria-labelledby="transfer-title">
          <div className="section-label">05 · Robustness, transfer and failure</div>
          <div className="story-grid solo-grid"><div className="prose"><h2 id="transfer-title">Transfer across languages, news datasets and academic documents</h2><p>The English MIND-trained advisor is evaluated without additional training. Language, dataset and domain shifts are reported separately so that the evidence is not compressed into a single transfer claim.</p></div></div>

          <figure className="evidence-figure robustness-figure" aria-labelledby="language-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 3</p><h3>Cross-lingual transfer on fixed MIND slates</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <MetaLine items={[{label:"Training",value:"English MIND only"},{label:"Sample",value:"1,000 aligned impressions per language"},{label:"Advisor",value:"Qwen3.5-9B"},{label:"Rewriter / chooser",value:"GPT-5-mini"}]} />
            <div className="table-scroll"><table className="transfer-table language-table"><thead><tr><th>Language</th><th>Original</th><th>Prompt rewriter</th><th>Prompt advisor</th><th>RL rewriter</th><th>RL advisor</th><th>RL rewriter + MC</th><th>RL advisor + MC</th></tr></thead><tbody>{languageResults.map(row=><tr key={row.label} className={row.label==="Average"?"summary-row":""}><th>{row.label}</th>{row.values.map((value,index)=><td className="score-bar-cell" key={index} style={{"--score":`${value}%`} as React.CSSProperties}><b>{value.toFixed(1)}</b>{index>0&&<small>+{(value-row.values[0]).toFixed(1)}</small>}</td>)}</tr>)}</tbody></table></div>
            <figcaption id="language-caption"><b>Table 3 | Language transfer; paper Table 4.</b> The English row is the training language. Arabic, Spanish, Swahili, Turkish and Chinese preserve the same MIND rows, targets, candidate order and slate structure.</figcaption>
          </figure>

          <figure className="evidence-figure robustness-figure" aria-labelledby="dataset-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 4</p><h3>Transfer across news datasets</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <MetaLine items={[{label:"Training dataset",value:"MIND · English"},{label:"Evaluation",value:"1,000 impressions per setting"},{label:"Out-of-domain dataset",value:"EB-NeRD"},{label:"Protocol",value:"No additional training"}]} />
            <div className="table-scroll"><table className="transfer-table dataset-table"><thead><tr><th>Dataset</th><th>Language</th><th>Original</th><th>Prompt rewriter</th><th>Prompt advisor</th><th>RL rewriter</th><th>RL advisor</th><th>RL rewriter + MC</th><th>RL advisor + MC</th></tr></thead><tbody>{datasetResults.map(row=><tr key={`${row.dataset}-${row.language}`}><th>{row.dataset}</th><td>{row.language}</td>{row.values.map((value,index)=><td className="score-bar-cell" key={index} style={{"--score":`${value}%`} as React.CSSProperties}><b>{value.toFixed(1)}</b>{index>0&&<small>+{(value-row.values[0]).toFixed(1)}</small>}</td>)}</tr>)}</tbody></table></div>
            <figcaption id="dataset-caption"><b>Table 4 | News-dataset transfer; paper Table 5.</b> MIND-Danish changes display language. EB-NeRD is a distinct Danish news dataset; the English version translates the same EB-NeRD slates.</figcaption>
          </figure>

          <figure className="evidence-figure robustness-figure" aria-labelledby="academic-caption">
            <div className="figure-heading"><div><p className="figure-number">Table 5</p><h3>Transfer to academic document selection</h3></div><p className="metric-definition"><b>Metric</b> Target selected (%) ↑</p></div>
            <MetaLine items={[{label:"Dataset",value:"SciRepEval-derived scientific documents"},{label:"Sample",value:"1,000 impressions"},{label:"Mean / max slate",value:"9.29 / 10 candidates"},{label:"Target agent",value:"GPT-5-mini"},{label:"Training",value:"English MIND only"}]} />
            <div className="table-scroll"><table className="academic-table"><thead><tr><th>Condition</th><th>Method</th><th>Selection rate</th><th>Gain over original</th></tr></thead><tbody>{academicResults.map(row=>{const gain=Math.max(0,row.selection-9.9);return <tr key={`${row.group}-${row.method}`} className={row.method.includes("MiniCheck")?"constrained-row":""}><th>{row.group}</th><td>{row.method}</td><td className="score-bar-cell" style={{"--score":`${row.selection}%`} as React.CSSProperties}><b>{row.selection.toFixed(1)}</b></td><td className="score-bar-cell gain-score" style={{"--score":`${gain}%`} as React.CSSProperties}>{row.selection===9.9?"—":`+${gain.toFixed(1)} pp`}</td></tr>})}</tbody></table></div>
            <figcaption id="academic-caption"><b>Table 5 | Cross-domain academic transfer; paper Table 6.</b> The MIND-trained advisor reaches 63.6% selection without further academic-domain training; MiniCheck reduces selection to 47.3% while retaining a +37.4 point gain over original text.</figcaption>
          </figure>
        </section>

        <section className="story-section case-study" id="examples" aria-labelledby="example-title">
          <div className="section-label">06 · Examples as editorial redlines</div>
          <div className="story-grid solo-grid">
            <div className="prose"><h2 id="example-title">One airport story, two ways to win selection</h2><p>Both learned rewrites make the target selectable. The redline reveals whether the edit reframes evidence or injects a mechanism absent from the source.</p></div>
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

        <section className="story-section resources" id="resources" aria-label="Paper resources and citation">
          <div className="section-label">07 · Paper resources and citation</div>
          <div className="resource-links"><a href={assetUrl("/paper.pdf")}><span>Paper</span><b>Full manuscript · PDF</b><em>↗</em></a><a href={codeUrl} target="_blank" rel="noreferrer"><span>Code</span><b>Implementation and evaluation</b><em>↗</em></a><a href={datasetUrl} target="_blank" rel="noreferrer"><span>Dataset</span><b>MIND source dataset</b><em>↗</em></a><a href="#demo"><span>Demo</span><b>Replay Figure 1</b><em>↑</em></a></div>
          <details className="citation" open><summary><span>Citation</span><b>BibTeX</b></summary><div className="citation-body"><pre>{bibtex}</pre><button type="button" onClick={copyCitation}>{copied ? "Copied" : "Copy BibTeX"}</button></div></details>
        </section>
      </article>

      <footer><p><b>AgentBait</b> · UC Berkeley · 2026</p><p>This page is an editorial reading companion. Claims and numbers should be read with their stated experimental conditions.</p><a href="#paper">Back to top ↑</a></footer>
    </main>
  );
}
