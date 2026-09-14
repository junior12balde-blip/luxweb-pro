# Arquitectura de AIbnb Studio

Este documento describe las decisiones de arquitectura vigentes y, sobre
todo, **los puntos de extensión pensados para que la Fase 10 se conecte
sin reescribir lo ya construido**. Para el detalle de qué se implementó en
cada fase, ver `PHASE-1.md` / `PHASE-2.md` / `PHASE-3.md` / `PHASE-4.md` /
`PHASE-5.md` / `PHASE-6.md` / `PHASE-7.md` / `PHASE-8.md` / `PHASE-9.md`.
Para el plan de fases completo, ver `DEVELOPMENT_PLAN.md`.

## Capas

```
src/app/            Rutas (App Router): páginas + Route Handlers (API)
src/components/      UI, organizada por dominio (dashboard/, properties/, settings/, ui/)
src/lib/             Lógica de dominio y clientes de infraestructura
  ai/                Arquitectura de proveedores de IA de texto (ver abajo)
  video/             Arquitectura de proveedores de vídeo (Fase 5, ver abajo)
  image/             Arquitectura de proveedores de imagen (Fase 6, ver abajo)
  automations/       Motor de recordatorios (Fase 7, ver abajo)
  billing/           Suscripciones y Stripe (Fase 9, ver abajo)
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

## Arquitectura de proveedores de imagen (Fase 6)

```
src/lib/image/
  types.ts                  ImageProvider, ImageGenerationRequest, ImageGenerationResult
  errors.ts                 ImageProviderNotConfiguredError
  providers/
    google.ts                implementa ImageProvider — llamada real a Google Gemini API
                              (modelo Imagen) vía el SDK oficial @google/genai
  imageProviderManager.ts    registro + resolveImageProvider(), mismo patrón que los otros managers
  propertyImageGenerator.ts  dominio: construye el prompt a partir de la propiedad y
                              orquesta la generación
```

Estructuralmente idéntica a `src/lib/video/`, pero **más simple**: Imagen
devuelve el resultado en la misma llamada HTTP (`ai.models.generateImages`
es síncrona), así que `ImageProvider` no tiene un equivalente a
`checkStatus`/`VideoJobHandle` — `generate()` devuelve directamente los
bytes de la imagen. Esto significa que la API route de imágenes no
necesita un endpoint de estado separado (a diferencia de
`media-generations/[mediaId]/status` para vídeo): todo ocurre en el POST.

Ambas arquitecturas (`video/`, `image/`) comparten el mismo principio que
`ai/`: el dominio solo habla con su manager, nunca con un proveedor
concreto directamente. Añadir un proveedor de imagen nuevo sigue el mismo
patrón — un archivo en `providers/` + una línea de registro.

## Arquitectura de automatizaciones (Fase 7)

```
src/lib/automations/
  types.ts             AutomationType (en @/types/automation), ANCHOR_FIELD,
                        DEFAULT_OFFSET_HOURS, etiquetas
  templates.ts          DEFAULT_MESSAGE_TEMPLATE por tipo + renderTemplate()
  engine.ts              runDueAutomations(now) — motor sin estado en memoria,
                          todo se lee/escribe en Postgres en cada llamada
```

No hay Provider Manager aquí — no hay proveedor externo que resolver, es
lógica de dominio pura (comparar fechas, sustituir placeholders) sobre
datos que ya están en Postgres (`Conversation.checkInDate`/`checkOutDate`,
`Automation`). El único punto de entrada externo es
`POST /api/cron/automations`, protegido con un secreto compartido
(`CRON_SECRET`) en vez de sesión de usuario, porque lo llama un cron de
GitHub Actions (`.github/workflows/aibnb-studio-automations-cron.yml`), no
un navegador — mismo principio "sin *worker* en segundo plano dentro de la
app" que el sondeo de vídeo de la Fase 5, pero resuelto con un disparador
externo en vez de sondeo desde el cliente, porque aquí no hay ninguna
pestaña abierta esperando el resultado.

`AutomationRun` es intencionalmente un registro de recordatorios **para el
anfitrión** (dashboard), no un envío real a ningún canal — ver "Qué NO
incluye" en `PHASE-7.md` para por qué no se conecta todavía a
`User.notificationPrefs.emailOnBookingReminder` con un envío de email real.

## Arquitectura de facturación (Fase 9)

```
src/lib/billing/
  plans.ts             tablas de planes/límites + mapeo plan de pago ↔ Price ID de Stripe
  stripeClient.ts       cliente Stripe perezoso (apiVersion fijado al valor del SDK instalado)
  subscription.ts       getUserSubscription() (FREE implícito) + checkPropertyLimit()
  errors.ts             StripeNotConfiguredError, PlanNotConfiguredError
```

Sin Provider Manager (solo hay un proveedor de pagos posible: Stripe, no
tiene sentido una capa de abstracción para "el único"). El límite de
propiedades por plan es lógica de dominio pura (`checkPropertyLimit()`),
completamente independiente de si Stripe está configurado — un despliegue
sin ninguna clave de Stripe sigue aplicando el límite del plan Gratis con
normalidad, porque un usuario sin fila en `Subscription` ya se trata como
Gratis (mismo "valor por defecto sin persistir" que las automatizaciones
de la Fase 7).

Los tres puntos de entrada externos:

- `POST /api/billing/checkout` y `POST /api/billing/portal` — el usuario
  autenticado inicia la llamada a Stripe (crear una Checkout Session o una
  sesión del Customer Portal) y se le redirige a una URL alojada por
  Stripe. La app nunca ve ni almacena datos de tarjeta.
- `POST /api/webhooks/stripe` — Stripe llama a la app (dirección
  contraria), protegido por verificación de firma
  (`STRIPE_WEBHOOK_SECRET`) sobre el body crudo, no por sesión de usuario
  — mismo principio que `POST /api/cron/automations` (Fase 7): el llamador
  no es un navegador, así que la autenticación no puede ser una cookie de
  sesión.

**Cómo añadir un plan nuevo:** añadir el id a `PlanId` (`@/types/billing`),
una entrada en `PLAN_PROPERTY_LIMIT`/`PLAN_LABELS`/`PLAN_PRICE_ENV_VAR`
(`plans.ts`), documentar su variable `STRIPE_PRICE_*` en `.env.example` y
crear el producto/price correspondiente en el Dashboard de Stripe. Ningún
otro archivo cambia.

## Arquitectura de analítica (Fase 8)

```
src/lib/analytics/
  metrics.ts    computeUserMetrics(userId, range) + computeNightsOverlap() + getDefaultRange()
  csv.ts        buildAnalyticsCsv()
  format.ts     formatCurrency()/formatPercent() (Intl.NumberFormat, sin dependencia nueva)
```

Sin modelo de Prisma propio ni migración — todo se calcula al vuelo a
partir de `Property.nightlyPrice` y `Conversation.checkInDate`/
`checkOutDate` (Fase 7). Es la pieza más simple de las construidas hasta
ahora: no hay proveedor externo, no hay estado que persistir, solo una
función pura (`computeUserMetrics`) que una página de servidor y un Route
Handler (`/api/analytics/export`) reutilizan por igual. Los ingresos se
agrupan **por moneda** (`revenueByCurrency: Record<string, number>`) y
nunca se suman monedas distintas entre sí — cualquier vista que consuma
esto debe respetar esa forma en vez de aplanarla a un solo número.

**Por qué "ingresos" es siempre una estimación:** no existe ningún modelo
de reservas ni de pagos (decisión explícita de la Fase 7, ver
`PHASE-7.md`). Si una fase futura añade uno, `computeUserMetrics()` es el
único lugar que tendría que cambiar — su forma de salida (`UserMetrics`
en `@/types/analytics`) no tendría por qué cambiar.

## Puntos de extensión por fase futura

| Fase | Qué añade | Dónde se conecta (ya existe) |
|---|---|---|
| Envío real de recordatorios por email | Leer `AutomationRun` en estado `DUE` + `User.notificationPrefs.emailOnBookingReminder` y enviar con un proveedor de email (a decidir, sin clave todavía) | `src/lib/automations/engine.ts`, `NotificationPreferences` (Fase 2) |
| Concepto de "organización" (si hace falta multi-usuario en la factura) | `Subscription` movería su FK de `User` a esa entidad; el resto de `src/lib/billing/` no cambiaría | `src/lib/billing/subscription.ts` |
| Sistema de reservas/pagos real | `computeUserMetrics()` dejaría de estimar y leería importes reales — mismo tipo de salida (`UserMetrics`), no rompería la UI | `src/lib/analytics/metrics.ts` |

## Multi-tenancy y permisos

Todo objeto de dominio (`Property`, `Conversation`, `ListingDraft`,
`MediaGeneration` — vídeo e imagen, mismo modelo —, `Automation`/
`AutomationRun`) cuelga de `Property.id`,
y el acceso de un usuario a una propiedad siempre se resuelve por
`Membership` (`src/lib/properties.ts`). Esto ya soporta equipos (varios
usuarios por propiedad, con rol `OWNER`/`EDITOR`/`VIEWER`) aunque la UI
actual solo expone el caso de un anfitrión gestionando lo suyo — añadir
"invitar a un colaborador" en el futuro no requiere cambiar el modelo de
datos.

## Almacenamiento de ficheros

Todas las subidas (avatar, fotos de propiedad, y desde la Fase 5 los
vídeos e imágenes generados) pasan por el servidor — nunca directamente
del navegador a Supabase Storage — para poder validar tipo/tamaño y
comprobar pertenencia antes de escribir. `src/lib/storage.ts` centraliza
los nombres de bucket y esa validación. Los buckets `generated-videos`
(Fase 5) y `generated-images` (Fase 6) son ligeramente distintos al de
fotos: el propio servidor obtiene el archivo del proveedor de IA
(descargándolo a un temporal para vídeo; los bytes ya vienen en la
respuesta para imagen) y lo sube a Storage él mismo — no hay subida
directa del navegador en absoluto, ni siquiera mediada — pero sigue el
mismo principio de nunca confiar en el cliente para escribir en Storage.

## Por qué no hay más "preparación" que esta

Se evitó a propósito añadir columnas, tablas o módulos vacíos "por si
acaso" (p. ej. una tabla vacía sin ningún consumidor real, o un
`videoProvider.ts` sin implementación real). Cada pieza construida en la Fase 2
tiene un consumidor real hoy (la preferencia de proveedor de IA se guarda y
se lee desde `/dashboard/settings/integrations`, aunque no dispare
llamadas). La preparación para el futuro es **arquitectónica** (interfaces,
límites de módulo, convención `propertyId` como FK) en vez de código muerto
que habría que mantener y probar sin que haga nada todavía.
