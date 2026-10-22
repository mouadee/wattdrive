"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Site-wide scroll choreography (GSAP), run after the page content has hydrated:
 *  - [data-reveal]      blur + rise reveal, batched with stagger
 *  - [data-split]       headline words rise out of a mask
 *  - [data-parallax=n]  gentle scroll-linked drift (n = yPercent)
 *  - [data-count]       numbers count up when visible
 * Everything is skipped under prefers-reduced-motion (content shown as-is).
 */
export function RevealScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const start = () => {
      cleanup?.();
      cleanup = run();
    };
    // Wait for the page (not just the layout) to finish hydrating — see <MotionReady/>.
    window.addEventListener("motion:ready", start);
    if ((window as unknown as { __pageReady?: number }).__pageReady) start();
    return () => {
      window.removeEventListener("motion:ready", start);
      cleanup?.();
    };
  }, [pathname]);

  return <>{children}</>;
}

function run(): (() => void) | undefined {
  {
    const root = document.documentElement;
    (window as unknown as { __motion?: boolean }).__motion = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      root.classList.add("motion-off");
      return;
    }

    const ctx = gsap.context(() => {
      // Headlines: split into words, rise from a mask.
      document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        const split = SplitText.create(el, { type: "words,lines", mask: "lines", linesClass: "split-line" });
        gsap.from(split.words, {
          yPercent: 110,
          opacity: 0,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.04,
          scrollTrigger: { trigger: el, start: "top 94%", once: true },
          onComplete: () => split.revert(),
        });
        el.classList.add("is-split");
      });

      // Blocks: blur + rise, batched so siblings stagger.
      const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      gsap.set(blocks, { opacity: 0, y: 36, filter: "blur(4px)" });
      ScrollTrigger.batch(blocks, {
        start: "top 96%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.07,
            overwrite: true,
            clearProps: "filter",
          }),
      });

      // Parallax drift.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.to(el, {
          yPercent: Number(el.dataset.parallax) || -12,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 0.6 },
        });
      });

      // Count-ups.
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toLocaleString("fr-FR").replace(/\s/g, " ");
          },
        });
      });
    });

    // Fonts/images can shift layout after load: refresh trigger positions.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }
}
