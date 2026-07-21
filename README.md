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

Website images live in `public/`. The deployable site is built with vinext for Cloudflare Workers-compatible hosting.

## GitHub Pages

The `main` branch deploys automatically to:

<https://chrischrischristianyijin.github.io/agentbait-paper-website/>

To verify the static export locally:

```bash
npm run build:pages
```

The generated GitHub Pages artifact is written to `out/`. The existing Sites deployment remains supported by `npm run build`.

## Traffic measurement and search visibility

The site supports Google Analytics 4, Google Search Console verification, a
canonical URL, `robots.txt`, and `sitemap.xml`. GA4 loads only after a visitor
allows analytics; advertising signals and ad personalization are disabled.

Copy `.env.example` to an ignored local environment file and provide:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-html-tag-content-token
```

For GitHub Pages, add the same names as repository variables. For Search
Console, add the exact Sites URL as a URL-prefix property and use the HTML tag
verification method.
