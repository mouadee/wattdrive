"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { formatPrice, isProductId, products, productList } from "@/config/products";
import { clampCable, computeEstimate, formatAmount, pricing, serviceIds } from "@/config/pricing";
import { moroccanCities } from "@/config/site";
import { href, type Locale } from "@/i18n/config";
import { fill, type Dictionary } from "@/i18n/dictionaries";
import { clearError, hasErrors, validateQuoteStep, type Errors, type QuoteLead } from "@/lib/leads";
import { submitLead } from "@/lib/submit";
import { whatsappUrl } from "@/lib/whatsapp";
import { ProductImage } from "../ProductImage";
import { ChoiceGroup, CityField, Consent, Honeypot, SelectField, TextField, focusFirstInvalid } from "../form/Fields";
import { ArrowLeft, ArrowRight, Check, WhatsApp } from "../Icons";
import { QuoteSummary } from "./QuoteSummary";
import styles from "./Quote.module.css";
import formStyles from "../form/Form.module.css";

export type QuoteT = {
  quote: Dictionary["quote"];
  form: Dictionary["form"];
  from: string;
};

const DRAFT_KEY = "wd_quote_draft_v3";
const LAST_STEP = 1;

const empty: QuoteLead = {
  product: "",
  services: serviceIds.join(","),
  cableLength: String(pricing.cable.default),
  housing: "house",
  city: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  contactMethod: "whatsapp",
};

function quoteNumber() {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `WD-${stamp}-${Math.floor(1000 + Math.random() * 9000)}`;
}

const opts = (o: Record<string, string>) => Object.entries(o).map(([value, label]) => ({ value, label }));

export function QuoteConfigurator({ lang, t }: { lang: Locale; t: QuoteT }) {
  const q = t.quote;
  const [data, setData] = useState<QuoteLead>(empty);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "success">("idle");
  const [focusTick, setFocusTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [number, setNumber] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const stepChanged = useRef(false);
  const [dir, setDir] = useState<"next" | "back">("next");

  // Restore a draft (same tab session) and honour ?model=nora|neo|advice from product pages.
  useEffect(() => {
    let next = empty;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) next = { ...empty, ...(JSON.parse(raw) as Partial<QuoteLead>) };
    } catch {
      /* ignore */
    }
    const model = new URLSearchParams(window.location.search).get("model");
    if (model && (isProductId(model) || model === "advice")) next = { ...next, product: model };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore after mount
    setData(next);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || status === "success") return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, hydrated, status]);

  useEffect(() => {
    if (focusTick) focusFirstInvalid(formRef.current);
  }, [focusTick]);

  useEffect(() => {
    if (!stepChanged.current) return;
    stepChanged.current = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    if (status === "success") {
      window.scrollTo({ top: 0 });
      doneRef.current?.focus({ preventScroll: true });
    }
  }, [status]);

  const set = (key: keyof QuoteLead) => (value: string) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => clearError(e, key));
  };
  const err = (key: string) => (errors[key] ? t.form.errors[errors[key]!] : undefined);

  const selectedServices = useMemo(() => data.services.split(",").filter(Boolean), [data.services]);
  const toggleService = (id: string) =>
    set("services")(
      (selectedServices.includes(id) ? selectedServices.filter((s) => s !== id) : [...selectedServices, id]).join(","),
    );

  const estimate = useMemo(
    () => computeEstimate({ product: data.product, services: selectedServices, cableLength: Number(data.cableLength) }, lang),
    [data.product, selectedServices, data.cableLength, lang],
  );
  const unlocked = status === "success";
  const meters = clampCable(Number(data.cableLength));

  function goTo(target: number) {
    stepChanged.current = true;
    setDir(target >= step ? "next" : "back");
    setErrors({});
    setStep(target);
    setReached((r) => Math.max(r, target));
  }

  /** Validate steps before `target`; stop on the first invalid one. */
  function advanceTo(target: number) {
    for (let i = 0; i < target; i++) {
      const found = validateQuoteStep(i, data, consent);
      if (hasErrors(found)) {
        if (i !== step) goTo(i);
        setErrors(found);
        setFocusTick((n) => n + 1);
        return;
      }
    }
    goTo(target);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < LAST_STEP) {
      advanceTo(step + 1);
      return;
    }
    for (let i = 0; i <= LAST_STEP; i++) {
      const found = validateQuoteStep(i, data, consent);
      if (hasErrors(found)) {
        if (i !== step) goTo(i);
        setErrors(found);
        setFocusTick((n) => n + 1);
        return;
      }
    }
    setStatus("sending");
    const ok = await submitLead({ kind: "quote", lang, data, consent, website: honeypot });
    if (ok) {
      setNumber(quoteNumber());
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
    }
    setStatus(ok ? "success" : "error");
  }

  const selected = isProductId(data.product) ? products[data.product] : null;
  const s1 = q.step1;
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const housing = data.housing ? s1.housingOptions[data.housing as keyof typeof s1.housingOptions] : "";
  const station = selected
    ? `${selected.name} (${t.from} ${formatPrice(selected.startingPrice)})`
    : data.product === "advice"
      ? q.summary.adviceStation
      : "";

  const sep = lang === "fr" ? " : " : ": ";
  const whatsappMessage = () => {
    const m = q.whatsappMessage;
    return [
      m.intro,
      number ? `${m.number}${sep}${number}` : "",
      "",
      `${m.station}${sep}${station}`,
      data.city && `${m.city}${sep}${data.city}`,
      housing && `${m.housing}${sep}${housing}`,
      `${m.cable}${sep}${meters} m`,
      unlocked && estimate.complete && `${m.total}${sep}${formatAmount(estimate.total)} ${pricing.vatLabel}`,
      fullName && `${m.name}${sep}${fullName}`,
    ]
      .filter((l): l is string => typeof l === "string")
      .join("\n");
  };

  async function downloadPdf() {
    setPdfBusy(true);
    try {
      const { downloadQuotePdf } = await import("@/lib/quotePdf");
      await downloadQuotePdf({
        lang,
        t: q,
        number: number || quoteNumber(),
        product: selected,
        estimate,
        client: { name: fullName, phone: data.phone, email: data.email, city: data.city },
        housing,
        cableMeters: meters,
      });
    } finally {
      setPdfBusy(false);
    }
  }

  /* ---------- Confirmation ---------- */
  if (status === "success") {
    const c = q.confirmation;
    return (
      <div className={`container ${styles.done}`}>
        <div className={styles.confetti} aria-hidden>
          {Array.from({ length: 28 }, (_, i) => (
            <i key={i} style={{ ["--i" as string]: i }} />
          ))}
        </div>
        <div className={styles.doneMain}>
          <span className={styles.doneIcon} aria-hidden>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path className={styles.checkPath} d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="eyebrow">
            {c.eyebrow} · {number}
          </p>
          <h2 ref={doneRef} tabIndex={-1} className={`h1 ${styles.doneTitle}`}>
            {fill(c.title, { name: data.firstName })}
          </h2>
          <p className="lead">
            {fill(c.text, { method: data.contactMethod === "phone" ? c.methodPhone : c.methodWhatsapp })}
          </p>

          <div className="btn-row">
            <button type="button" className={`btn btn--primary ${styles.pdfBtn}`} onClick={downloadPdf} disabled={pdfBusy}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {pdfBusy ? c.downloading : c.download}
            </button>
            <a href={whatsappUrl(whatsappMessage())} target="_blank" rel="noopener" className="btn btn--whatsapp">
              <WhatsApp /> {c.whatsappCta}
            </a>
          </div>

          <div className={styles.doneSteps}>
            <p className="eyebrow eyebrow--plain">{c.next}</p>
            <ol>
              {q.pdf.steps.map((s, i) => (
                <li key={s.title} style={{ ["--i" as string]: i }}>
                  <span>{i + 1}</span>
                  <strong>{s.title}</strong>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="btn-row">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setData(empty);
                setConsent(false);
                setStep(0);
                setReached(0);
                setStatus("idle");
              }}
            >
              {c.newRequest}
            </button>
            <Link href={href(lang, "home")} className="btn btn--secondary">
              {c.backHome}
            </Link>
          </div>
        </div>

        <aside className={styles.doneRecap} aria-labelledby="recap-title">
          <h2 id="recap-title" className="eyebrow eyebrow--plain">
            {q.summary.title}
          </h2>
          <ul className={styles.lineList}>
            {estimate.lines.map((l) => (
              <li key={l.id}>
                <span>
                  {l.label}
                  {l.unit === "ml" ? <small> · {l.qty} m</small> : null}
                </span>
                <strong>{formatAmount(l.total)}</strong>
              </li>
            ))}
          </ul>
          <div className={styles.totalRow}>
            <span>
              {q.summary.total} <small>{pricing.vatLabel}</small>
            </span>
            <strong>{estimate.complete ? formatAmount(estimate.total) : q.summary.onQuote}</strong>
          </div>
          <p className="small muted">{q.summary.note}</p>
        </aside>
      </div>
    );
  }

  /* ---------- Configurator ---------- */
  const total = q.steps.length;

  return (
    <div className={`container ${styles.layout}`}>
      <div className={styles.main} ref={topRef}>
        <nav aria-label={q.progressLabel} className={styles.progress}>
          <p className="sr-only" aria-live="polite">
            {fill(q.stepOf, { current: step + 1, total })} — {q.steps[step]}
          </p>
          <ol>
            {q.steps.map((label, i) => {
              const state = i === step ? "current" : i <= reached ? "done" : "todo";
              const canJump = i !== step && i <= reached;
              const content = (
                <>
                  <span className={styles.progressNum}>{state === "done" ? <Check size={14} /> : i + 1}</span>
                  <span className={styles.progressLabel}>{label}</span>
                </>
              );
              return (
                <li key={label} data-state={state} aria-current={i === step ? "step" : undefined}>
                  {canJump ? (
                    <button type="button" onClick={() => goTo(i)} className={styles.progressBtn}>
                      {content}
                    </button>
                  ) : (
                    <span className={styles.progressBtn}>{content}</span>
                  )}
                </li>
              );
            })}
          </ol>
          <div className={styles.progressBar} aria-hidden>
            <span style={{ transform: `scaleX(${(step + 1) / total})` }} />
          </div>
        </nav>

        <form ref={formRef} id="quote-form" onSubmit={onSubmit} noValidate className={styles.form}>
          <div key={step} className={styles.stepPanel} data-dir={dir}>
            <div className={styles.stepHead}>
              <span className={styles.stepBadge} aria-hidden>
                {step + 1}
              </span>
              <div>
                <h2 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
                  {q.stepTitles[step]}
                </h2>
                <p className="muted">{q.stepLeads[step]}</p>
              </div>
            </div>

            {hasErrors(errors) ? (
              <p className={styles.errorSummary} role="alert">
                {t.form.errors.summary}
              </p>
            ) : null}

            {step === 0 ? (
              <div className={styles.fields}>
                <ChoiceGroup
                  id="q-product"
                  name="product"
                  label={s1.station}
                  value={data.product}
                  onChange={set("product")}
                  variant="card"
                  required
                  error={err("product")}
                  className={styles.full}
                  options={[
                    ...productList.map((p) => ({
                      value: p.id,
                      label: `${p.name} ${p.powerKw} kW`,
                      description: p.tagline[lang],
                      media: <ProductImage product={p} lang={lang} sizes="(max-width: 640px) 90vw, 30vw" variant="card" />,
                      aside: (
                        <span className={styles.choicePrice}>
                          <span className={styles.choicePriceValue}>{formatPrice(p.startingPrice)}</span>
                        </span>
                      ),
                    })),
                    { value: "advice", label: s1.advice.title, description: s1.advice.text },
                  ]}
                />

                <fieldset className={`${styles.full} ${styles.services}`}>
                  <legend className={formStyles.label}>{s1.services}</legend>
                  <p className={formStyles.hint}>{s1.servicesHint}</p>
                  <ul>
                    {pricing.services.map((s) => {
                      const on = selectedServices.includes(s.id);
                      return (
                        <li key={s.id}>
                          <label className={styles.service} data-on={on}>
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => toggleService(s.id)}
                              className={styles.serviceInput}
                            />
                            <span className={styles.serviceBox} aria-hidden>
                              <Check size={14} />
                            </span>
                            <span className={styles.serviceText}>
                              <strong>{s.label[lang]}</strong>
                              <span>{s.detail[lang]}</span>
                              {s.kind === "perMeter" ? (
                                <span className={styles.serviceCalc}>
                                  {meters} ml × {formatAmount(s.price, 2)} ={" "}
                                  <b key={meters} className={styles.bump}>
                                    {formatAmount(s.price * meters)}
                                  </b>
                                </span>
                              ) : null}
                            </span>
                            <span className={styles.servicePrice}>
                              {formatAmount(s.price, 2)}
                              <small> {s.kind === "perMeter" ? s1.perMeter : pricing.vatLabel}</small>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>

                <SelectField
                  id="q-housing"
                  label={s1.housing}
                  value={data.housing}
                  onChange={set("housing")}
                  error={err("housing")}
                  options={opts(s1.housingOptions)}
                />
                <CityField
                  id="q-city"
                  label={s1.city}
                  value={data.city}
                  onChange={set("city")}
                  options={moroccanCities}
                  t={{ choose: t.form.fields.cityChoose, other: t.form.fields.cityOther, otherLabel: t.form.fields.cityOtherLabel }}
                  required
                  error={err("city")}
                />

                <div className={`${styles.full} ${styles.slider}`}>
                  <div className={styles.sliderHead}>
                    <label htmlFor="q-cable" className={formStyles.label}>
                      {s1.cable}
                    </label>
                    <output htmlFor="q-cable" className={styles.sliderValue}>
                      <span key={meters} className={styles.bump}>
                        {meters} m
                      </span>
                    </output>
                  </div>
                  <input
                    id="q-cable"
                    type="range"
                    min={pricing.cable.min}
                    max={pricing.cable.max}
                    step={1}
                    value={meters}
                    onChange={(e) => set("cableLength")(e.target.value)}
                    aria-describedby="q-cable-hint"
                    className={styles.range}
                    style={{
                      ["--fill" as string]: `${((meters - pricing.cable.min) / (pricing.cable.max - pricing.cable.min)) * 100}%`,
                    }}
                  />
                  <p id="q-cable-hint" className={formStyles.hint}>
                    {s1.cableHint}
                  </p>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className={styles.fields}>
                <TextField
                  id="q-firstName"
                  label={q.step3.firstName}
                  value={data.firstName}
                  onChange={set("firstName")}
                  autoComplete="given-name"
                  required
                  error={err("firstName")}
                />
                <TextField
                  id="q-lastName"
                  label={q.step3.lastName}
                  value={data.lastName}
                  onChange={set("lastName")}
                  autoComplete="family-name"
                  required
                  error={err("lastName")}
                />
                <TextField
                  id="q-phone"
                  label={t.form.fields.phone}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={data.phone}
                  onChange={set("phone")}
                  placeholder="06 00 00 00 00"
                  hint={t.form.fields.phoneHint}
                  required
                  error={err("phone")}
                />
                <TextField
                  id="q-email"
                  label={t.form.fields.email}
                  optional={t.form.fields.optional}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={data.email}
                  onChange={set("email")}
                  error={err("email")}
                />
                <ChoiceGroup
                  id="q-contactMethod"
                  name="contactMethod"
                  label={q.step3.contactMethod}
                  value={data.contactMethod}
                  onChange={set("contactMethod")}
                  required
                  error={err("contactMethod")}
                  className={styles.full}
                  options={opts(q.step3.contactOptions)}
                />
                <div className={styles.full}>
                  <Consent
                    id="q-consent"
                    checked={consent}
                    onChange={(v) => {
                      setConsent(v);
                      if (v && errors.consent) setErrors((e) => clearError(e, "consent"));
                    }}
                    error={err("consent")}
                  >
                    {t.form.consent.split(t.form.consentLink)[0]}
                    <Link href={href(lang, "privacy")} target="_blank">
                      {t.form.consentLink}
                    </Link>
                    {t.form.consent.split(t.form.consentLink)[1]}
                  </Consent>
                  <p className={styles.privacy}>{t.form.privacyShort}</p>
                </div>
              </div>
            ) : null}

          </div>

          <Honeypot value={honeypot} onChange={setHoneypot} />

          {status === "error" ? (
            <div className={formStyles.alert} role="alert">
              <p>{t.form.errors.submit}</p>
              <a href={whatsappUrl(whatsappMessage())} target="_blank" rel="noopener" className="text-link">
                WhatsApp
              </a>
            </div>
          ) : null}

          <div className={styles.actions}>
            {step > 0 ? (
              <button type="button" className="btn btn--secondary" onClick={() => goTo(step - 1)}>
                <ArrowLeft /> {q.nav.back}
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className="btn btn--primary" disabled={status === "sending"}>
              {step < LAST_STEP ? q.nav.next : status === "sending" ? t.form.sending : q.nav.submit}
              <ArrowRight />
            </button>
          </div>
        </form>
      </div>

      <QuoteSummary
        t={t}
        lang={lang}
        data={data}
        estimate={estimate}
        unlocked={unlocked}
        step={step}
        sending={status === "sending"}
        onUnlock={() => (step === 0 ? advanceTo(1) : formRef.current?.requestSubmit())}
        onEdit={(i) => goTo(i)}
      />
    </div>
  );
}
