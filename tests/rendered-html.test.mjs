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
  assert.match(html, /MiniCheck/);
  assert.match(html, /grounded rewrite · support 31\.2/);
  assert.match(html, /Without MiniCheck/);
  assert.match(html, /With MiniCheck/);
  assert.match(html, /the target is selected both without and with MiniCheck/);
  assert.match(html, /The cards do not move\. The chooser does\./);
  assert.match(html, /Original baseline/);
  assert.doesNotMatch(html, /news-thumb/);
  assert.match(html, /Rewriting outcomes with and without MiniCheck/);
  assert.match(html, /4 of 8 candidates shown · order unchanged/);
  assert.doesNotMatch(html, /New chip design cuts data-center energy use/);
  assert.match(html, /AI-Driven/);
  assert.match(html, /Research question/);
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
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/paper.pdf", import.meta.url)),
    access(new URL("../public/agentbait-method.png", import.meta.url)),
  ]);
});
