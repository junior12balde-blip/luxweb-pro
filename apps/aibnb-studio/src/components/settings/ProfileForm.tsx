"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABELS, type NotificationPreferences } from "@/lib/validations/profile";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FormError } from "@/components/ui/FormError";

interface ProfileFormProps {
  fullName: string;
  locale: string;
  timezone: string;
  notificationPrefs: NotificationPreferences;
}

const NOTIFICATION_LABELS: Record<keyof NotificationPreferences, string> = {
  emailOnNewMessage: "Avisarme por email de mensajes nuevos de huéspedes",
  emailOnBookingReminder: "Avisarme por email de recordatorios de reservas",
  emailProductUpdates: "Recibir novedades del producto",
};

export function ProfileForm({ fullName, locale, timezone, notificationPrefs }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [prefs, setPrefs] = useState(notificationPrefs);

  const timezoneOptions = useMemo(() => {
    if (typeof Intl.supportedValuesOf === "function") {
      const zones = Intl.supportedValuesOf("timeZone");
      return zones.includes(timezone) ? zones : [timezone, ...zones];
    }
    return [timezone];
  }, [timezone]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: formData.get("fullName"),
      locale: formData.get("locale"),
      timezone: formData.get("timezone"),
      notificationPrefs: prefs,
    };

    const response = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Ha ocurrido un error");
      setPending(false);
      return;
    }

    setSaved(true);
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input id="fullName" name="fullName" required defaultValue={fullName} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="locale">Idioma</Label>
          <select
            id="locale"
            name="locale"
            defaultValue={locale}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {LOCALE_LABELS[code]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="timezone">Zona horaria</Label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={timezone}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {timezoneOptions.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>Notificaciones</Label>
        <div className="space-y-2">
          {(Object.keys(NOTIFICATION_LABELS) as (keyof NotificationPreferences)[]).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={(event) => setPrefs((prev) => ({ ...prev, [key]: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              {NOTIFICATION_LABELS[key]}
            </label>
          ))}
        </div>
      </div>

      <FormError message={error} />
      {saved && !error && (
        <p className="text-sm text-green-700">Perfil actualizado.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
