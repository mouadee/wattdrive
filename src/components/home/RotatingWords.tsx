"use client";

import { useEffect, useState } from "react";
import styles from "./RotatingWords.module.css";

/**
 * Cycles through words with a vertical roll. Only the active word is ever visible (CSS default),
 * so the server render and no-JS fallback show the first word cleanly.
 */
export function RotatingWords({ words, className }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), 2600);
    return () => window.clearInterval(id);
  }, [words.length]);

  // Longest word reserves the width so the line never jumps.
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className={`${styles.wrap} ${className ?? ""}`}>
      <span className="sr-only">{words[0]}</span>
      <span className={styles.sizer} aria-hidden>
        {longest}
      </span>
      {words.map((w, i) => (
        <span
          key={w}
          aria-hidden
          className={styles.word}
          data-state={i === index ? "in" : i === (index - 1 + words.length) % words.length ? "out" : "idle"}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
