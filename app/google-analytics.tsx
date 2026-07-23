"use client";

import Script from "next/script";

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const quotedMeasurementId = JSON.stringify(measurementId);
  const analyticsBootstrap = `
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    var measurementId = ${quotedMeasurementId};
    if (window.__agentbaitGaConfigured !== measurementId) {
      if (!window.__agentbaitGaInitialized) {
        window.gtag('js', new Date());
        window.__agentbaitGaInitialized = true;
      }
      window.gtag('config', measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
      window.__agentbaitGaConfigured = measurementId;
    }
  `;

  return (
    <>
      <Script
        id="agentbait-google-tag"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script id="agentbait-google-analytics" strategy="afterInteractive">
        {analyticsBootstrap}
      </Script>
    </>
  );
}
