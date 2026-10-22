"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

/** Path shown last; null until the first page has mounted. */
let lastPath: string | null = null;

/**
 * Re-mounted on every navigation: plays a green curtain wipe + content rise between pages.
 * The first page load is left untouched (fast first paint; the hero has its own entrance).
 */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  // Layout effect: the curtain is in place before the new page paints (no flash).
  useLayoutEffect(() => {
    const isNavigation = lastPath !== null && lastPath !== pathname;
    lastPath = pathname;
    if (!isNavigation || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Explicit from → to values + revert on cleanup: an interrupted run can never leave the page hidden.
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .set(curtain.current, { display: "grid", yPercent: 0 })
        .to(curtain.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" })
        .set(curtain.current, { display: "none" })
        .fromTo(
          content.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", clearProps: "transform,opacity" },
          0.45,
        );
    });
    return () => ctx.revert();
  }, [pathname]);

  return (
    <>
      <div ref={curtain} className="page-curtain" aria-hidden>
        <span className="page-curtain__logo">Wattdrive</span>
      </div>
      <div ref={content}>{children}</div>
    </>
  );
}
