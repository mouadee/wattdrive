"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { Check } from "../Icons";
import styles from "./Form.module.css";

type Base = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: string;
  className?: string;
};

function describedBy(id: string, hint?: string, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

function Messages({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      ) : null}
    </>
  );
}

function Label({ id, label, optional, required }: { id: string; label: string; optional?: string; required?: boolean }) {
  return (
    <label htmlFor={id} className={styles.label}>
      {label}
      {optional ? <span className={styles.optional}> ({optional})</span> : null}
      {required ? <span aria-hidden className={styles.req}> *</span> : null}
    </label>
  );
}

type InputProps = Base & {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "tel" | "email" | "number";
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  list?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
};

export function TextField(props: InputProps) {
  const { id, label, error, hint, optional, className, value, onChange, type = "text", required, ...rest } = props;
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <Label id={id} label={label} optional={optional} required={required} />
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        aria-required={required || undefined}
        className={styles.input}
        maxLength={props.maxLength ?? 200}
        {...rest}
      />
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}

export function TextArea(props: Base & { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const { id, label, error, hint, optional, className, value, onChange, placeholder, rows = 4 } = props;
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <Label id={id} label={label} optional={optional} />
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={1000}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${styles.input} ${styles.textarea}`}
      />
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}

export function SelectField(
  props: Base & { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] },
) {
  const { id, label, error, hint, optional, className, value, onChange, options } = props;
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <Label id={id} label={label} optional={optional} />
      <div className={styles.selectWrap}>
        <select
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={`${styles.input} ${styles.select}`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}

type ChoiceOption = { value: string; label: string; description?: string; media?: ReactNode; aside?: ReactNode };

/** Radio group rendered as selectable tiles. Native radios keep keyboard behaviour (arrow keys). */
export function ChoiceGroup(
  props: Base & {
    name: string;
    value: string;
    onChange: (v: string) => void;
    options: ChoiceOption[];
    columns?: 2 | 3 | 4;
    variant?: "tile" | "card";
    required?: boolean;
    legendClassName?: string;
  },
) {
  const { id, label, error, hint, className, name, value, onChange, options, columns = 2, variant = "tile", required } = props;
  return (
    <fieldset
      id={id}
      className={[styles.fieldset, className].filter(Boolean).join(" ")}
      aria-describedby={describedBy(id, hint, error)}
      aria-invalid={error ? true : undefined}
      tabIndex={-1}
    >
      <legend className={[styles.label, props.legendClassName].filter(Boolean).join(" ")}>
        {label}
        {required ? <span aria-hidden className={styles.req}> *</span> : null}
      </legend>
      <div className={styles.choices} data-columns={columns} data-variant={variant}>
        {options.map((o) => {
          const optionId = `${id}-${o.value || "none"}`;
          const checked = value === o.value;
          return (
            <label key={o.value} htmlFor={optionId} className={styles.choice} data-checked={checked}>
              <input
                id={optionId}
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className={styles.radio}
              />
              {o.media ? <span className={styles.choiceMedia}>{o.media}</span> : null}
              <span className={styles.choiceBody}>
                <span className={styles.choiceLabel}>{o.label}</span>
                {o.description ? <span className={styles.choiceDesc}>{o.description}</span> : null}
                {o.aside}
              </span>
              <span className={styles.tick} aria-hidden>
                <Check size={14} />
              </span>
            </label>
          );
        })}
      </div>
      <Messages id={id} hint={hint} error={error} />
    </fieldset>
  );
}

export function Consent(props: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  const { id, checked, onChange, error, children } = props;
  return (
    <div className={styles.consent}>
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={styles.checkbox}
      />
      <label htmlFor={id}>{children}</label>
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Hidden honeypot field for bots. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

/** Focus the first invalid control inside a container. */
export function focusFirstInvalid(root: HTMLElement | null) {
  const el = root?.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (!el) return;
  if (el.tagName === "FIELDSET") {
    (el.querySelector<HTMLElement>("input:checked") ?? el.querySelector<HTMLElement>("input"))?.focus();
  } else el.focus();
}

/**
 * City dropdown (always shows the full list) with an "other city" choice that reveals a text field.
 * The stored value is the city name in both cases.
 */
export function CityField(
  props: Base & {
    value: string;
    onChange: (v: string) => void;
    options: string[];
    t: { choose: string; other: string; otherLabel: string };
    required?: boolean;
  },
) {
  const { id, label, error, hint, className, value, onChange, options, t, required } = props;
  const known = options.includes(value);
  const [other, setOther] = useState(value !== "" && !known);
  const selectValue = other ? "__other" : known ? value : "";
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <Label id={id} label={label} required={required} />
      <div className={styles.selectWrap}>
        <select
          id={id}
          name={id}
          value={selectValue}
          onChange={(e) => {
            if (e.target.value === "__other") {
              setOther(true);
              onChange("");
            } else {
              setOther(false);
              onChange(e.target.value);
            }
          }}
          aria-invalid={error && !other ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          autoComplete="address-level2"
          className={`${styles.input} ${styles.select}`}
        >
          <option value="" disabled>
            {t.choose}
          </option>
          {options.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="__other">{t.other}</option>
        </select>
      </div>
      {other ? (
        <div className={styles.reveal}>
          <label htmlFor={`${id}-other`} className="sr-only">
            {t.otherLabel}
          </label>
          <input
            id={`${id}-other`}
            type="text"
            value={value}
            placeholder={t.otherLabel}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={styles.input}
            maxLength={80}
            autoFocus
          />
        </div>
      ) : null}
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}
