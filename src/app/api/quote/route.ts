import { NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { sendEmail, internalNotificationEmail, customerAutoReplyEmail } from "@/lib/email";

type QuotePayload = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  businessType?: string;
  plan?: string;
  languages?: string[];
  message?: string;
  locale?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let payload: QuotePayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, message, businessType } = payload;

  if (!name?.trim() || !email?.trim() || !message?.trim() || !businessType?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const locale = hasLocale(routing.locales, payload.locale) ? payload.locale : routing.defaultLocale;
  const languages = Array.isArray(payload.languages) ? payload.languages.join(", ") : "";

  try {
    const { html, text } = internalNotificationEmail(
      `Nei Devisufro vun ${name} (${businessType})`,
      [
        { label: "Numm", value: name },
        { label: "E-Mail", value: email },
        { label: "Telefon", value: payload.phone ?? "" },
        { label: "Firma", value: payload.company ?? "" },
        { label: "Branche", value: businessType },
        { label: "Pak", value: payload.plan ?? "" },
        { label: "Sproochen", value: languages },
      ],
      message
    );

    await sendEmail({
      to: process.env.CONTACT_EMAIL ?? "hello@luxwebpro.lu",
      replyTo: email,
      subject: `Nei Devisufro vun ${name} — ${businessType}`,
      html,
      text,
    });

    const autoReply = customerAutoReplyEmail(locale, name);
    await sendEmail({
      to: email,
      subject: autoReply.subject,
      html: autoReply.html,
      text: autoReply.text,
    });
  } catch (error) {
    console.error("Failed to send quote request email", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
