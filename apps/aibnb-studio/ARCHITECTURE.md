# Arquitectura de AIbnb Studio

Este documento describe las decisiones de arquitectura vigentes y, sobre
todo, **los puntos de extensión pensados para que las Fases 6-9 se
conecten sin reescribir lo ya construido**. Para el detalle de qué se
implementó en cada fase, ver `PHASE-1.md` / `PHASE-2.md` / `PHASE-3.md` /
`PHASE-4.md` / `PHASE-5.md`. Para el plan de fases completo, ver
`DEVELOPMENT_PLAN.md`.

## Capas

```
src/app/            Rutas (App Router): páginas + Route Handlers (API)
src/components/      UI, organizada por dominio (dashboard/, properties/, settings/, ui/)
src/lib/             Lógica de dominio y clientes de infraestructura
  ai/                Arquitectura de proveedores de IA de texto (ver abajo)
  video/             Arquitectura de proveedores de vídeo (Fase 5, ver abajo)
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
  listingGenerator.ts  dominio de la Fase 4: prompt + parseo/validación del JSON de título/descripción/SEO
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

El mismo patrón se reutilizó en la Fase 4 (`listingGenerator.ts`) sin tocar
`providerManager.ts` ni la interfaz `AIProvider`: cuando el texto generado
debe tener una forma concreta (título/descripción/highlights/SEO), la
instrucción de "responde solo con este JSON" va en el prompt del módulo de
dominio, y el propio módulo parsea y valida la respuesta con Zod — así se
sigue funcionando con cualquier proveedor que devuelva texto plano, sin
depender de una función de "structured output" específica de un proveedor
concreto. Cualquier fase futura que necesite IA de texto con una forma de
salida concreta debe seguir este mismo patrón.

**Cómo añadir un proveedor nuevo (p. ej. Mistral) en cualquier fase
futura:**

1. Crear `src/lib/ai/providers/mistral.ts` implementando `AIProvider`.
2. Añadir `"mistral"` a `AIProviderId`/`AI_PROVIDER_IDS` en `types.ts`.
3. Registrarlo en `providerManager.ts`.

Ningún otro archivo cambia — ese es el punto del Provider Manager.

## Arquitectura de proveedores de vídeo (Fase 5)

```
src/lib/video/
  types.ts                  VideoProvider, VideoJobHandle, VideoJobResult, GenerateVideoParams
  errors.ts                 VideoProviderNotConfiguredError
  providers/
    google.ts                implementa VideoProvider — llamada real a Google Gemini API
                              (modelos Veo) vía el SDK oficial @google/genai
  videoProviderManager.ts    registro + resolveVideoProvider(), mismo patrón que providerManager.ts
  propertyVideoGenerator.ts  dominio: construye el prompt a partir de la propiedad y
                              orquesta el inicio de la generación
```

Deliberadamente **no** es el mismo Provider Manager que `src/lib/ai/`: la
generación de vídeo es un trabajo asíncrono de varios minutos con sondeo de
estado (`isConfigured` / `startGeneration` / `checkStatus`), mientras que la
generación de texto es una llamada síncrona (`generateText`) — forzar la
misma interfaz habría sido una abstracción incorrecta. Ambas comparten el
mismo principio: el dominio y la API solo hablan con el manager
correspondiente, nunca con un proveedor concreto (`google.ts`) directamente.

El proveedor de vídeo persiste solo `providerJobId` (el nombre de la
operación) en `MediaGeneration.providerJobId` entre peticiones HTTP, porque
la app es *stateless* entre peticiones — no hay proceso en segundo plano
manteniendo el trabajo en memoria; cada consulta de estado reconstruye lo
mínimo necesario para seguir el sondeo.

**Cómo añadir un proveedor de vídeo nuevo:** igual que con `src/lib/ai/` —
un archivo nuevo en `src/lib/video/providers/` implementando `VideoProvider`
más una línea de registro en `videoProviderManager.ts`. Ningún otro archivo
cambia.

## Puntos de extensión por fase futura

| Fase | Qué añade | Dónde se conecta (ya existe) |
|---|---|---|
| 6 — Generador de imágenes | Mismo modelo `MediaGeneration` de la Fase 5 con tipo `IMAGE`; muy probablemente reutilizando `src/lib/video/` como plantilla de arquitectura (o su equivalente síncrono, al no requerir sondeo) | `src/lib/video/`, `MediaGeneration` |
| 7 — Automatizaciones | `Automation`/`ScheduledMessage` (Prisma, FK a `Property`), scheduler (cron de GitHub Actions o `pg-boss` sobre el mismo Postgres — decisión pendiente, ver `DEVELOPMENT_PLAN.md`) | `notificationPrefs` de `User` (Fase 2) ya modela "qué quiere recibir el anfitrión" |
| 8 — Analítica | Lee de `Property`, `Membership`, y de los modelos de reservas que se añadan; los `StatCard` del dashboard (Fase 1) ya tienen placeholders explícitos esperando estos datos | `src/components/dashboard/StatCard.tsx` |
| 9 — Stripe | `Subscription`/`Plan` (Prisma, FK a `User` u organización), webhooks en `src/app/api/stripe/webhook/route.ts` (patrón ya usado por `auth/callback`) | Route Handlers existentes como plantilla |

## Multi-tenancy y permisos

Todo objeto de dominio (`Property`, `Conversation`, `ListingDraft`,
`MediaGeneration`, y en el futuro `Automation`...) cuelga de `Property.id`,
y el acceso de un usuario a una propiedad siempre se resuelve por
`Membership` (`src/lib/properties.ts`). Esto ya soporta equipos (varios
usuarios por propiedad, con rol `OWNER`/`EDITOR`/`VIEWER`) aunque la UI
actual solo expone el caso de un anfitrión gestionando lo suyo — añadir
"invitar a un colaborador" en el futuro no requiere cambiar el modelo de
datos.

## Almacenamiento de ficheros

Todas las subidas (avatar, fotos de propiedad, y desde la Fase 5 los vídeos
generados) pasan por el servidor — nunca directamente del navegador a
Supabase Storage — para poder validar tipo/tamaño y comprobar pertenencia
antes de escribir. `src/lib/storage.ts` centraliza los nombres de bucket y
esa validación. El caso del bucket `generated-videos` (Fase 5) es
ligeramente distinto al de fotos: el propio servidor descarga el vídeo
terminado del proveedor de IA a un archivo temporal y lo sube a Storage
él mismo (no hay subida directa del navegador en absoluto, ni siquiera
mediada) — incluso así sigue el mismo principio de nunca confiar en el
cliente para escribir en Storage. Un futuro bucket de imágenes (Fase 6)
seguirá el mismo patrón.

## Por qué no hay más "preparación" que esta

Se evitó a propósito añadir columnas, tablas o módulos vacíos "por si
acaso" (p. ej. una tabla `Automation` sin ningún campo real, o un
`videoProvider.ts` sin implementación real). Cada pieza construida en la Fase 2
tiene un consumidor real hoy (la preferencia de proveedor de IA se guarda y
se lee desde `/dashboard/settings/integrations`, aunque no dispare
llamadas). La preparación para el futuro es **arquitectónica** (interfaces,
límites de módulo, convención `propertyId` como FK) en vez de código muerto
que habría que mantener y probar sin que haga nada todavía.
