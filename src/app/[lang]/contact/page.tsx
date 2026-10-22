import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { telUrl, whatsappUrl } from "@/lib/whatsapp";
import { PageIntro } from "@/components/PageIntro";
import { LeadForm } from "@/components/LeadForm";
import { Mail, Phone, Pin, WhatsApp } from "@/components/Icons";
import styles from "./contact.module.css";
import { MotionReady } from "@/components/motion/MotionReady";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata({ lang, route: "contact", title: t.meta.contact.title, description: t.meta.contact.description });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const c = t.contact;

  const channels = [
    {
      icon: <WhatsApp size={22} />,
      label: c.channels.whatsapp,
      value: t.common.cta.whatsapp,
      href: whatsappUrl(t.common.whatsapp.defaultMessage),
      external: true,
    },
    { icon: <Phone size={22} />, label: c.channels.phone, value: site.contact.phoneDisplay, href: telUrl },
    { icon: <Mail size={22} />, label: c.channels.email, value: site.contact.email, href: `mailto:${site.contact.email}` },
  ];

  return (
    <>
      <MotionReady />
      <PageIntro eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
      <section className={`container ${styles.grid}`} aria-label={c.title}>
        <ul className={styles.channels}>
          {channels.map((ch) => (
            <li key={ch.label}>
              <a
                href={ch.href}
                className={styles.channel}
                {...(ch.external ? { target: "_blank", rel: "noopener" } : {})}
              >
                <span className={styles.icon}>{ch.icon}</span>
                <span className={styles.channelText}>
                  <span className="mono muted">{ch.label}</span>
                  <span className={styles.value}>{ch.value}</span>
                </span>
              </a>
            </li>
          ))}
          <li className={styles.channel}>
            <span className={styles.icon}>
              <Pin size={22} />
            </span>
            <span className={styles.channelText}>
              <span className="mono muted">{c.channels.city}</span>
              <span className={styles.value}>
                {site.contact.address ? `${site.contact.address}, ` : ""}
                {site.contact.city}
              </span>
            </span>
          </li>
        </ul>

        <div className={`surface-light ${styles.form}`}>
          <h2 className="h3">{c.formTitle}</h2>
          <LeadForm lang={lang} t={t.form} whatsappDefault={t.common.whatsapp.defaultMessage} idPrefix="contact" />
        </div>
      </section>
    </>
  );
}
