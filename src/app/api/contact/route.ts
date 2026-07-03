import { NextResponse } from "next/server";
import { sendEmail, internalNotificationEmail, customerAutoReplyEmail } from "@/lib/email";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  service?: string;
  message?: string;
  /** Client slug when the submission comes from a /site/[client] site
   * instead of the main LuxWeb Pro site — see ContactForm's `siteId` prop. */
  site?: string;
  locale?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, message } = payload;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const locale = hasLocale(routing.locales, payload.locale) ? payload.locale : routing.defaultLocale;

  try {
    const { html, text } = internalNotificationEmail(
      payload.site ? `Neie Message vun ${name} — ${payload.site}` : `Neie Message vun ${name} — LuxWeb Pro`,
      [
        { label: "Site", value: payload.site ?? "" },
        { label: "Numm", value: name },
        { label: "E-Mail", value: email },
        { label: "Telefon", value: payload.phone ?? "" },
        { label: "Firma", value: payload.company ?? "" },
        { label: "Service", value: payload.service ?? "" },
      ],
      message
    );

    await sendEmail({
      to: process.env.CONTACT_EMAIL ?? "hello@luxwebpro.lu",
      replyTo: email,
      subject: payload.site
        ? `Neie Message vun ${name} — ${payload.site}`
        : `Neie Message vun ${name} — LuxWeb Pro`,
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
    console.error("Failed to send contact email", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
