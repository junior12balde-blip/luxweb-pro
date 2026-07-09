import { requireUser } from "@/lib/auth";
import { listProviders } from "@/lib/ai/providerManager";
import { DEFAULT_AI_PREFERENCES, type AIPreferences } from "@/lib/ai/types";
import { Card } from "@/components/ui/Card";
import { IntegrationsForm } from "@/components/settings/IntegrationsForm";

export default async function IntegrationsPage() {
  const { user } = await requireUser();
  const providers = listProviders();
  const aiPreferences = (user.aiPreferences as AIPreferences | null) ?? DEFAULT_AI_PREFERENCES;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Proveedores de IA</h2>
        <p className="mt-1 text-sm text-slate-500">
          Arquitectura preparada para la Fase 3 (Asistente de IA para huéspedes).
          Todavía no se realiza ninguna llamada real — esto solo muestra qué
          proveedor tiene su clave configurada y guarda tu preferencia para
          cuando se active.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {providers.map((provider) => {
          const configured = provider.isConfigured();
          return (
            <Card key={provider.metadata.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{provider.metadata.label}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    configured
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {configured ? "Configurado" : "No configurado"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Variable de entorno: <code>{provider.metadata.envVar}</code>
              </p>
              {!configured && (
                <a
                  href={provider.metadata.consoleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Crear clave →
                </a>
              )}
            </Card>
          );
        })}
      </div>

      <IntegrationsForm
        providers={providers.map((p) => ({ id: p.metadata.id, label: p.metadata.label }))}
        defaultProvider={aiPreferences.defaultProvider}
      />
    </div>
  );
}
