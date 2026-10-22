"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { moroccanCities } from "@/config/site";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { clearError, hasErrors, validateContact, type ContactLead, type Errors } from "@/lib/leads";
import { submitLead } from "@/lib/submit";
import { whatsappUrl } from "@/lib/whatsapp";
import { ChoiceGroup, CityField, Consent, Honeypot, TextArea, TextField, focusFirstInvalid } from "./form/Fields";
import { ArrowRight, Check, WhatsApp } from "./Icons";
import styles from "./LeadForm.module.css";
import formStyles from "./form/Form.module.css";

type Props = {
  lang: Locale;
  t: Dictionary["form"];
  whatsappDefault: string;
  idPrefix?: string;
};

const empty: ContactLead = {
  fullName: "",
  phone: "",
  city: "",
  installationType: "",
  vehicle: "",
  product: "",
  details: "",
};

export function LeadForm({ lang, t, whatsappDefault, idPrefix = "lead" }: Props) {
  const [data, setData] = useState<ContactLead>(empty);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "success">("idle");
  const [focusTick, setFocusTick] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusTick) focusFirstInvalid(formRef.current);
  }, [focusTick]);

  useEffect(() => {
    if (status === "success" || status === "error") resultRef.current?.focus();
  }, [status]);

  const set = (key: keyof ContactLead) => (value: string) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => clearError(e, key));
  };

  const id = (name: string) => `${idPrefix}-${name}`;
  const err = (key: string) => (errors[key] ? t.errors[errors[key]!] : undefined);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateContact(data, consent);
    setErrors(found);
    if (hasErrors(found)) {
      setFocusTick((n) => n + 1);
      return;
    }
    setStatus("sending");
    const ok = await submitLead({ kind: "contact", lang, data, consent, website: honeypot });
    setStatus(ok ? "success" : "error");
  }

  const productLabel = data.product ? t.options.product[data.product as keyof typeof t.options.product] : "";
  const sep = lang === "fr" ? " : " : ": ";
  const followUp = [
    whatsappDefault,
    data.fullName && `— ${data.fullName}`,
    productLabel && `${t.fields.product}${sep}${productLabel}`,
    data.city && `${t.fields.city}${sep}${data.city}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (status === "success") {
    return (
      <div ref={resultRef} tabIndex={-1} className={styles.success} role="status">
        <span className={styles.successIcon} aria-hidden>
          <Check size={22} />
        </span>
        <h3 className="h3">{t.success.title}</h3>
        <p className="muted">{t.success.text}</p>
        <div className="btn-row">
          <a href={whatsappUrl(followUp)} className="btn btn--whatsapp" target="_blank" rel="noopener">
            <WhatsApp /> {t.success.whatsapp}
          </a>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setData(empty);
              setConsent(false);
              setStatus("idle");
            }}
          >
            {t.success.again}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={styles.form}>
      {hasErrors(errors) ? (
        <p className={styles.summary} role="alert">
          {t.errors.summary}
        </p>
      ) : null}

      <div className={styles.grid}>
        <TextField
          id={id("fullName")}
          label={t.fields.fullName}
          value={data.fullName}
          onChange={set("fullName")}
          autoComplete="name"
          required
          error={err("fullName")}
        />
        <TextField
          id={id("phone")}
          label={t.fields.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={data.phone}
          onChange={set("phone")}
          hint={t.fields.phoneHint}
          required
          error={err("phone")}
        />
        <CityField
          id={id("city")}
          label={t.fields.city}
          value={data.city}
          onChange={set("city")}
          options={moroccanCities}
          t={{ choose: t.fields.cityChoose, other: t.fields.cityOther, otherLabel: t.fields.cityOtherLabel }}
          required
          error={err("city")}
        />
        <TextField
          id={id("vehicle")}
          label={t.fields.vehicle}
          optional={t.fields.optional}
          value={data.vehicle}
          onChange={set("vehicle")}
        />
        <ChoiceGroup
          id={id("installationType")}
          name={id("installationType")}
          label={t.fields.installationType}
          value={data.installationType}
          onChange={set("installationType")}
          required
          error={err("installationType")}
          className={styles.full}
          options={[
            { value: "residential", label: t.options.installationType.residential },
            { value: "professional", label: t.options.installationType.professional },
          ]}
        />
        <ChoiceGroup
          id={id("product")}
          name={id("product")}
          label={t.fields.product}
          value={data.product}
          onChange={set("product")}
          columns={3}
          required
          error={err("product")}
          className={styles.full}
          options={[
            { value: "nora", label: t.options.product.nora },
            { value: "neo", label: t.options.product.neo },
            { value: "advice", label: t.options.product.advice },
          ]}
        />
        <TextArea
          id={id("details")}
          label={t.fields.details}
          optional={t.fields.optional}
          placeholder={t.fields.detailsHint}
          value={data.details}
          onChange={set("details")}
          rows={3}
          className={styles.full}
        />
      </div>

      <Honeypot value={honeypot} onChange={setHoneypot} />

      <div className={styles.footer}>
        <Consent id={id("consent")} checked={consent} onChange={(v) => {
          setConsent(v);
          if (v && errors.consent) setErrors((e) => clearError(e, "consent"));
        }} error={err("consent")}>
          {t.consent.split(t.consentLink)[0]}
          <Link href={href(lang, "privacy")} target="_blank">
            {t.consentLink}
          </Link>
          {t.consent.split(t.consentLink)[1]}
        </Consent>
        <p className={styles.privacy}>{t.privacyShort}</p>

        {status === "error" ? (
          <div ref={resultRef} tabIndex={-1} className={formStyles.alert} role="alert">
            <p>{t.errors.submit}</p>
            <a href={whatsappUrl(followUp)} target="_blank" rel="noopener" className="text-link">
              WhatsApp
            </a>
          </div>
        ) : null}

        <button type="submit" className="btn btn--primary" disabled={status === "sending"}>
          {status === "sending" ? t.sending : t.submit}
          <ArrowRight />
        </button>
      </div>
    </form>
  );
}
