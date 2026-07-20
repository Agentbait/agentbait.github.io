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
  assert.match(html, /Auto play/);
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
  assert.match(html, /The cards do not move\. The chooser does\./);
  assert.match(html, /class="hero-feature"/);
  assert.doesNotMatch(html, /news-thumb/);
  assert.doesNotMatch(html, /clearer framing|stronger relevance|same underlying content/i);
  assert.doesNotMatch(html, /Original baseline|Rewriting outcomes with and without MiniCheck/);
  assert.match(html, /Research question/);
  assert.doesNotMatch(html, /Agent-mediated information access|Working paper · July 2026/);
  assert.doesNotMatch(html, /class="margin-note numbered-note"/);
  assert.match(html, /Examples as editorial redlines/);
  assert.match(html, /Language and dataset transfer/);
  assert.match(html, /Target selection under original and rewritten presentations/);
  assert.match(html, /Cross-target-agent mismatch/);
  assert.match(html, /Selection and source support move on different axes/);
  assert.match(html, /What the experiment does not establish/);
  assert.match(html, /16\.9%/);
  assert.match(html, /98\.5/);
  assert.match(html, /Copy BibTeX/);
  assert.match(html, /\/agentbait-method\.png/);
  assert.doesNotMatch(html, /MIND \/ AGENT FEED|The main result|codex-preview|Your site is taking shape/i);
});

test("ships the manuscript and method figure", async () => {
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const globalStyles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(globalStyles, /font-size:\s*[678]px/);
  assert.match(globalStyles, /font-size:\s*clamp\(52px, 4\.5vw, 76px\)/);
  assert.match(globalStyles, /min-height:\s*calc\(100svh - 62px\)/);
  assert.match(globalStyles, /grid-template-columns:\s*minmax\(400px, 2fr\) minmax\(600px, 3fr\)/);
  assert.match(pageSource, /When Marshawn Lynch Took the Pitch: An Inside Look/);
  assert.ok(pageSource.indexOf('className="hero-feature"') < pageSource.indexOf('className="story-section question"'));
  assert.match(pageSource, /text-cursor/);
  assert.match(pageSource, /selection-highlight/);
  assert.match(pageSource, /setStage\("final"\), 11000/);

  await Promise.all([
    access(new URL("../public/paper.pdf", import.meta.url)),
    access(new URL("../public/agentbait-method.png", import.meta.url)),
  ]);
});
