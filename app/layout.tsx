import type { Metadata } from "next";
import { GoogleAnalytics } from "./google-analytics";
import "./globals.css";
import {
  gaMeasurementId,
  googleSiteVerification,
  primarySiteUrl,
  siteUrl,
} from "./site-config";

const title = "You Won't Believe This Click | AgentBait";
const description = "An interactive research feature showing how one editorial rewrite can redirect an LLM agent within a fixed MIND-style news slate—and reduce source support.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: primarySiteUrl,
  },
  verification: googleSiteVerification
    ? { google: googleSiteVerification }
    : undefined,
  openGraph: {
    title,
    description,
    type: "website",
    images: ["og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        {gaMeasurementId ? (
          <GoogleAnalytics measurementId={gaMeasurementId} />
        ) : null}
      </body>
    </html>
  );
}
