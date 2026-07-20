# Arquitectura de AIbnb Studio

Este documento describe las decisiones de arquitectura vigentes y, sobre
todo, **los puntos de extensión pensados para que las Fases 4-9 se
conecten sin reescribir lo ya construido**. Para el detalle de qué se
implementó en cada fase, ver `PHASE-1.md` / `PHASE-2.md` / `PHASE-3.md`.
Para el plan de fases completo, ver `DEVELOPMENT_PLAN.md`.

## Capas

```
src/app/            Rutas (App Router): páginas + Route Handlers (API)
src/components/      UI, organizada por dominio (dashboard/, properties/, settings/, ui/)
src/lib/             Lógica de dominio y clientes de infraestructura
  ai/                Arquitectura de proveedores de IA (ver abajo)
  supabase/          Clientes de Supabase (browser/server/middleware)
  validations/       Esquemas Zod — única fuente de verdad de "qué es válido"
  auth.ts            Sesión + upsert de usuario de dominio a partir de Supabase Auth
  properties.ts      Comprobaciones de pertenencia reutilizadas por varias rutas
  serializers.ts      Prisma → JSON (Decimal/Date/relaciones)
  storage.ts          Constantes y validación de subida de ficheros
prisma/schema.prisma  Única fuente de verdad del modelo de datos
```

Regla general: **las páginas y componentes no hablan con Prisma ni con
Supabase directamente si pueden pasar por `src/lib/*`**; y ningún código de
dominio debe importar un proveedor de IA concreto — solo
`src/lib/ai/providerManager.ts`.

## Arquitectura de proveedores de IA

```
src/lib/ai/
  types.ts             AIProvider, ChatMessage, GenerateTextParams/Result, AIPreferences
  errors.ts            AIProviderNotConfiguredError, AIProviderNotImplementedError
  providerManager.ts   registro + resolveProvider(preferencia) + getDefaultProviderId()
  providers/
    anthropic.ts       implementa AIProvider — llamada real (Fase 3, @anthropic-ai/sdk, modelo claude-opus-4-8)
    openai.ts          implementa AIProvider (stub — no activado, nadie lo ha pedido)
    google.ts          implementa AIProvider (stub — no activado, nadie lo ha pedido)
  guestAssistant.ts    dominio de la Fase 3: construcción del prompt (property + tono + few-shot) y suggestReply()
```

**Cómo se conectó la Fase 3 (Asistente de IA para huéspedes) sin tocar el
resto de la app — ya hecho, como referencia del patrón:**

1. Se implementó `generateText()` de verdad en `providers/anthropic.ts`
   (SDK oficial de Anthropic), quitando el
   `throw new AIProviderNotImplementedError(...)`. `openai.ts` y
   `google.ts` siguen como stubs — el resto del código no lo nota porque
   programa contra la interfaz `AIProvider`.
2. Se añadieron `Conversation` / `Message` a `prisma/schema.prisma`, cada
   uno colgando de `propertyId` (FK a `Property`, ya existente).
3. `src/lib/ai/guestAssistant.ts` llama a
   `providerManager.resolveProvider(user.aiPreferences.defaultProvider)`
   y luego a `.generateText(...)` — ni la UI ni la API route necesitan
   saber qué proveedor es.
4. La página `/dashboard/settings/integrations` (Fase 2) ya exponía qué
   proveedor está configurado y cuál prefiere el anfitrión — se reutilizó
   sin cambios.

El mismo patrón (interfaz común + Provider Manager + módulo de dominio que
construye el prompt) es el que debe seguir la Fase 4 (generador de
anuncios) y cualquier fase futura que necesite IA de texto.

**Cómo añadir un proveedor nuevo (p. ej. Mistral) en cualquier fase
futura:**

1. Crear `src/lib/ai/providers/mistral.ts` implementando `AIProvider`.
2. Añadir `"mistral"` a `AIProviderId`/`AI_PROVIDER_IDS` en `types.ts`.
3. Registrarlo en `providerManager.ts`.

Ningún otro archivo cambia — ese es el punto del Provider Manager.

## Puntos de extensión por fase futura

| Fase | Qué añade | Dónde se conecta (ya existe) |
|---|---|---|
| 4 — Generador de anuncios | `ListingDraft` (Prisma, FK a `Property`), usa `providerManager.resolveProvider(...).generateText(...)` para título/descripción/SEO | `providerManager`, formularios de `properties/` |
| 5 — Vídeos (Higgsfield) | `MediaGeneration` (Prisma: tipo `VIDEO`, estado `pending/processing/ready/failed`, FK a `Property`) + cola de trabajo | `PropertyPhoto` ya establece el patrón "media con `propertyId` + `position`"; se puede generalizar o añadir un modelo hermano |
| 6 — Generador de imágenes | Mismo modelo `MediaGeneration` que la Fase 5 con tipo `IMAGE`, reutilizando la misma cola | igual que arriba |
| 7 — Automatizaciones | `Automation`/`ScheduledMessage` (Prisma, FK a `Property`), scheduler (cron de GitHub Actions o `pg-boss` sobre el mismo Postgres — decisión pendiente, ver `DEVELOPMENT_PLAN.md`) | `notificationPrefs` de `User` (Fase 2) ya modela "qué quiere recibir el anfitrión" |
| 8 — Analítica | Lee de `Property`, `Membership`, y de los modelos de reservas que se añadan; los `StatCard` del dashboard (Fase 1) ya tienen placeholders explícitos esperando estos datos | `src/components/dashboard/StatCard.tsx` |
| 9 — Stripe | `Subscription`/`Plan` (Prisma, FK a `User` u organización), webhooks en `src/app/api/stripe/webhook/route.ts` (patrón ya usado por `auth/callback`) | Route Handlers existentes como plantilla |

## Multi-tenancy y permisos

Todo objeto de dominio (`Property`, y en el futuro `Conversation`,
`ListingDraft`, `MediaGeneration`, `Automation`...) cuelga de `Property.id`,
y el acceso de un usuario a una propiedad siempre se resuelve por
`Membership` (`src/lib/properties.ts`). Esto ya soporta equipos (varios
usuarios por propiedad, con rol `OWNER`/`EDITOR`/`VIEWER`) aunque la UI
actual solo expone el caso de un anfitrión gestionando lo suyo — añadir
"invitar a un colaborador" en el futuro no requiere cambiar el modelo de
datos.

## Almacenamiento de ficheros

Todas las subidas (avatar, fotos de propiedad, y en el futuro vídeos/
imágenes generadas) pasan por una API route propia — nunca directamente
del navegador a Supabase Storage — para poder validar tipo/tamaño y
comprobar pertenencia en el servidor antes de escribir. `src/lib/storage.ts`
centraliza los nombres de bucket y esa validación; un bucket nuevo (p. ej.
`generated-videos` en la Fase 5) sigue el mismo patrón.

## Por qué no hay más "preparación" que esta

Se evitó a propósito añadir columnas, tablas o módulos vacíos "por si
acaso" (p. ej. una tabla `Automation` sin ningún campo real, o un
`videoProvider.ts` sin implementación). Cada pieza construida en la Fase 2
tiene un consumidor real hoy (la preferencia de proveedor de IA se guarda y
se lee desde `/dashboard/settings/integrations`, aunque no dispare
llamadas). La preparación para el futuro es **arquitectónica** (interfaces,
límites de módulo, convención `propertyId` como FK) en vez de código muerto
que habría que mantener y probar sin que haga nada todavía.
