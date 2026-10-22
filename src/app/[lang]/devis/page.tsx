import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/metadata";
import { QuoteConfigurator } from "@/components/quote/QuoteConfigurator";
import styles from "./devis.module.css";
import { MotionReady } from "@/components/motion/MotionReady";

export async function generateMetadata({ params }: PageProps<"/[lang]/devis">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({
    lang,
    route: "quote",
    title: t.meta.quote.title,
    description: t.meta.quote.description,
    image: { url: "/images/products/raedian-neo-original.webp", width: 1536, height: 1024, alt: "RAEDIAN NEO" },
  });
}

export default async function QuotePage({ params }: PageProps<"/[lang]/devis">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <div className={styles.page}>
      <MotionReady />
      <header className={`container ${styles.intro}`}>
        <p className="tag">{t.quote.eyebrow}</p>
        <h1 className={`display ${styles.title}`}>{t.quote.title}</h1>
        <p className="lead">{t.quote.lead}</p>
        <ul className={styles.badges}>
          {t.quote.badges.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </header>
      <QuoteConfigurator lang={lang} t={{ quote: t.quote, form: t.form, from: t.common.from }} />
    </div>
  );
}
