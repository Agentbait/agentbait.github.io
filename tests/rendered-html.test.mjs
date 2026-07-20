import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

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

function toPlainText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/(?:&#x27;|&#39;|&apos;)/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function sliceBetween(text, start, end) {
  const startIndex = text.indexOf(start);
  const endIndex = text.indexOf(end, startIndex + start.length);
  assert.ok(startIndex >= 0, `Missing section marker: ${start}`);
  assert.ok(endIndex > startIndex, `Missing or misordered marker: ${end}`);
  return text.slice(startIndex, endIndex);
}

test("server-renders the AgentBait research feature", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  const plainText = toPlainText(html);
  assert.match(html, /<title>You Won(?:&#x27;|')t Believe This Click \| AgentBait<\/title>/i);
  assert.match(html, /class="click-word"/);
  assert.match(html, /Complete the word Click/);
  assert.match(html, /class="click-placeholder">_<\/span>/);
  assert.doesNotMatch(html, /Click, selected/);
  assert.match(plainText, /01 · Agent-legible presentation effects/i);
  assert.doesNotMatch(plainText, /Does a better presentation become a different decision\?/);
  assert.match(plainText, /You Won't Believe This Cl\s+_\s+ck Content Rewriting for Agentic Choice/);
  assert.match(plainText, /We rewrite one target item's title and abstract, then ask the same LLM chooser to select again from the same candidate list\./);
  assert.doesNotMatch(plainText, /Target selection with a learned advisor/);
  assert.doesNotMatch(plainText, /We train an advisor to guide a frozen rewriter toward texts that an LLM agent is more likely to select/);
  assert.doesNotMatch(html, /Small textual rewrites can systematically manipulate LLM-based recommendation agents/);
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
  assert.doesNotMatch(plainText, /Research question/);
  assert.doesNotMatch(html, /Agent-mediated information access|Working paper · July 2026/);
  assert.doesNotMatch(html, /class="margin-note numbered-note"/);
  assert.match(html, /Examples as editorial redlines/);
  const abstractText = sliceBetween(plainText, "02 · Abstract", "03 · Interactive setting");
  const settingText = sliceBetween(plainText, "03 · Interactive setting", "04 · Key findings");
  const findingsText = sliceBetween(plainText, "04 · Key findings", "05 · Robustness, transfer and failure");
  assert.ok(plainText.indexOf("02 · Abstract") < plainText.indexOf("03 · Interactive setting"));
  assert.ok(plainText.indexOf("03 · Interactive setting") < plainText.indexOf("04 · Key findings"));
  assert.ok(plainText.indexOf("04 · Key findings") < plainText.indexOf("05 · Robustness, transfer and failure"));
  assert.ok(plainText.indexOf("05 · Robustness, transfer and failure") < plainText.indexOf("06 · Examples as editorial redlines"));
  assert.ok(plainText.indexOf("06 · Examples as editorial redlines") < plainText.indexOf("07 · Paper resources and citation"));
  assert.doesNotMatch(plainText, /07 · Methods/);
  assert.doesNotMatch(plainText, /How to read|Struck text is displaced source framing/);
  assert.doesNotMatch(plainText, /Strategy audit|unfaithful technical pivot/);

  const formalAbstractParts = [
    "Language models are increasingly used as agents to help humans decide what information is surfaced. This usage incentivizes content creators to optimize content in ways that appeal not only to humans, but also to agents that mediate access to them. In this paper, we study selection shifts induced by rewriting in agentic decision-making. Given a set of competing content snippets, we rewrite only one snippet while leaving the rest unchanged, and then measure how it impacts the agent's choice.",
    "We operationalize this setup with AgentBait, an advisor-rewriter framework in which the advisor learns to propose rewriting strategies and the rewriter revises the snippet. While a rewriter with a fixed prompt improves target snippet selection from 17.1% to 34.8%, our AgentBait raises its selection to 98.5%. We further show that the advisor trained with AgentBait effectively transfers to setups with different agents, languages, and snippets in other domains (e.g., scientific papers).",
    "However, higher target selection can reflect unsupported rewrites rather than better content. Adding a reward for support from the original snippet redirects the advisor toward more supported rewriting strategies, revealing a trade-off between factuality and target selection. Together, our results show that once agents mediate access to information, content can be rewritten to be chosen by the agent, even when selection and usefulness diverge.",
  ];
  for (const paragraph of formalAbstractParts) assert.ok(abstractText.includes(paragraph), `Formal Abstract paragraph is missing or altered: ${paragraph.slice(0, 70)}…`);
  assert.doesNotMatch(abstractText, /"Preference" refers only to observed choices under the same prompt and candidate list/);
  assert.doesNotMatch(abstractText, /Observed choice, not intrinsic quality/i);

  assert.match(settingText, /Same slate\. One rewrite\. Can the decision change\?/);
  assert.match(settingText, /The candidate list has already been constructed\. Only the target presentation may change\./);
  assert.match(html, /Only the target text changes\. The candidate set and chooser conditions remain fixed\./);
  assert.match(html, /data-graph-view="narrative"/);
  assert.match(html, /\/paper-method-transparent\.png/);
  assert.match(html, /AgentBait narrative pipeline: a target document is selected from a fixed candidate slate/);
  assert.match(html, /class="graph-view-toggle"/);
  assert.match(html, /Paper graph/);
  assert.match(html, /Advisor–rewriter setting/);
  assert.match(html, /πθ\(s \| xB\) · target only/);
  assert.match(html, /xB \+ s → x′B/);
  assert.match(html, /Target · Selected/);
  assert.match(html, /Overview of our target-only advisor–rewriter setting\./);
  assert.doesNotMatch(html, /Held constant across conditions|Slate size|Non-target text|Chooser prompt/);
  assert.match(html, /Advisor/);
  assert.match(html, /Rewriter/);
  assert.match(html, /Selection/);
  assert.match(html, /Strategy note/);
  assert.match(settingText, /Receives only the extracted target document and proposes a rewriting strategy\./);
  assert.match(settingText, /Applies the strategy to the target title and abstract only\./);
  assert.match(settingText, /Selects from the same candidate identities and order, with only the target rewritten\./);
  assert.match(settingText, /Advisor output · strategy s/);
  assert.match(html, /AgentBait process: read the target, edit it, then select from the fixed slate/);
  assert.match(html, /Outside advisor · fixed slate/);
  assert.match(html, /Advisor input · target only/);
  assert.match(html, /The advisor and frozen rewriter receive only the extracted target document; only the chooser sees the full fixed slate\./);
  assert.doesNotMatch(html, /advisor-candidates|Candidate set read by the advisor/);
  assert.match(html, /MiniCheck sentence support/);
  assert.match(settingText, /Selection outcome/);
  assert.match(settingText, /Reward/);
  assert.match(settingText, /GRPO updates the advisor policy/);
  assert.match(settingText, /01 · Target input Trained Advisor/);
  assert.match(settingText, /02 · Edit Frozen Frozen Rewriter/);
  assert.match(settingText, /03 · Select Frozen Same Chooser/);
  assert.doesNotMatch(settingText, /RL feedback loop|Rewriter · Frozen|Chooser · Frozen|Advisor · Trained/);
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
  const finding1 = sliceBetween(findingsText, "Finding 1", "Finding 2");
  const finding2 = sliceBetween(findingsText, "Finding 2", "Finding 3");
  const finding3 = sliceBetween(findingsText, "Finding 3", "Finding 4");
  const finding4 = sliceBetween(findingsText, "Finding 4", "Evidence table 1");
  assert.match(findingsText, /Four conclusions from the controlled comparison/);
  assert.match(finding1, /Presentation alone changes agent decisions/);
  assert.match(finding1, /17\.1%/);
  assert.match(finding1, /34\.8%/);
  assert.match(finding1, /Original target/);
  assert.match(finding1, /Standalone rewriting/);
  assert.match(finding1, /The chooser moves before any selection-based training\./);
  assert.match(finding2, /Learned advice produces strong, transferable selection strategies/);
  assert.match(finding2, /17\.1%/);
  assert.match(finding2, /98\.5%/);
  assert.match(finding2, /Trained advisor/);
  assert.match(finding2, /The learned strategies remain effective across target agents, languages and document domains\./);
  assert.match(finding3, /Selection success and source support can diverge/);
  assert.match(finding3, /More selected/);
  assert.match(finding3, /≠/);
  assert.match(finding3, /more faithful/);
  assert.match(finding3, /Unconstrained optimization can discover unsupported shortcuts rather than better content\./);
  assert.match(finding4, /Constraints change what the advisor learns, not merely how its outputs are scored\./);
  assert.match(finding4, /Selection reward/);
  assert.match(finding4, /selection reward \+ source-support reward/);
  assert.match(finding4, /Adding MiniCheck changes the learned strategy distribution, not merely how finished rewrites are scored\./);
  assert.doesNotMatch(findingsText, /The effect travels|Across agents|Across languages|From news to scientific-paper selection/i);
  assert.ok(findingsText.indexOf("Evidence table 1") < findingsText.indexOf("Target selection under original and rewritten presentations"));
  assert.ok(findingsText.indexOf("Evidence table 2") < findingsText.indexOf("Selection and source support under rewriting"));
  assert.doesNotMatch(html, /Full experimental table|collapse \/ expand/);
  assert.doesNotMatch(html, /A different decision|unchanged candidate slate|Policy updated: sharpen specificity|before advisor training begins|factual quality|reward \+ constraint|final evaluation rubric|Attack strategy 0[12]/i);
  assert.match(html, /Unconstrained strategy/);
  assert.match(html, /Support-aware strategy/);
  assert.match(html, /Table 2 \| Source-support tradeoff on MIND-English\./);
  assert.doesNotMatch(html, /What the experiment does not establish/);
  assert.doesNotMatch(html, /Evidence is conditional on exposure|Row-wise random choice is 16\.9%|All results remain fixed-slate target selection rates/);
  assert.doesNotMatch(html, /A post-retrieval presentation effect|Language-model agents increasingly mediate which documents users see/);
  assert.match(html, /Paper resources and citation/);
  assert.match(html, /16\.9%/);
  assert.match(html, /98\.5/);
  assert.match(html, /Copy BibTeX/);
  assert.match(html, /\/agentbait-method\.png/);
  assert.doesNotMatch(html, /Figure 5 \| Advisor–rewriter training loop/);
  assert.doesNotMatch(html, /Auto flip after replay|Auto return · replay again/);
  assert.match(html, /Pause hero animation/);
  assert.match(plainText, /Can rewriting a document make it more likely to be chosen over the same competitors\?/);
  assert.match(plainText, /A list of competing documents is shown to the target agent\. We choose one target document from the list and generate a rewriting strategy for only that document\./);
  assert.match(plainText, /A separate rewriting model then revises the target document's title and abstract, while all other documents in the list remain exactly the same\./);
  assert.match(plainText, /The target agent selects from this updated list, and whether the rewritten target document is selected is used to train the advisor\./);
  assert.equal((html.match(/class="playback-toggle"/g) || []).length, 1);
  assert.match(html, /id="hero-candidate-set-title"/);
  assert.doesNotMatch(html, /id="method-candidate-set-title"|interactive-method-figure|method-flip-card/);
  assert.doesNotMatch(html, /MIND \/ AGENT FEED|The main result|codex-preview|Your site is taking shape/i);
});

test("ships the manuscript and method figure", async () => {
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const globalStyles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(pageSource, /constant-ribbon/);
  assert.doesNotMatch(globalStyles, /\.constant-ribbon/);
  assert.doesNotMatch(pageSource, /transfer-strip/);
  assert.doesNotMatch(globalStyles, /\.transfer-strip/);
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
  assert.match(globalStyles, /@keyframes click-selected-cycle/);
  assert.doesNotMatch(globalStyles, /\.slate-flow\s*\{/);
  assert.match(globalStyles, /\.concept-triptych\s*\{/);
  assert.match(globalStyles, /\.triptych-panel\s*\{/);
  assert.match(globalStyles, /\.process-spine\s*\{/);
  assert.match(globalStyles, /\.abstract-layout\s*\{/);
  assert.match(globalStyles, /\.finding-summary\s*\{/);
  assert.match(globalStyles, /\.finding-summary\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/s);
  assert.match(globalStyles, /\.score-bar-cell\s*\{[^}]*--bar-fill:[^}]*linear-gradient\(90deg, var\(--bar-fill\) var\(--score\), transparent var\(--score\)\)/s);
  assert.match(globalStyles, /\.score-bar-support[^}]*\.academic-table \.constrained-row \.score-bar-cell[^}]*--bar-fill:\s*rgba\(54,113,90,\.16\)/s);
  assert.match(globalStyles, /\.transfer-table td:nth-last-child\(-n\+2\)\s*\{[^}]*background:\s*rgba\(54,113,90,\.07\)/s);
  assert.match(pageSource, /supportResults\.map[\s\S]*?row\.selection\}%[\s\S]*?row\.support\}%/);
  assert.match(pageSource, /languageResults\.map[\s\S]*?row\.values\.map\(\(value,index\)=><td key=\{index\}><b>/);
  assert.match(pageSource, /datasetResults\.map[\s\S]*?row\.values\.map\(\(value,index\)=><td key=\{index\}><b>/);
  assert.match(pageSource, /academicResults\.map[\s\S]*?`\$\{row\.selection\}%`[\s\S]*?`\$\{gain\}%`/);
  assert.doesNotMatch(globalStyles, /\.training-feedback\s*\{/);
  assert.match(globalStyles, /\.policy-feedback\s*\{/);
  assert.match(globalStyles, /\.reward-node\s*\{[^}]*min-width:\s*88px[^}]*min-height:\s*42px/s);
  assert.match(globalStyles, /\.reward-node b\s*\{[^}]*font-size:\s*23px/s);
  assert.match(globalStyles, /\.policy-feedback > p\s*\{[^}]*font-size:\s*12px/s);
  assert.match(globalStyles, /\.feedback-return\s*\{/);
  assert.match(globalStyles, /@keyframes feedback-signal-return/);
  assert.match(globalStyles, /@keyframes advisor-policy-flash/);
  assert.match(globalStyles, /\.scholar-fragment img\s*\{[^}]*animation:\s*advisor-reward-glow 9s ease-in-out infinite/s);
  assert.match(globalStyles, /@keyframes advisor-reward-glow\s*\{[\s\S]*?0%,95%,100%[\s\S]*?97%,99%[\s\S]*?rgba\(188,73,63,\.16\)[\s\S]*?rgba\(188,73,63,\.055\)/);
  assert.match(globalStyles, /\.cross-panel-path\s*\{/);
  assert.match(globalStyles, /@keyframes selection-pulse/);
  assert.match(globalStyles, /\.selection-beam\s*\{/);
  assert.doesNotMatch(globalStyles, /\.experiment-diagram\s*\{|\.candidate-panel\s*\{|\.intervention-panel\s*\{|\.reward-panel\s*\{/);
  assert.match(globalStyles, /font-size:\s*clamp\(48px, 4\.4vw, 70px\)/);
  assert.match(globalStyles, /min-height:\s*calc\(100svh - 62px\)/);
  assert.match(globalStyles, /grid-template-columns:\s*minmax\(400px, 2fr\) minmax\(600px, 3fr\)/);
  assert.match(pageSource, /When Marshawn Lynch Took the Pitch: An Inside Look/);
  assert.match(pageSource, /function InteractiveClickWord/);
  assert.match(pageSource, /onClick=\{completeWord\}/);
  assert.match(pageSource, /setTimeout\(\(\) => setSelectedVisible\(false\), 2600\)/);
  assert.match(pageSource, /className="click-letter"/);
  assert.ok(pageSource.indexOf('className="hero-feature"') < pageSource.indexOf('id="abstract"'));
  assert.ok(pageSource.indexOf('id="abstract"') < pageSource.indexOf('id="setting"'));
  assert.ok(pageSource.indexOf('id="setting"') < pageSource.indexOf('id="results"'));
  assert.doesNotMatch(pageSource, /story-section question|id="question"/);
  assert.doesNotMatch(pageSource, /text-cursor|selection-highlight|typed-title|ink-rewritten-title/);
  assert.match(pageSource, /editor-hand\.png/);
  assert.match(pageSource, /rewriter-hand-strings\.png/);
  assert.match(pageSource, /paper-method-transparent\.png/);
  assert.match(pageSource, /advisor-scholar\.png/);
  assert.match(pageSource, /selector-hand\.png/);
  assert.match(pageSource, /className="selector-hand-motion"/);
  assert.match(globalStyles, /\.scholar-fragment\s*\{[^}]*transform:\s*scaleX\(-1\)/s);
  assert.match(globalStyles, /\.selector-hand\s*\{[^}]*transform:\s*rotate\(90deg\)/s);
  assert.match(globalStyles, /@keyframes chooser-tap-up/);
  assert.doesNotMatch(globalStyles, /@keyframes chooser-nudge/);
  assert.doesNotMatch(pageSource, /screen-head|rank 02|preference ↑/);
  assert.match(pageSource, /className="selection-beam"/);
  assert.match(pageSource, /className="triptych-quill"/);
  assert.match(pageSource, /className="rewrite-hand-motion"/);
  assert.doesNotMatch(pageSource, /ink-bottle/);
  assert.doesNotMatch(globalStyles, /\.ink-bottle/);
  assert.match(pageSource, /Advisor strategy/);
  assert.doesNotMatch(pageSource, /rewrite-puppet|puppet-crossbar|puppet-string/);
  assert.doesNotMatch(globalStyles, /puppet-crossbar|puppet-string/);
  assert.match(globalStyles, /@keyframes rewriter-hand-left/);
  assert.match(globalStyles, /@keyframes strategy-control-signal/);
  assert.match(globalStyles, /\.paper-fragment::after\s*\{[^}]*right:\s*18px[^}]*transform-origin:\s*right/s);
  assert.doesNotMatch(globalStyles, /@keyframes strategy-travel/);
  assert.match(pageSource, /className="rewrite-transfer"/);
  assert.match(pageSource, /className="cross-panel-path strategy-path"/);
  assert.match(pageSource, /className="cross-panel-path rewrite-path"/);
  assert.match(pageSource, /className="selection-candidates"[\s\S]*Candidate A[\s\S]*className="selected-candidate"[\s\S]*Candidate B[\s\S]*Candidate C/);
  assert.match(pageSource, /className="feedback-origin"/);
  assert.match(pageSource, /className="policy-feedback"/);
  assert.match(pageSource, /className="upstream-slate"/);
  assert.match(pageSource, /className="advisor-target-document"/);
  assert.match(pageSource, /className="target-extraction-trace"/);
  assert.doesNotMatch(pageSource, /advisor-candidates|Candidate set read by the advisor/);
  assert.match(pageSource, /Reward[\s\S]*GRPO updates the advisor policy/);
  assert.match(pageSource, /className="training-state is-trained">Trained[\s\S]*id="advisor-panel-title">Advisor/);
  assert.match(pageSource, /className="training-state">Frozen[\s\S]*id="rewriter-panel-title">Frozen Rewriter/);
  assert.match(pageSource, /className="training-state">Frozen[\s\S]*id="selection-panel-title"[\s\S]*Same Chooser/);
  assert.doesNotMatch(pageSource, /className="training-feedback"|GRPO updates the advisor<\/li>/);
  assert.match(pageSource, /const \[paperGraph, setPaperGraph\] = useState\(false\)/);
  assert.match(pageSource, /data-graph-view=\{paperGraph \? "paper" : "narrative"\}/);
  assert.match(pageSource, /className="paper-method-view" aria-hidden=\{!paperGraph\}/);
  assert.match(pageSource, /className="system-graph-view" aria-hidden=\{paperGraph\}/);
  assert.match(pageSource, /aria-controls="setting-view-stage"/);
  assert.doesNotMatch(pageSource, /<iframe|<object/);
  assert.match(pageSource, /className="graph-view-toggle"/);
  assert.match(pageSource, /aria-pressed=\{paperGraph\}/);
  assert.match(pageSource, /onClick=\{togglePaperGraph\}/);
  assert.match(pageSource, /startViewTransition/);
  assert.match(pageSource, /flushSync\(updateGraph\)/);
  assert.equal((pageSource.match(/className="concept-triptych"/g) ?? []).length, 1);
  assert.match(globalStyles, /--morph-time:\s*760ms/);
  assert.match(globalStyles, /\.paper-method-view\s*\{[^}]*grid-template-rows:\s*0fr/s);
  assert.match(globalStyles, /\.system-graph-view\s*\{[^}]*grid-template-rows:\s*1fr/s);
  assert.match(globalStyles, /\.controlled-figure\.is-paper-graph \.paper-method-view\s*\{[^}]*grid-template-rows:\s*1fr/s);
  assert.match(globalStyles, /\.controlled-figure\.is-paper-graph \.system-graph-view\s*\{[^}]*grid-template-rows:\s*0fr/s);
  assert.match(globalStyles, /\.paper-method-artwork\s*\{[^}]*min-width:\s*880px/s);
  assert.match(globalStyles, /\.paper-method-figure\s*\{[^}]*background:\s*transparent[^}]*border:\s*0[^}]*box-shadow:\s*none/s);
  assert.match(globalStyles, /animation-play-state:\s*paused/);
  assert.match(globalStyles, /\.controlled-figure\.is-paper-graph \.triptych-panel/);
  assert.match(globalStyles, /\.controlled-figure\.is-paper-graph \.selection-candidates/);
  assert.match(globalStyles, /\.controlled-figure\.is-paper-graph \.policy-feedback/);
  assert.match(globalStyles, /@keyframes morph-connector-grow/);
  assert.match(globalStyles, /@keyframes advisor-slate-arrive/);
  assert.match(globalStyles, /@keyframes advisor-target-extract/);
  assert.match(globalStyles, /\.controlled-figure\.is-paper-graph \.advisor-target-document/);
  assert.match(globalStyles, /view-transition-name:\s*graph-advisor/);
  assert.match(globalStyles, /view-transition-name:\s*graph-advisor-target/);
  assert.match(globalStyles, /view-transition-name:\s*graph-paper-artwork/);
  assert.match(globalStyles, /::view-transition-group\(graph-feedback\)/);
  assert.match(pageSource, /TypewriterTitle/);
  assert.match(pageSource, /typewriter-char/);
  assert.match(pageSource, /\["final", 12600\]/);
  assert.doesNotMatch(pageSource, /completedFullEdit|\["final", 6100\]/);
  assert.match(pageSource, /Math\.min\(now - lastFrameTime, 100\)/);
  assert.match(pageSource, /\(elapsedRef\.current \+ frameDelta\) % 20000/);
  assert.match(pageSource, /elapsed >= 14600 && elapsed < 19000/);
  assert.match(pageSource, /requestAnimationFrame\(update\)/);
  assert.match(pageSource, /heroPlaying/);
  assert.match(pageSource, /className="playback-toggle"/);
  assert.match(pageSource, /getAnimations\(\{ subtree: true \}\)/);
  assert.match(pageSource, /animation\.pause\(\)/);
  assert.match(pageSource, /animation\.play\(\)/);
  assert.doesNotMatch(pageSource, /toggleHeroFigure|handleHeroFigureKeyDown|flip-cue|scheduleCycle/);
  assert.match(pageSource, /function useStoryboardPlayback[\s\S]*?const node = ref\.current/);
  assert.doesNotMatch(pageSource, /function useStoryboardPlayback[\s\S]*?const node = demoRef\.current/);
  assert.match(pageSource, /hero-flip-card/);
  assert.match(pageSource, /heroFlipped|hero-flip-back|rotateY\(180deg\)/);
  assert.doesNotMatch(pageSource, /methodReplayRef|methodStage|methodFlipped/);
  assert.match(globalStyles, /\.playback-toggle\s*\{/);
  assert.doesNotMatch(globalStyles, /\.flip-cue\s*\{/);

  const [, , narrativeMethod, editorHand, rewriterHand, advisorScholar, selectorHand] = await Promise.all([
    access(new URL("../public/paper.pdf", import.meta.url)),
    access(new URL("../public/agentbait-method.png", import.meta.url)),
    readFile(new URL("../public/paper-method-transparent.png", import.meta.url)),
    readFile(new URL("../public/editor-hand.png", import.meta.url)),
    readFile(new URL("../public/rewriter-hand-strings.png", import.meta.url)),
    readFile(new URL("../public/advisor-scholar.png", import.meta.url)),
    readFile(new URL("../public/selector-hand.png", import.meta.url)),
  ]);
  assert.equal(narrativeMethod[25], 6, "paper method figure must be an RGBA PNG with a transparent page background");
  assert.equal(narrativeMethod.readUInt32BE(16), 3782, "narrative method figure must preserve the PDF width at 144 dpi");
  assert.equal(narrativeMethod.readUInt32BE(20), 1416, "narrative method figure must preserve the PDF height at 144 dpi");
  const { data: methodPixels, info: methodInfo } = await sharp(narrativeMethod)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let transparentMethodPixels = 0;
  for (let offset = 3; offset < methodPixels.length; offset += methodInfo.channels) {
    if (methodPixels[offset] === 0) transparentMethodPixels += 1;
  }
  assert.ok(
    transparentMethodPixels / (methodInfo.width * methodInfo.height) > 0.5,
    "paper method figure must contain a genuinely transparent page background",
  );
  assert.equal(editorHand[25], 6, "editor hand must be an RGBA PNG");
  assert.equal(rewriterHand[25], 6, "rewriter hand with strings must be an RGBA PNG");
  assert.equal(advisorScholar[25], 6, "advisor scholar must be an RGBA PNG");
  assert.equal(selectorHand[25], 6, "selector hand must be an RGBA PNG");
});
