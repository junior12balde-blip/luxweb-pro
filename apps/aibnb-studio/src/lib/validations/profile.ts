import { z } from "zod";

export const LOCALES = ["es", "en", "fr", "de", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
};

const VALID_TIMEZONES = new Set(
  typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [],
);

const timezoneSchema = z.string().refine(
  (value) => VALID_TIMEZONES.size === 0 || VALID_TIMEZONES.has(value),
  { message: "Zona horaria no válida" },
);

export interface NotificationPreferences {
  emailOnNewMessage: boolean;
  emailOnBookingReminder: boolean;
  emailProductUpdates: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailOnNewMessage: true,
  emailOnBookingReminder: true,
  emailProductUpdates: false,
};

export const notificationPreferencesSchema = z.object({
  emailOnNewMessage: z.boolean(),
  emailOnBookingReminder: z.boolean(),
  emailProductUpdates: z.boolean(),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Introduce tu nombre completo").max(120),
  locale: z.enum(LOCALES),
  timezone: timezoneSchema,
  notificationPrefs: notificationPreferencesSchema,
});
export type ProfileInput = z.infer<typeof profileSchema>;
