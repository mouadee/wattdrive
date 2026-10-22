"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { products } from "@/config/products";
import type { ProjectSlot } from "@/config/projects";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { ArrowLeft, ArrowRight, Close } from "./Icons";
import styles from "./ProjectLightbox.module.css";

type Props = { items: ProjectSlot[]; lang: Locale; t: Dictionary["projects"] };

/** Masonry gallery of real installations with an accessible full-screen viewer (Esc, ←/→, swipe). */
export function ProjectLightbox({ items, lang, t }: Props) {
  const list = items.filter((p) => p.image);
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback((dir: number) => setOpen((i) => (i === null ? i : (i + dir + list.length) % list.length)), [list.length]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const current = open !== null ? list[open] : null;

  return (
    <>
      <ul className={styles.grid}>
        {list.map((p, i) => (
          <li key={p.id} className={styles.item} data-reveal>
            <button
              type="button"
              className={styles.thumb}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`${t.lightbox.open} — ${p.title?.[lang] ?? p.brief[lang]}`}
            >
              <Image src={p.image!.src} alt={p.brief[lang]} fill sizes="(max-width: 640px) 92vw, (max-width: 1100px) 46vw, 31vw" quality={80} />
              <span className={styles.caption}>
                <span className={styles.kind}>{t.kinds[p.kind]}</span>
                {p.title ? <strong>{p.title[lang]}</strong> : null}
                {p.product ? <span className={styles.model}>{products[p.product].name}</span> : null}
              </span>
              <span className={styles.zoom} aria-hidden>
                +
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className={styles.dialog}
        onClose={() => {
          setOpen(null);
          opener.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(null);
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
        aria-label={current?.title?.[lang] ?? ""}
      >
        {current ? (
          <div className={styles.viewer}>
            <div className={styles.frame} key={current.id}>
              <Image src={current.image!.src} alt={current.brief[lang]} fill sizes="90vw" quality={85} />
            </div>
            <div className={styles.bar}>
              <div>
                <strong>{current.title?.[lang]}</strong>
                <span>{t.lightbox.count.replace("{current}", String((open ?? 0) + 1)).replace("{total}", String(list.length))}</span>
              </div>
              <div className={styles.controls}>
                <button type="button" onClick={() => go(-1)} aria-label={t.lightbox.prev}>
                  <ArrowLeft />
                </button>
                <button type="button" onClick={() => go(1)} aria-label={t.lightbox.next}>
                  <ArrowRight />
                </button>
                <button type="button" onClick={() => setOpen(null)} aria-label={t.lightbox.close} autoFocus>
                  <Close />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
