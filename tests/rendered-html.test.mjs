import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the AgentBait research feature", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>You Won(?:&#x27;|')t Believe This Click \| AgentBait<\/title>/i);
  assert.match(html, /class="click-word"/);
  assert.match(html, /Complete the word Click/);
  assert.match(html, /class="click-placeholder">_<\/span>/);
  assert.doesNotMatch(html, /Click, selected/);
  assert.doesNotMatch(html, /Interactive Figure 1|Eleven-second fixed-set chooser replay|Auto play/);
  assert.doesNotMatch(html, /Scene [1-7] ·/);
  assert.match(html, /Automatically animated AgentBait fixed-slate comparison/);
  assert.doesNotMatch(html, /Run AgentBait|Replay AgentBait/);
  assert.match(html, /Candidate Set/);
  assert.match(html, /Three fixed MIND snippets/);
  assert.match(html, /Marshawn playing in charity soccer game went exactly as you/);
  assert.match(html, /Sofia Vergara and Joe Manganiello Celebrate/);
  assert.match(html, /The Coolest And Craziest McDonald/);
  assert.match(html, /Before/);
  assert.match(html, /Click B/);
  assert.match(html, /Click A/);
  assert.match(html, /MiniCheck/);
  assert.doesNotMatch(html, /The cards do not move\. The chooser does\./);
  assert.match(html, /class="hero-feature"/);
  assert.doesNotMatch(html, /news-thumb/);
  assert.doesNotMatch(html, /clearer framing|stronger relevance|same underlying content/i);
  assert.doesNotMatch(html, /Original baseline|Rewriting outcomes with and without MiniCheck/);
  assert.match(html, /Research question/);
  assert.doesNotMatch(html, /Agent-mediated information access|Working paper · July 2026/);
  assert.doesNotMatch(html, /class="margin-note numbered-note"/);
  assert.match(html, /Examples as editorial redlines/);
  assert.ok(html.indexOf("Research question") < html.indexOf("Key findings"));
  assert.ok(html.indexOf("Key findings") < html.indexOf("Robustness, transfer and failure"));
  assert.ok(html.indexOf("Robustness, transfer and failure") < html.indexOf("Experimental setting"));
  assert.ok(html.indexOf("Experimental setting") < html.indexOf("Examples as editorial redlines"));
  assert.match(html, /Only the target text changes\. The candidate set and chooser conditions remain fixed\./);
  assert.match(html, /Held constant across conditions/);
  assert.match(html, /Candidate identity/);
  assert.match(html, /Advisor/);
  assert.match(html, /Rewriter/);
  assert.match(html, /Selection/);
  assert.match(html, /Strategy note/);
  assert.match(html, /Ranks candidates and proposes a strategy/);
  assert.match(html, /Rewrites target B only/);
  assert.match(html, /Chooses one winner from the same fixed slate/);
  assert.match(html, /AgentBait process: read, edit, then select/);
  assert.match(html, /MiniCheck sentence support/);
  assert.match(html, /\/advisor-scholar\.png/);
  assert.match(html, /\/selector-hand\.png/);
  assert.match(html, /Cross-lingual transfer on fixed MIND slates/);
  assert.match(html, /Transfer across news datasets/);
  assert.match(html, /Transfer to academic document selection/);
  assert.match(html, /SciRepEval-derived scientific documents/);
  assert.match(html, /63\.6/);
  assert.match(html, /47\.3/);
  assert.match(html, /Target selection under original and rewritten presentations/);
  assert.doesNotMatch(html, /Cross-target-agent mismatch/);
  assert.match(html, /Selection and source support under rewriting/);
  assert.ok(html.indexOf("Finding 1") < html.indexOf("Target selection under original and rewritten presentations"));
  assert.ok(html.indexOf("Finding 2") < html.indexOf("Selection and source support under rewriting"));
  assert.doesNotMatch(html, /Full experimental table|collapse \/ expand/);
  assert.doesNotMatch(html, /What the experiment does not establish/);
  assert.doesNotMatch(html, /Evidence is conditional on exposure|Row-wise random choice is 16\.9%|All results remain fixed-slate target selection rates/);
  assert.doesNotMatch(html, /A post-retrieval presentation effect|Language-model agents increasingly mediate which documents users see/);
  assert.match(html, /Paper resources and citation/);
  assert.match(html, /16\.9%/);
  assert.match(html, /98\.5/);
  assert.match(html, /Copy BibTeX/);
  assert.match(html, /\/agentbait-method\.png/);
  assert.doesNotMatch(html, /Figure 5 \| Advisor–rewriter training loop/);
  assert.match(html, /Click to reveal training loop/);
  assert.match(html, /Show the advisor-rewriter training loop/);
  assert.match(html, /id="hero-candidate-set-title"/);
  assert.doesNotMatch(html, /id="method-candidate-set-title"|interactive-method-figure|method-flip-card/);
  assert.doesNotMatch(html, /MIND \/ AGENT FEED|The main result|codex-preview|Your site is taking shape/i);
});

test("ships the manuscript and method figure", async () => {
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const globalStyles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(globalStyles, /font-size:\s*[678]px/);
  assert.match(globalStyles, /--paper:\s*#f0eee8/);
  assert.match(globalStyles, /--navy:\s*#17344f/);
  assert.match(globalStyles, /--red:\s*#bc493f/);
  assert.match(globalStyles, /--red-pale:\s*#ecddd9/);
  assert.match(globalStyles, /--blue-pale:\s*#d9e0e2/);
  assert.match(globalStyles, /\.candidate-card\.is-selected\s*\{[^}]*var\(--red-pale\)[^}]*var\(--red\)/s);
  assert.match(globalStyles, /\.click-word\s*\{/);
  assert.match(globalStyles, /@keyframes click-letter-drop/);
  assert.match(globalStyles, /\.click-selected-note\s*\{/);
  assert.doesNotMatch(globalStyles, /\.slate-flow\s*\{/);
  assert.match(globalStyles, /\.concept-triptych\s*\{/);
  assert.match(globalStyles, /\.triptych-panel\s*\{/);
  assert.match(globalStyles, /\.process-spine\s*\{/);
  assert.match(globalStyles, /\.cross-panel-path\s*\{/);
  assert.match(globalStyles, /@keyframes selection-pulse/);
  assert.match(globalStyles, /\.selection-beam\s*\{/);
  assert.doesNotMatch(globalStyles, /\.experiment-diagram\s*\{|\.candidate-panel\s*\{|\.intervention-panel\s*\{|\.reward-panel\s*\{/);
  assert.match(globalStyles, /font-size:\s*clamp\(64px, 5\.2vw, 92px\)/);
  assert.match(globalStyles, /min-height:\s*calc\(100svh - 62px\)/);
  assert.match(globalStyles, /grid-template-columns:\s*minmax\(400px, 2fr\) minmax\(600px, 3fr\)/);
  assert.match(pageSource, /When Marshawn Lynch Took the Pitch: An Inside Look/);
  assert.match(pageSource, /function InteractiveClickWord/);
  assert.match(pageSource, /onClick=\{\(\) => setCompleted\(true\)\}/);
  assert.match(pageSource, /className="click-letter"/);
  assert.ok(pageSource.indexOf('className="hero-feature"') < pageSource.indexOf('className="story-section question"'));
  assert.doesNotMatch(pageSource, /text-cursor|selection-highlight|typed-title|ink-rewritten-title/);
  assert.match(pageSource, /editor-hand\.png/);
  assert.match(pageSource, /advisor-scholar\.png/);
  assert.match(pageSource, /selector-hand\.png/);
  assert.doesNotMatch(pageSource, /screen-head|rank 02|preference ↑/);
  assert.match(pageSource, /className="selection-beam"/);
  assert.match(pageSource, /className="triptych-quill"/);
  assert.match(pageSource, /className="rewrite-transfer"/);
  assert.match(pageSource, /className="cross-panel-path strategy-path"/);
  assert.match(pageSource, /className="cross-panel-path rewrite-path"/);
  assert.match(pageSource, /className="selection-candidates"[\s\S]*Candidate A[\s\S]*className="selected-candidate"[\s\S]*Candidate B[\s\S]*Candidate C/);
  assert.match(pageSource, /TypewriterTitle/);
  assert.match(pageSource, /typewriter-char/);
  assert.match(pageSource, /\["final", 12600\]/);
  assert.match(pageSource, /completedFullEdit/);
  assert.match(pageSource, /function useStoryboardPlayback[\s\S]*?const node = ref\.current/);
  assert.doesNotMatch(pageSource, /function useStoryboardPlayback[\s\S]*?const node = demoRef\.current/);
  assert.match(pageSource, /hero-flip-card/);
  assert.match(pageSource, /rotateY\(180deg\)|heroFlipped/);
  assert.doesNotMatch(pageSource, /methodReplayRef|methodStage|methodFlipped/);

  const [, , editorHand, advisorScholar, selectorHand] = await Promise.all([
    access(new URL("../public/paper.pdf", import.meta.url)),
    access(new URL("../public/agentbait-method.png", import.meta.url)),
    readFile(new URL("../public/editor-hand.png", import.meta.url)),
    readFile(new URL("../public/advisor-scholar.png", import.meta.url)),
    readFile(new URL("../public/selector-hand.png", import.meta.url)),
  ]);
  assert.equal(editorHand[25], 6, "editor hand must be an RGBA PNG");
  assert.equal(advisorScholar[25], 6, "advisor scholar must be an RGBA PNG");
  assert.equal(selectorHand[25], 6, "selector hand must be an RGBA PNG");
});
