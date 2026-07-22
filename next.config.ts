import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH?.trim().replace(/\/$/, "") ?? "";

const nextConfig: NextConfig = {
  typescript: {
    tsconfigPath: isGitHubPages ? "tsconfig.pages.json" : "tsconfig.json",
  },
  ...(isGitHubPages
    ? {
        output: "export" as const,
        ...(githubPagesBasePath
          ? {
              basePath: githubPagesBasePath,
              assetPrefix: githubPagesBasePath,
            }
          : {}),
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
