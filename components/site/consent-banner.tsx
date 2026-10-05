"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const CONSENT_KEY = "pushstream.analyticsConsent";

type ConsentChoice = "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function updateGoogleConsent(choice: ConsentChoice) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtagFallback(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("consent", "update", {
    analytics_storage: choice,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function ConsentBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    setVisible(!localStorage.getItem(CONSENT_KEY));
  }, [pathname]);

  if (!visible || pathname?.startsWith("/admin")) return null;

  function choose(choice: ConsentChoice) {
    localStorage.setItem(CONSENT_KEY, choice);
    updateGoogleConsent(choice);
    setVisible(false);
  }

  return (
    <div className="ps-consent-banner" role="dialog" aria-live="polite" aria-label="Analytics consent">
      <div>
        <strong>Analytics cookies</strong>
        <p>Help us understand which articles and tools are useful. No advertising personalization is enabled.</p>
      </div>
      <div className="ps-consent-actions">
        <button type="button" className="ps-consent-secondary" onClick={() => choose("denied")}>Decline</button>
        <button type="button" className="ps-consent-primary" onClick={() => choose("granted")}>Accept</button>
      </div>
    </div>
  );
}
