"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Timeline.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Vertical timeline whose line draws as you scroll; each step lights up when the line reaches it. */
export function Timeline({ steps }: { steps: { title: string; text: string }[] }) {
  const root = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el?.querySelectorAll("li").forEach((li) => li.setAttribute("data-on", ""));
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-line]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 60%", scrub: 0.5 } },
      );
      el.querySelectorAll<HTMLElement>("li").forEach((li) => {
        ScrollTrigger.create({
          trigger: li,
          start: "top 62%",
          onEnter: () => li.setAttribute("data-on", ""),
          onLeaveBack: () => li.removeAttribute("data-on"),
        });
        gsap.from(li.querySelector("[data-card]"), {
          x: 60,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: li, start: "top 80%", once: true },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <ol ref={root} className={styles.timeline}>
      <span className={styles.track} aria-hidden>
        <span className={styles.line} data-line />
      </span>
      {steps.map((s, i) => (
        <li key={s.title} className={styles.step}>
          <span className={styles.dot} aria-hidden>
            {i + 1}
          </span>
          <div className={styles.card} data-card>
            <span className={styles.num}>0{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
