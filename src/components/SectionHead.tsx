import type { ReactNode } from "react";
import styles from "./SectionHead.module.css";

type Props = {
  index?: string;
  eyebrow: string;
  title: string;
  lead?: string;
  aside?: ReactNode;
  as?: "h1" | "h2";
  id?: string;
};

/** Editorial section header: rule, index + eyebrow, large title left, lead right. */
export function SectionHead({ index, eyebrow, title, lead, aside, as: Tag = "h2", id }: Props) {
  return (
    <div className={styles.head}>
      <div className={styles.meta}>
        {index ? <span className={styles.index}>{index}</span> : null}
        <span className="eyebrow eyebrow--plain">{eyebrow}</span>
      </div>
      <Tag id={id} className={`${Tag === "h1" ? "h1" : "h2"} ${styles.title}`}>
        {title}
      </Tag>
      {lead || aside ? (
        <div className={styles.side}>
          {lead ? <p className="lead">{lead}</p> : null}
          {aside}
        </div>
      ) : null}
    </div>
  );
}
