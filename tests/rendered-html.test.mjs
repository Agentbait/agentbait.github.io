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

test("server-renders the AgentBait paper site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>You Won(?:&#x27;|')t Believe This Click \| AgentBait<\/title>/i);
  assert.match(html, /MIND \/ AGENT FEED/);
  assert.match(html, /17\.1%/);
  assert.match(html, /34\.8%/);
  assert.match(html, /98\.5%/);
  assert.match(html, /Selection is not usefulness/);
  assert.match(html, /\/agentbait-method\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships the paper, method figure, and social preview", async () => {
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/paper.pdf", import.meta.url)),
    access(new URL("../public/agentbait-method.png", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});
