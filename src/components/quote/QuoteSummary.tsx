"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isProductId, products } from "@/config/products";
import { formatAmount, pricing, type Estimate } from "@/config/pricing";
import type { Locale } from "@/i18n/config";
import type { QuoteLead } from "@/lib/leads";
import { Chevron } from "../Icons";
import type { QuoteT } from "./QuoteConfigurator";
import styles from "./Quote.module.css";

type Props = {
  t: QuoteT;
  lang: Locale;
  data: QuoteLead;
  estimate: Estimate;
  unlocked: boolean;
  step: number;
  sending: boolean;
  onUnlock: () => void;
  onEdit: (step: number) => void;
};

/** Animates a number towards its target (skipped with reduced motion). */
function useCountUp(target: number) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = from.current;
    if (reduce || start === target) {
      from.current = target;
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 650);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" strokeLinecap="round" />
    </svg>
  );
}

export function QuoteSummary({ t, data, estimate, unlocked, step, onUnlock, onEdit }: Props) {
  const s = t.quote.summary;
  const [open, setOpen] = useState(false);
  const product = isProductId(data.product) ? products[data.product] : null;
  const animatedTotal = useCountUp(unlocked ? estimate.total : 0);

  const stationName = product ? product.name : data.product === "advice" ? s.adviceStation : s.noStation;
  const serviceLines = estimate.lines.filter((l) => !product || l.id !== product.id);

  const lineList = (
    <ul className={styles.lineList}>
      {serviceLines.map((l) => (
        <li key={l.id}>
          <span>
            {l.label}
            {l.unit === "ml" ? <small> · {l.qty} m</small> : null}
          </span>
          <strong key={l.total} className={styles.bump}>
            {formatAmount(l.total)}
          </strong>
        </li>
      ))}
    </ul>
  );

  const totalBlock = unlocked ? (
    <div className={styles.totalRow} data-unlocked>
      <span>
        {s.total} <small>{pricing.vatLabel}</small>
      </span>
      <strong aria-live="polite">{estimate.complete ? formatAmount(animatedTotal) : s.onQuote}</strong>
    </div>
  ) : (
    <div className={styles.lock}>
      <span className={styles.lockIcon} data-wiggle>
        <LockIcon />
      </span>
      <p className={styles.lockTitle}>{s.locked}</p>
      <p className={styles.lockText}>{s.lockedText}</p>
      <div className={styles.lockBlur} aria-hidden>
        <span>{s.total}</span>
        <strong>00 000 DH</strong>
      </div>
      <button type="button" className="btn btn--primary btn--block" onClick={onUnlock}>
        {s.unlock}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop: persistent summary */}
      <aside className={styles.summary} aria-labelledby="summary-title">
        <div className={styles.sumInner}>
          <h2 id="summary-title" className={styles.sumTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M7 3h7l5 5v13H7z" strokeLinejoin="round" />
              <path d="M14 3v5h5M10 13h6M10 17h6" strokeLinecap="round" />
            </svg>
            {s.title}
          </h2>

          <div className={styles.sumProduct}>
            <div className={styles.sumThumb}>
              {product ? (
                <Image key={product.id} src={product.image.src} alt="" width={product.image.width} height={product.image.height} unoptimized className={styles.thumbImg} />
              ) : (
                <span aria-hidden className={styles.sumThumbEmpty}>
                  {data.product === "advice" ? "?" : "—"}
                </span>
              )}
            </div>
            <div className={styles.sumProductText}>
              <span className="small muted">{s.station}</span>
              <strong>{stationName}</strong>
              {product ? (
                <span key={product.id} className={`${styles.sumProductPrice} ${styles.bump}`}>
                  {formatAmount(product.startingPrice)}
                </span>
              ) : null}
            </div>
            {data.product && step !== 0 ? (
              <button type="button" className={styles.edit} onClick={() => onEdit(0)}>
                {t.quote.nav.edit}
                <span className="sr-only"> — {s.station}</span>
              </button>
            ) : null}
          </div>

          {lineList}
          {totalBlock}

          <p className={styles.noPayment}>{s.noPayment}</p>
          <p className={styles.sumNote}>{s.note}</p>
        </div>
      </aside>

      {/* Mobile: compact sticky summary */}
      <div className={styles.mobileSum} data-open={open}>
        <div id="mobile-summary" className={styles.mobileSheet} hidden={!open}>
          <p className="small muted">{stationName}</p>
          {lineList}
          {!unlocked ? (
            <button type="button" className="btn btn--primary btn--block" onClick={() => { setOpen(false); onUnlock(); }}>
              {s.unlock}
            </button>
          ) : null}
          <p className={styles.sumNote}>{s.note}</p>
        </div>
        <div className={styles.mobileBar}>
          <button
            type="button"
            className={styles.mobileToggle}
            aria-expanded={open}
            aria-controls="mobile-summary"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.mobileProduct}>
              <span className="small muted">
                {s.total} {pricing.vatLabel}
              </span>
              {unlocked && estimate.complete ? (
                <strong>{formatAmount(animatedTotal)}</strong>
              ) : (
                <strong className={styles.mobileLocked}>
                  <LockIcon /> {s.locked}
                </strong>
              )}
            </span>
            <span className={styles.mobileChevron}>
              <span className="sr-only">{open ? s.mobileClose : s.mobileToggle}</span>
              <Chevron />
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
