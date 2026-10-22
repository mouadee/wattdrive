import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { projects } from "@/config/projects";
import { pageMetadata } from "@/lib/metadata";
import { whatsappUrl } from "@/lib/whatsapp";
import { PageIntro } from "@/components/PageIntro";
import { ProjectLightbox } from "@/components/ProjectLightbox";
import { ArrowRight, WhatsApp } from "@/components/Icons";
import { MotionReady } from "@/components/motion/MotionReady";

export async function generateMetadata({ params }: PageProps<"/[lang]/realisations">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ lang, route: "projects", title: t.meta.projects.title, description: t.meta.projects.description });
}

export default async function ProjectsPage({ params }: PageProps<"/[lang]/realisations">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <MotionReady />
      <PageIntro eyebrow={t.projects.eyebrow} title={t.projects.title} lead={t.projects.lead} />
      <section className="container" aria-label={t.projects.title} style={{ paddingBottom: "var(--section)" }}>
        <ProjectLightbox items={projects} lang={lang} t={t.projects} />
      </section>
      <section className="section section--dark section--tight" aria-labelledby="projects-cta">
        <div
          className="container"
          style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <div style={{ display: "grid", gap: 16, maxWidth: "40rem" }}>
            <h2 id="projects-cta" className="h2">
              {t.projects.cta.title}
            </h2>
            <p className="lead" style={{ color: "var(--on-dark-2)" }}>
              {t.projects.cta.text}
            </p>
          </div>
          <div className="btn-row">
            <Link href={href(lang, "quote")} className="btn btn--light">
              {t.common.cta.quote} <ArrowRight />
            </Link>
            <a
              href={whatsappUrl(t.common.whatsapp.defaultMessage)}
              target="_blank"
              rel="noopener"
              className="btn btn--outline-light"
            >
              <WhatsApp /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
