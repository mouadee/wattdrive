"use client";

import type { Attribution, LeadPayload } from "./leads";

const KEY = "wd_attribution";
const params = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

/** Remember the ad campaign that brought the visitor (first landing in this tab session). */
export function captureAttribution() {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const search = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const p of params) {
      const v = search.get(p);
      if (v) found[p] = v.slice(0, 200);
    }
    found.landing = window.location.pathname;
    sessionStorage.setItem(KEY, JSON.stringify(found));
  } catch {
    /* storage unavailable: attribution is optional */
  }
}

function readAttribution(): Attribution | undefined {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : undefined;
  } catch {
    return undefined;
  }
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export async function submitLead(payload: Omit<LeadPayload, "attribution">): Promise<boolean> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, attribution: readAttribution() }),
    });
    if (!res.ok) return false;
    // Meta Pixel integration point: fires only if the pixel script is installed on the site.
    window.fbq?.("track", "Lead", { content_name: payload.kind });
    return true;
  } catch {
    return false;
  }
}
