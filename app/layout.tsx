import type { Metadata } from "next";
import "./globals.css";

const title = "You Won't Believe This Click | AgentBait";
const description = "An interactive research feature showing how one editorial rewrite can redirect an LLM agent within a fixed MIND-style news slate—and reduce source support.";
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const siteUrl = isGitHubPages
  ? "https://chrischrischristianyijin.github.io/agentbait-paper-website/"
  : "https://agentbait-paper.chrischrischrisjin.chatgpt.site/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
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
      <body>{children}</body>
    </html>
  );
}
