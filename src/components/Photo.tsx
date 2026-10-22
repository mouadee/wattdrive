import Image from "next/image";
import type { Photo as PhotoData } from "@/config/media";
import type { Locale } from "@/i18n/config";

type Props = {
  photo: PhotoData;
  lang: Locale;
  sizes: string;
  ratio?: string;
  preload?: boolean;
  className?: string;
  position?: string;
};

/** Cropped editorial photo in a fixed-ratio frame. */
export function Photo({ photo, lang, sizes, ratio = "4 / 5", preload, className, position }: Props) {
  return (
    <div className={["photo", className].filter(Boolean).join(" ")} style={{ aspectRatio: ratio }}>
      <Image
        src={photo.src}
        alt={photo.alt[lang]}
        fill
        sizes={sizes}
        preload={preload}
        quality={80}
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  );
}
