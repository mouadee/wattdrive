import { NextResponse } from "next/server";
import {
  contactKeys,
  hasErrors,
  normalizePhone,
  quoteKeys,
  sanitize,
  validateContact,
  validateQuote,
  type ContactLead,
  type LeadPayload,
  type QuoteLead,
} from "@/lib/leads";
import { computeEstimate } from "@/config/pricing";

/**
 * Lead intake — INTEGRATION POINT.
 *
 * There is no CRM or database in this project yet. Validated leads are forwarded as JSON
 * to the URL in the LEAD_WEBHOOK_URL environment variable (e.g. a Make / Zapier / n8n scenario
 * that writes to Google Sheets, a CRM or sends an email/WhatsApp notification).
 *
 *  - LEAD_WEBHOOK_URL set      -> lead is POSTed there; the visitor sees the confirmation only if it succeeds.
 *  - not set, development      -> lead is printed to the server console (nothing is stored).
 *  - not set, production       -> returns 503 so the visitor is told to use WhatsApp instead.
 *    Nothing is ever reported as "received" when it was not delivered.
 */

const webhook = process.env.LEAD_WEBHOOK_URL;
const webhookSecret = process.env.LEAD_WEBHOOK_SECRET;

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: bots fill the hidden "website" field. Pretend success, drop the lead.
  if (body.website) return NextResponse.json({ ok: true });

  const lang = body.lang === "en" ? "en" : "fr";
  const consent = body.consent === true;
  let lead: Record<string, unknown>;

  if (body.kind === "contact") {
    const data = sanitize<ContactLead>(body.data, contactKeys);
    const errors = validateContact(data, consent);
    if (hasErrors(errors)) return NextResponse.json({ ok: false, error: "validation", errors }, { status: 422 });
    lead = { ...data, phone: normalizePhone(data.phone) };
  } else if (body.kind === "quote") {
    const data = sanitize<QuoteLead>(body.data, quoteKeys);
    const errors = validateQuote(data, consent);
    if (hasErrors(errors)) return NextResponse.json({ ok: false, error: "validation", errors }, { status: 422 });
    // Recompute the estimate on the server rather than trusting client-side totals.
    const estimate = computeEstimate(
      { product: data.product, services: data.services.split(","), cableLength: Number(data.cableLength) },
      lang,
    );
    lead = {
      ...data,
      phone: normalizePhone(data.phone),
      fullName: `${data.firstName} ${data.lastName}`.trim(),
      estimate: { lines: estimate.lines.map(({ label, qty, unit, unitPrice, total }) => ({ label, qty, unit, unitPrice, total })), total: estimate.total },
    };
  } else {
    return NextResponse.json({ ok: false, error: "invalid_kind" }, { status: 400 });
  }

  const record = {
    kind: body.kind,
    lang,
    consent,
    submittedAt: new Date().toISOString(),
    lead,
    attribution: sanitize(body.attribution ?? {}, [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
      "landing",
    ]),
  };

  if (!webhook) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[lead] LEAD_WEBHOOK_URL not set — lead NOT stored, logged for development only:\n", record);
      return NextResponse.json({ ok: true, delivered: false });
    }
    console.error("[lead] LEAD_WEBHOOK_URL is not configured; lead rejected.");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(webhookSecret ? { Authorization: `Bearer ${webhookSecret}` } : {}),
      },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch (error) {
    console.error("[lead] delivery failed", error);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, delivered: true });
}
