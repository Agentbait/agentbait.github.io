"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type AnalyticsConsent = "granted" | "denied" | null;

const consentStorageKey = "agentbait-analytics-consent";

type AnalyticsWindow = {
  [key: `ga-disable-${string}`]: boolean | undefined;
  gtag?: (...args: unknown[]) => void;
};

function updateGoogleConsent(
  analyticsWindow: AnalyticsWindow,
  nextConsent: Exclude<AnalyticsConsent, null>,
) {
  analyticsWindow.gtag?.("consent", "update", {
    analytics_storage: nextConsent,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const [consent, setConsent] = useState<AnalyticsConsent>(null);
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      let savedConsent: string | null = null;
      try {
        savedConsent = window.localStorage.getItem(consentStorageKey);
      } catch {
        // Storage can be unavailable in hardened browser modes.
      }
      if (savedConsent === "granted" || savedConsent === "denied") {
        const analyticsWindow = window as unknown as AnalyticsWindow;
        analyticsWindow[`ga-disable-${measurementId}`] = savedConsent === "denied";
        updateGoogleConsent(analyticsWindow, savedConsent);
        setConsent(savedConsent);
      }
      setHasLoadedPreference(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [measurementId]);

  if (!hasLoadedPreference) return null;

  const chooseConsent = (nextConsent: Exclude<AnalyticsConsent, null>) => {
    const analyticsWindow = window as unknown as AnalyticsWindow;
    analyticsWindow[`ga-disable-${measurementId}`] = nextConsent === "denied";
    updateGoogleConsent(analyticsWindow, nextConsent);
    try {
      window.localStorage.setItem(consentStorageKey, nextConsent);
    } catch {
      // The in-memory preference still applies for this visit.
    }
    setConsent(nextConsent);
  };

  const reopenConsent = () => {
    const analyticsWindow = window as unknown as AnalyticsWindow;
    analyticsWindow[`ga-disable-${measurementId}`] = true;
    updateGoogleConsent(analyticsWindow, "denied");
    try {
      window.localStorage.removeItem(consentStorageKey);
    } catch {
      // The in-memory preference still resets for this visit.
    }
    setConsent(null);
  };

  const quotedMeasurementId = JSON.stringify(measurementId);
  const analyticsBootstrap = `
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
    var measurementId = ${quotedMeasurementId};
    var disableKey = 'ga-disable-' + measurementId;
    if (window.__agentbaitGaConfigured !== measurementId || window[disableKey]) {
      window[disableKey] = false;
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
      {consent === "granted" ? (
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
      ) : null}

      {consent === null ? (
        <section
          className="analytics-consent"
          aria-label="Analytics consent"
          aria-live="polite"
        >
          <p>Google Analytics uses cookies to measure aggregate visits.</p>
          <div className="analytics-consent-actions">
            <button type="button" onClick={() => chooseConsent("denied")}>
              Decline
            </button>
            <button
              type="button"
              onClick={() => chooseConsent("granted")}
            >
              Allow
            </button>
          </div>
        </section>
      ) : (
        <button
          className="analytics-settings"
          type="button"
          onClick={reopenConsent}
          aria-label="Review analytics preference"
        >
          Analytics: {consent === "granted" ? "allowed" : "off"} · Change
        </button>
      )}
    </>
  );
}
