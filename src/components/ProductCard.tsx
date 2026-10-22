import Link from "next/link";
import { formatPrice, type Product } from "@/config/products";
import { href, type Locale } from "@/i18n/config";
import { fill, type Dictionary } from "@/i18n/dictionaries";
import { ProductImage } from "./ProductImage";
import { ArrowRight } from "./Icons";
import styles from "./ProductCard.module.css";

type Props = { product: Product; lang: Locale; t: Dictionary["common"]; index: number };

/** Dark showcase card: product on a glow, outlined power figure behind it, lime price. */
export function ProductCard({ product, lang, t }: Props) {
  const productHref = href(lang, "chargers", product.id);
  const short = product.name.replace("RAEDIAN ", "");
  return (
    <article className={styles.card} aria-labelledby={`card-${product.id}`}>
      <Link href={productHref} className={styles.media} tabIndex={-1} aria-hidden>
        <span className={styles.power} aria-hidden>
          {product.powerKw}kW
        </span>
        <span className={styles.glow} aria-hidden />
        <div className={styles.image}>
          <ProductImage product={product} lang={lang} sizes="(max-width: 900px) 80vw, 36vw" variant="card" />
        </div>
      </Link>

      <div className={styles.body}>
        <p className={styles.badge}>
          {product.powerKw} kW · RAEDIAN
        </p>
        <h3 id={`card-${product.id}`} className={styles.name}>
          <Link href={productHref}>{short}</Link>
        </h3>
        <p className={styles.tagline}>{product.tagline[lang]}</p>

        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.startingPrice)}</span>
          <span className={styles.priceNote}>{t.priceShort}</span>
        </div>

        <ul className="chips">
          {product.highlights[lang].map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Link href={`${href(lang, "quote")}?model=${product.id}`} className="btn btn--primary">
            {fill(t.cta.quoteFor, { product: short })} <ArrowRight />
          </Link>
          <Link href={productHref} className="btn btn--secondary">
            {t.cta.seeProduct}
          </Link>
        </div>
      </div>
    </article>
  );
}
