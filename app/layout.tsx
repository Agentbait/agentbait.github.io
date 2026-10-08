import type { Metadata } from "next";
import { GoogleAnalytics } from "./google-analytics";
import "./globals.css";
import {
  gaMeasurementId,
  googleSiteVerification,
  primarySiteUrl,
  siteUrl,
} from "./site-config";

const paperTitle = "You Won't Believe This Click: Content Rewriting for Agentic Choice";
const title = `AgentBait | ${paperTitle}`;
const description =
  "AgentBait is the UC Berkeley paper “You Won’t Believe This Click: Content Rewriting for Agentic Choice,” by Tianyi Jin, Zirui Wang, and David M. Chan. It studies how rewriting one item can shift language-model-mediated selection and the resulting factuality trade-off.";
const paperAbstract =
  "Language models are increasingly used as agents to help humans decide what information is surfaced. AgentBait studies selection shifts induced by rewriting in agentic decision-making: one competing content snippet is rewritten while the rest remain unchanged, and the resulting change in the agent's choice is measured. The advisor-rewriter framework learns rewriting strategies that transfer across agents, languages, news datasets, and scientific-document selection, while source-support experiments reveal a trade-off between target selection and factual support.";
const paperUrl = new URL("agentbait-paper.pdf", primarySiteUrl).toString();
const socialImageUrl = new URL("og.png", primarySiteUrl).toString();
const authors = [
  { name: "Tianyi Jin", url: "https://www.linkedin.com/in/chris-jin-680537299" },
  { name: "Zirui Wang", url: "https://zwcolin.github.io/" },
  { name: "David M. Chan", url: "https://dchan.cc/" },
];
const keywords = [
  "AgentBait",
  "You Won't Believe This Click",
  "content rewriting",
  "agentic choice",
  "language model agents",
  "LLM recommendation",
  "agent-mediated selection",
  "MIND dataset",
  "factuality",
];
const gtmId = "GTM-WSHC2PFG";
const regulatedConsentRegions = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
  "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT",
  "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];
const gtmConsentDefault = `
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  });
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    region: ${JSON.stringify(regulatedConsentRegions)}
  });
`;
const gtmBootstrap = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
const socialImage = {
  url: socialImageUrl,
  width: 1200,
  height: 630,
  alt: "AgentBait paper preview showing a fixed three-item candidate slate with only target B rewritten and selected.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "AgentBait",
  authors,
  creator: "Tianyi Jin, Zirui Wang, and David M. Chan",
  category: "Machine learning research",
  keywords,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: primarySiteUrl,
  },
  verification: googleSiteVerification
    ? { google: googleSiteVerification }
    : undefined,
  icons: {
    icon: [{ url: "favicon.png", type: "image/png", sizes: "64x64" }],
    shortcut: "favicon.png",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: primarySiteUrl,
    siteName: "AgentBait",
    publishedTime: "2026-07-19T00:00:00-07:00",
    modifiedTime: "2026-10-07T00:00:00-07:00",
    authors: authors.map((author) => author.url),
    section: "Machine Learning",
    tags: keywords,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

const organization = {
  "@type": "Organization",
  name: "University of California, Berkeley",
  url: "https://www.berkeley.edu/",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${primarySiteUrl}#website`,
      url: primarySiteUrl,
      name: "AgentBait",
      alternateName: ["AgentBait paper", paperTitle],
      description,
      inLanguage: "en",
    },
    {
      "@type": "WebPage",
      "@id": primarySiteUrl,
      url: primarySiteUrl,
      name: title,
      description,
      isPartOf: { "@id": `${primarySiteUrl}#website` },
      about: { "@id": `${primarySiteUrl}#paper` },
      primaryImageOfPage: { "@id": `${primarySiteUrl}#primaryimage` },
      inLanguage: "en",
    },
    {
      "@type": "ImageObject",
      "@id": `${primarySiteUrl}#primaryimage`,
      url: socialImageUrl,
      contentUrl: socialImageUrl,
      width: 1200,
      height: 630,
      caption: socialImage.alt,
    },
    {
      "@type": "ScholarlyArticle",
      "@id": `${primarySiteUrl}#paper`,
      url: primarySiteUrl,
      mainEntityOfPage: { "@id": primarySiteUrl },
      name: paperTitle,
      headline: paperTitle,
      alternateName: "AgentBait",
      description,
      abstract: paperAbstract,
      image: { "@id": `${primarySiteUrl}#primaryimage` },
      author: authors.map((author) => ({
        "@type": "Person",
        name: author.name,
        url: author.url,
        affiliation: organization,
      })),
      datePublished: "2026",
      dateModified: "2026-10-07",
      inLanguage: "en",
      isAccessibleForFree: true,
      keywords,
      about: [
        { "@type": "Thing", name: "Language model agents" },
        { "@type": "Thing", name: "Content rewriting" },
        { "@type": "Thing", name: "Agent-mediated selection" },
        { "@type": "Thing", name: "Factuality" },
      ],
      encoding: {
        "@type": "MediaObject",
        name: `${paperTitle} (PDF)`,
        contentUrl: paperUrl,
        encodingFormat: "application/pdf",
      },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="citation_title" content={paperTitle} />
        {authors.map((author) => (
          <meta key={author.name} name="citation_author" content={author.name} />
        ))}
        <meta name="citation_publication_date" content="2026" />
        <meta name="citation_pdf_url" content={paperUrl} />
        <link
          rel="alternate"
          type="application/pdf"
          href={paperUrl}
          title={`${paperTitle} (PDF)`}
        />
        <link
          rel="alternate"
          type="application/x-bibtex"
          href={new URL("citation.bib", primarySiteUrl).toString()}
          title="AgentBait BibTeX citation"
        />
        <link
          rel="alternate"
          type="text/plain"
          href={new URL("llms.txt", primarySiteUrl).toString()}
          title="AgentBait machine-readable research summary"
        />
        <script
          id="agentbait-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <script
          id="agentbait-google-consent-default"
          dangerouslySetInnerHTML={{ __html: gtmConsentDefault }}
        />
        <script
          id="google-tag-manager"
          dangerouslySetInnerHTML={{ __html: gtmBootstrap }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
        {gaMeasurementId ? (
          <GoogleAnalytics measurementId={gaMeasurementId} />
        ) : null}
      </body>
    </html>
  );
}
