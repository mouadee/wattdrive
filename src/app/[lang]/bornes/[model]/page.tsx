import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, isLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import { site } from "@/config/site";
import { formatPrice, isProductId, productList, products, specOrder } from "@/config/products";
import { pageMetadata } from "@/lib/metadata";
import { whatsappUrl } from "@/lib/whatsapp";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, WhatsApp } from "@/components/Icons";
import styles from "./product.module.css";
import { MotionReady } from "@/components/motion/MotionReady";

// Every locale × model is prerendered by generateStaticParams, so the page is already static;
// opting out of the generic-shell "instant" validation avoids a needless <Suspense> split.
export const instant = false;

export function generateStaticParams() {
  // Combined with the parent [lang] params by Next.js.
  return productList.map((p) => ({ model: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/bornes/[model]">): Promise<Metadata> {
  const { lang, model } = await params;
  if (!isLocale(lang) || !isProductId(model)) return {};
  const t = getDictionary(lang);
  const p = products[model];
  const values = { product: p.name, price: formatPrice(p.startingPrice) };
  return pageMetadata({
    lang,
    route: "chargers",
    rest: [p.id],
    title: fill(t.meta.product.title, values),
    description: fill(t.meta.product.description, values),
    image: { url: p.image.src, width: p.image.width, height: p.image.height, alt: p.image.alt[lang] },
  });
}

export default async function ProductPage({ params }: PageProps<"/[lang]/bornes/[model]">) {
  const { lang, model } = await params;
  if (!isLocale(lang) || !isProductId(model)) notFound();
  const t = getDictionary(lang);
  const p = products[model];
  const short = p.name.replace("RAEDIAN ", "");
  const specs = specOrder.filter((k) => p.specs[k]);
  const others = productList.filter((o) => o.id !== p.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    brand: { "@type": "Brand", name: "RAEDIAN" },
    image: new URL(p.image.src, site.url).toString(),
    description: p.summary[lang],
    offers: {
      "@type": "Offer",
      priceCurrency: "MAD",
      price: p.startingPrice,
      url: new URL(href(lang, "chargers", p.id), site.url).toString(),
      seller: { "@type": "Organization", name: site.name },
    },
  };

  return (
    <>
      <MotionReady />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={`container ${styles.top}`}>
        <nav aria-label="Breadcrumb" className={styles.crumbs}>
          <ol>
            <li>
              <Link href={href(lang, "home")}>{t.common.nav.home}</Link>
            </li>
            <li>
              <Link href={href(lang, "chargers")}>{t.product.breadcrumb}</Link>
            </li>
            <li aria-current="page">{short}</li>
          </ol>
        </nav>
      </div>

      <section className={`container ${styles.hero}`} aria-labelledby="product-title">
        <div className={styles.media}>
          <ProductImage product={p} lang={lang} sizes="(max-width: 900px) 92vw, 50vw" variant="hero" preload />
        </div>

        <div className={styles.info}>
          <span className="mono muted reveal">RAEDIAN · {p.powerKw} kW</span>
          <h1 id="product-title" className={`display ${styles.title}`}>
            {short}
          </h1>
          <p className={`lead reveal reveal--3 ${styles.tagline}`}>{p.tagline[lang]}</p>
          <p className={styles.summary}>{p.summary[lang]}</p>

          <div className={styles.buy}>
            <div className="price">
              <span className="price__label">{t.common.from}</span>
              <span className={`price__value ${styles.price}`}>{formatPrice(p.startingPrice)}</span>
            </div>
            <p className="small muted">{t.common.priceNote}</p>
            <div className={styles.ctas}>
              <Link href={`${href(lang, "quote")}?model=${p.id}`} className="btn btn--primary">
                {fill(t.common.cta.quoteFor, { product: short })} <ArrowRight />
              </Link>
              <a
                href={whatsappUrl(fill(t.common.whatsapp.productMessage, { product: p.name }))}
                target="_blank"
                rel="noopener"
                className="btn btn--whatsapp"
              >
                <WhatsApp /> WhatsApp
              </a>
            </div>
          </div>

          <div className={styles.block}>
            <h2 className="eyebrow eyebrow--plain">{t.product.highlights}</h2>
            <ul className={styles.list}>
              {p.highlights[lang].map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-label={t.product.specs}>
        <div className={`container ${styles.details}`} data-reveal>
          <div className={styles.detailCol}>
            <h2 className="h3">{t.product.specs}</h2>
            <dl className={styles.specs}>
              {specs.map((k) => (
                <div key={k}>
                  <dt>{t.common.specs[k]}</dt>
                  <dd>{p.specs[k]![lang]}</dd>
                </div>
              ))}
            </dl>
            <p className="small muted">
              {p.datasheet ? (
                <a href={p.datasheet} className="text-link" target="_blank" rel="noopener">
                  {t.product.datasheet}
                </a>
              ) : (
                t.product.specsMore
              )}
            </p>
          </div>

          <div className={styles.detailCol}>
            <h2 className="h3">{t.product.compatibility.title}</h2>
            <div className="prose muted">
              {t.product.compatibility.body.map((x) => (
                <p key={x}>{x}</p>
              ))}
            </div>
            <h2 className={`h3 ${styles.spaced}`}>{t.product.applications}</h2>
            <ul className={styles.tags}>
              {p.applications.map((a) => (
                <li key={a}>{t.common.applications[a]}</li>
              ))}
            </ul>
          </div>

          <aside className={styles.install}>
            <h2 className="h3">{t.product.install.title}</h2>
            <p className="muted">{t.product.install.text}</p>
            <Link href={`${href(lang, "quote")}?model=${p.id}`} className="btn btn--primary btn--block">
              {t.common.cta.quote} <ArrowRight />
            </Link>
          </aside>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="other-title">
        <div className="container">
          <h2 id="other-title" className={`eyebrow ${styles.otherTitle}`}>
            {t.product.other}
          </h2>
          <div className={styles.others}>
            {others.map((o) => (
              <ProductCard key={o.id} product={o} lang={lang} t={t.common} index={productList.indexOf(o)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
