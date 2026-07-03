import { siteConfig } from "./constants";
import type { Locale } from "@/i18n/routing";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  from?: string;
};

/**
 * Sends an email via the Resend HTTP API. Returns `false` (without
 * throwing) when RESEND_API_KEY isn't configured, so callers can fall back
 * to logging in local/dev environments — see .env.example.
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("[email] RESEND_API_KEY not set — skipping send:", {
      to: options.to,
      subject: options.subject,
    });
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: options.from ?? process.env.CONTACT_FROM_EMAIL ?? "LuxWeb Pro <onboarding@resend.dev>",
      to: options.to,
      reply_to: options.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }

  return true;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function baseEmailHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:linear-gradient(135deg,#1857F5,#00C2A8);padding:24px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;">LuxWeb Pro</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1e293b;line-height:1.6;">
                <h1 style="font-size:18px;margin:0 0 16px;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:#f1f5f9;color:#64748b;font-size:12px;">
                LuxWeb Pro — ${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.city} · ${siteConfig.phone}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Internal notification email — a simple key/value summary sent to the
 * LuxWeb Pro team for both the contact form and the quote request form. */
export function internalNotificationEmail(
  title: string,
  rows: { label: string; value: string }[],
  message: string
): { html: string; text: string } {
  const rowsHtml = rows
    .filter((row) => row.value)
    .map(
      (row) =>
        `<p style="margin:0 0 8px;"><strong>${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}</p>`
    )
    .join("");

  const html = baseEmailHtml(
    title,
    `${rowsHtml}<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
     <p style="white-space:pre-wrap;margin:0;">${escapeHtml(message)}</p>`
  );

  const text = [
    title,
    "",
    ...rows.filter((row) => row.value).map((row) => `${row.label}: ${row.value}`),
    "",
    message,
  ].join("\n");

  return { html, text };
}

const AUTO_REPLY: Record<
  Locale,
  { subject: string; greeting: (name: string) => string; body: string; signature: string }
> = {
  lu: {
    subject: "Mir hunn Ären Message kritt",
    greeting: (name) => `Moien ${name},`,
    body: "Merci fir Äre Message un LuxWeb Pro. Mir hunn en kritt a mellen eis normalerweis bannent engem Werkdag bei Iech.",
    signature: "D'LuxWeb Pro Equipe",
  },
  fr: {
    subject: "Nous avons bien reçu votre message",
    greeting: (name) => `Bonjour ${name},`,
    body: "Merci pour votre message adressé à LuxWeb Pro. Nous l'avons bien reçu et vous répondrons généralement sous un jour ouvré.",
    signature: "L'équipe LuxWeb Pro",
  },
  de: {
    subject: "Wir haben Ihre Nachricht erhalten",
    greeting: (name) => `Hallo ${name},`,
    body: "Danke für Ihre Nachricht an LuxWeb Pro. Wir haben sie erhalten und antworten in der Regel innerhalb eines Werktags.",
    signature: "Ihr LuxWeb Pro Team",
  },
  en: {
    subject: "We've received your message",
    greeting: (name) => `Hi ${name},`,
    body: "Thank you for reaching out to LuxWeb Pro. We've received your message and usually reply within one business day.",
    signature: "The LuxWeb Pro team",
  },
  pt: {
    subject: "Recebemos a sua mensagem",
    greeting: (name) => `Olá ${name},`,
    body: "Obrigado por contactar a LuxWeb Pro. Recebemos a sua mensagem e normalmente respondemos dentro de um dia útil.",
    signature: "A equipa LuxWeb Pro",
  },
};

/** Branded confirmation email sent back to the customer right after they
 * submit the contact or quote form — translated in their site locale. */
export function customerAutoReplyEmail(
  locale: Locale,
  name: string
): { subject: string; html: string; text: string } {
  const copy = AUTO_REPLY[locale] ?? AUTO_REPLY.en;
  const greeting = copy.greeting(name);

  const html = baseEmailHtml(
    copy.subject,
    `<p style="margin:0 0 12px;">${escapeHtml(greeting)}</p>
     <p style="margin:0 0 16px;">${escapeHtml(copy.body)}</p>
     <p style="margin:0;">${escapeHtml(copy.signature)}</p>`
  );

  const text = [greeting, "", copy.body, "", copy.signature].join("\n");

  return { subject: copy.subject, html, text };
}
