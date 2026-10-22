// Global tokens/primitives first, so component CSS modules can refine them.
import "../globals.css";
import type { Metadata, Viewport } from "next";
import { Archivo, DM_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { site } from "@/config/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactDock } from "@/components/ContactDock";
import { RevealScope } from "@/components/Reveal";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });

// Both locales are prerendered; unknown locales 404. See note in bornes/[model]/page.tsx.
export const instant = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: `${t.meta.home.title} · ${site.name}`, template: `%s · ${site.name}` },
    description: t.meta.siteDescription,
    applicationName: site.name,
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#f5faf6",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={lang} className={`${archivo.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables reveal-on-scroll styles only when JS runs, so content is never hidden without it. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!window.__motion)d.classList.add('motion-off')},4000)",
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          {t.common.skipToContent}
        </a>
        <ScrollProgress />
        <Header
          lang={lang}
          t={{ nav: t.common.nav, language: t.common.language, cta: t.common.cta, whatsapp: t.common.whatsapp }}
        />
        <main id="main">
          <RevealScope>{children}</RevealScope>
        </main>
        <Footer lang={lang} t={t.common} />
        <ContactDock lang={lang} t={t.common} />
      </body>
    </html>
  );
}
