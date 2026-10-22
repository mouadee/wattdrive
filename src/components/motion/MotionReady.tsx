"use client";

import { useEffect } from "react";

/**
 * Rendered inside each page: its effect runs only once that page's tree has hydrated,
 * which is the earliest safe moment for GSAP to touch the page DOM.
 */
export function MotionReady() {
  useEffect(() => {
    (window as unknown as { __pageReady?: number }).__pageReady = Date.now();
    window.dispatchEvent(new Event("motion:ready"));
  }, []);
  return null;
}
