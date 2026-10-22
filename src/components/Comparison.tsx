import Link from "next/link";
import { formatPrice, productList, specOrder } from "@/config/products";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import styles from "./Comparison.module.css";

type Props = { lang: Locale; t: Dictionary };

/** Side-by-side comparison. Only spec rows confirmed for at least one model are shown. */
export function Comparison({ lang, t }: Props) {
  const rows = specOrder.filter((key) => productList.some((p) => p.specs[key]));
  return (
    <div className={styles.wrap} role="region" aria-labelledby="compare-title" tabIndex={0}>
      <table className={styles.table}>
        <caption className="sr-only">{t.chargers.compare.title}</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.feature}>
              <span className="mono muted">{t.chargers.compare.feature}</span>
            </th>
            {productList.map((p) => (
              <th scope="col" key={p.id}>
                <Link href={href(lang, "chargers", p.id)} className={styles.product}>
                  {p.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{t.chargers.compare.price}</th>
            {productList.map((p) => (
              <td key={p.id}>
                <span className="muted small">{t.common.from} </span>
                <strong className={styles.price}>{formatPrice(p.startingPrice)}</strong>
              </td>
            ))}
          </tr>
          {rows.map((key) => (
            <tr key={key}>
              <th scope="row">{t.common.specs[key]}</th>
              {productList.map((p) => (
                <td key={p.id}>{p.specs[key]?.[lang] ?? <span className="muted">{t.chargers.compare.notListed}</span>}</td>
              ))}
            </tr>
          ))}
          <tr>
            <th scope="row">{t.chargers.compare.design}</th>
            {productList.map((p) => (
              <td key={p.id}>
                <ul className={styles.list}>
                  {p.highlights[lang].map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
          <tr>
            <th scope="row">{t.chargers.compare.applications}</th>
            {productList.map((p) => (
              <td key={p.id}>
                <ul className={styles.list}>
                  {p.applications.map((a) => (
                    <li key={a}>{t.common.applications[a]}</li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
