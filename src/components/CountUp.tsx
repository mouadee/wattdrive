"use client";

import { useEffect, useRef, useState } from "react";

const format = (n: number) => n.toLocaleString("fr-FR").replace(/\s/g, "\u00a0");

/** Counts up to `value` once visible. Renders the final value on the server and with reduced motion. */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 1100);
        const eased = 1 - Math.pow(1 - p, 4);
        setN(Math.round(value * eased / 10) * 10);
        if (p < 1) raf = requestAnimationFrame(tick);
        else setN(value);
      };
      setN(0);
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(n)}
    </span>
  );
}
