import type { ReactNode } from "react";
import styles from "./PageIntro.module.css";

type Props = { eyebrow: string; title: string; lead?: string; children?: ReactNode; breadcrumb?: ReactNode };

export function PageIntro({ eyebrow, title, lead, children, breadcrumb }: Props) {
  return (
    <header className={`container ${styles.intro}`}>
      {breadcrumb}
      <p className="eyebrow reveal">{eyebrow}</p>
      <h1 className={`display ${styles.title}`}>{title}</h1>
      {lead ? <p className={`lead reveal reveal--3 ${styles.lead}`}>{lead}</p> : null}
      {children}
    </header>
  );
}
