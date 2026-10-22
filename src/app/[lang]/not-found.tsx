"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultLocale, isLocale, href } from "@/i18n/config";
import fr from "@/i18n/dictionaries/fr";
import en from "@/i18n/dictionaries/en";

export default function NotFound() {
  const segment = usePathname().split("/")[1] ?? "";
  const lang = isLocale(segment) ? segment : defaultLocale;
  const t = (lang === "en" ? en : fr).notFound;
  return (
    <section className="container" style={{ paddingBlock: "clamp(80px, 12vw, 180px)", display: "grid", gap: 24, justifyItems: "start" }}>
      <p className="eyebrow">404</p>
      <h1 className="h1">{t.title}</h1>
      <p className="lead">{t.text}</p>
      <Link href={href(lang, "home")} className="btn btn--primary">
        {t.back}
      </Link>
    </section>
  );
}
