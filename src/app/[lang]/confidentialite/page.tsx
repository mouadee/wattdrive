import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { MotionReady } from "@/components/motion/MotionReady";

export async function generateMetadata({ params }: PageProps<"/[lang]/confidentialite">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ lang, route: "privacy", title: t.meta.privacy.title, description: t.meta.privacy.description });
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/confidentialite">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const p = getDictionary(lang).privacy;

  return (
    <article className="container" style={{ maxWidth: "calc(760px + var(--gutter) * 2)", paddingBlock: "clamp(40px, 6vw, 96px) var(--section)" }}>
      <MotionReady />
      <h1 className="h1">{p.title}</h1>
      <p className="mono muted" style={{ marginTop: 20 }}>
        {p.updated}
      </p>
      <div style={{ display: "grid", gap: 36, marginTop: 48 }}>
        {p.sections.map((s) => (
          <section key={s.title} style={{ display: "grid", gap: 12, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <h2 className="h3">{s.title}</h2>
            <p style={{ color: "var(--ink-2)" }}>{s.body}</p>
          </section>
        ))}
        <section style={{ display: "grid", gap: 8, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
          <p>{p.contact}</p>
          <p>
            {site.name} — <a className="text-link" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </p>
        </section>
      </div>
    </article>
  );
}
