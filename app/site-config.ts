const githubPagesUrl = "https://agentbait.github.io/";
const sitesMirrorUrl =
  "https://agentbait-paper.chrischrischrisjin.chatgpt.site/";

export const primarySiteUrl = githubPagesUrl;

export const isGitHubPages = process.env.GITHUB_PAGES === "true";
export const siteUrl = isGitHubPages ? githubPagesUrl : sitesMirrorUrl;

function optionalEnvironmentValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function validGaMeasurementId(value: string | undefined) {
  const normalized = optionalEnvironmentValue(value);
  return normalized && /^G-[A-Z0-9]+$/.test(normalized)
    ? normalized
    : undefined;
}

export const gaMeasurementId = validGaMeasurementId(
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
);

export const googleSiteVerification = optionalEnvironmentValue(
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
);
