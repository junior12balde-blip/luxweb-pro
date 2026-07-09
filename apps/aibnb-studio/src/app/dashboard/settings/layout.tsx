import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
      <SettingsTabs />
      <div className="mt-6">{children}</div>
    </div>
  );
}
