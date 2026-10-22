import { site } from "@/config/site";

/** Wordmark: plug mark on a green tile + name. Replace with the official logo file when available. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden focusable={false}>
        <rect width="34" height="34" rx="10" fill="#2a9a35" />
        <path d="M13 8.5v6M21 8.5v6M10.5 14.5h13v3.2a6.5 6.5 0 0 1-13 0v-3.2Z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <path d="M17 24.2v2.8" stroke="#86ec6c" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1.32rem",
          letterSpacing: "-0.04em",
        }}
      >
        {site.name}
      </span>
    </span>
  );
}
