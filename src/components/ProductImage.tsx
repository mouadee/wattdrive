import Image from "next/image";
import type { Product } from "@/config/products";
import type { Locale } from "@/i18n/config";
import styles from "./ProductImage.module.css";

type Props = {
  product: Product;
  lang: Locale;
  sizes: string;
  preload?: boolean;
  /** "card" = fixed-ratio stage for grids, "hero" = taller stage for product pages, "thumb" for selectors. */
  variant?: "card" | "hero" | "thumb";
};

/**
 * Official product photo on a white stage. The image is always `contain`-fitted so the product's
 * proportions are never cropped or distorted. Max rendered width is capped to the source width
 * (the NORA file is small) so it never upscales blurry.
 */
export function ProductImage({ product, lang, sizes, preload, variant = "card" }: Props) {
  const { image } = product;
  return (
    <div className={`${styles.stage} ${styles[variant]}`}>
      <div
        className={styles.frame}
        style={{
          maxWidth: `min(100%, ${image.width}px)`,
          maxHeight: `min(100%, ${image.height}px)`,
          aspectRatio: `${image.width} / ${image.height}`,
        }}
      >
        <Image
          src={image.src}
          alt={image.alt[lang]}
          fill
          sizes={sizes}
          preload={preload}
          // Official files are small (≤40 KB) and served untouched: no recompression, exact colours.
          unoptimized
          className={styles.img}
        />
      </div>
    </div>
  );
}
