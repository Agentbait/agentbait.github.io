# AgentBait paper website

Project website for **You Won't Believe This Click: Content Rewriting for Agentic Choice** by Tianyi Jin, Zirui Wang, and David M. Chan.

The page presents the AgentBait advisor-rewriter framework, its main selection-rate results, transfer findings, and the trade-off between target selection and source support. Its visual system combines academic editorial redlines with a MIND / Microsoft Start-inspired recommendation feed.

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
node --test tests/rendered-html.test.mjs
```

The paper PDF and website images live in `public/`. The deployable site is built with vinext for Cloudflare Workers-compatible hosting.
