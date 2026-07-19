import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "You Won't Believe This Click | AgentBait";
const description = "An evidence-led research feature on how content rewriting changes what language-model agents select from a fixed candidate list—and what that objective leaves out.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  let metadataBase = new URL("http://localhost:3000");

  try {
    metadataBase = new URL(`${protocol}://${host}`);
  } catch {
    // Keep a safe local base for malformed preview headers.
  }

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
