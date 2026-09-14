# AIbnb Studio

SaaS que ayuda a anfitriones de Airbnb a automatizar la gestión de sus
alojamientos mediante IA: mensajería con huéspedes, generación de anuncios,
imágenes y vídeos promocionales, automatizaciones y analítica.

Vive dentro del monorepo `luxweb-pro`, en `apps/aibnb-studio/`, como proyecto
independiente de LuxWeb Pro (la agencia de sitios web, en la raíz del repo).

Ver [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) para el plan completo de
fases, [`ARCHITECTURE.md`](./ARCHITECTURE.md) para las decisiones de
arquitectura y los puntos de extensión de las fases futuras, y
[`PHASE-1.md`](./PHASE-1.md) / [`PHASE-2.md`](./PHASE-2.md) /
[`PHASE-3.md`](./PHASE-3.md) / [`PHASE-4.md`](./PHASE-4.md) /
[`PHASE-5.md`](./PHASE-5.md) / [`PHASE-6.md`](./PHASE-6.md) /
[`PHASE-7.md`](./PHASE-7.md) / [`PHASE-9.md`](./PHASE-9.md) para el
detalle de lo implementado en cada fase y cómo probarlo. La Fase 8
(Analítica) está pendiente — se saltó a la 9 a petición del cliente.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth +
Postgres + Storage) · Prisma · Docker (Postgres local) · Vitest · Anthropic
API (texto) · Google Gemini API / Veo (vídeo, Fase 5) / Imagen (imagen,
Fase 6) · cron de GitHub Actions (automatizaciones, Fase 7) · Stripe
(facturación, Fase 9).

## Empezar

```bash
cd apps/aibnb-studio
npm install
cp .env.example .env.local   # rellenar según la sección "Configuración"
docker compose up -d          # Postgres local
npm run db:generate
npm run db:migrate            # aplica las migraciones versionadas
npm run db:seed               # datos de ejemplo (opcional)
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Configuración

Copiar `.env.example` a `.env.local` y rellenar:

- `DATABASE_URL` / `DIRECT_URL` — conexión Postgres para Prisma. Con
  `docker compose up -d` los valores por defecto del ejemplo ya funcionan.
  Para Supabase en producción, ver comentarios en `.env.example`.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — crear un
  proyecto en [supabase.com/dashboard](https://supabase.com/dashboard) y
  copiar desde **Settings → API**. Necesario para que el login/registro
  funcionen (sin esto, las páginas cargan pero las llamadas a Supabase
  fallarán).
- `SUPABASE_SERVICE_ROLE_KEY` — **Settings → API → `service_role`**. Clave
  privada, reservada para operaciones de servidor futuras. Nunca exponerla
  al cliente.
- Buckets de Supabase Storage (`avatars`, `property-photos`) — necesarios
  para subir foto de perfil y fotos de propiedad (Fase 2). SQL de creación
  y políticas de RLS en [`PHASE-2.md`](./PHASE-2.md).
- `NEXT_PUBLIC_SITE_URL` (opcional) — ver `.env.example`.

- `ANTHROPIC_API_KEY` — **necesaria desde la Fase 3** para "Sugerir
  respuesta" (asistente de huéspedes) y "Generar anuncio" (Fase 4). Crear
  en [console.anthropic.com](https://console.anthropic.com/) → API Keys.
  Sin ella, la app funciona igual pero esos botones muestran un error
  claro ("proveedor no configurado") en vez de fallar de forma confusa.
- `GOOGLE_AI_API_KEY` — **necesaria desde la Fase 5** para "Generar vídeo"
  (Veo) y **desde la Fase 6** para "Generar imagen" (Imagen) — misma clave
  para ambos, mismo SDK `@google/genai`. Crear en
  [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Sin
  ella, esos botones muestran el mismo tipo de error claro ("proveedor no
  configurado"). `GEMINI_VIDEO_MODEL` / `GEMINI_IMAGE_MODEL` (opcionales)
  fijan una versión distinta a la por defecto (`veo-2.0-generate-001` /
  `imagen-4.0-generate-001`).
- Buckets de Supabase Storage `generated-videos` / `generated-images` —
  necesarios para que los vídeos e imágenes generados tengan una URL
  persistente (Fases 5 y 6). SQL de creación y políticas de RLS en
  [`PHASE-5.md`](./PHASE-5.md) / [`PHASE-6.md`](./PHASE-6.md).
- `CRON_SECRET` — **necesaria desde la Fase 7** para que el cron de
  automatizaciones funcione. No es la clave de ningún proveedor externo:
  la generas tú mismo (`openssl rand -hex 32`) y la pones tanto aquí como
  en los secretos de GitHub Actions del repositorio
  (`AIBNB_SITE_URL` / `AIBNB_CRON_SECRET`) — ver
  [`PHASE-7.md`](./PHASE-7.md).
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — **necesarias desde la
  Fase 9** para "Suscribirse"/"Gestionar facturación". Crear en
  [dashboard.stripe.com](https://dashboard.stripe.com/apikeys) (clave) y
  [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
  (endpoint apuntando a `/api/webhooks/stripe`). Sin ellas, esos botones
  muestran el mismo tipo de error claro ("Stripe no está configurado") —
  el límite de propiedades del plan Gratis funciona igual sin Stripe.
- `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` / `STRIPE_PRICE_BUSINESS` —
  Price ID de tu cuenta de Stripe para cada plan de pago (no inventados —
  se crean en tu Dashboard). Sin uno de ellos, ese plan concreto no se
  puede contratar. Ver [`PHASE-9.md`](./PHASE-9.md).

Las claves de OpenAI/Google (como proveedor de texto) **no disparan
ninguna llamada real todavía** — la arquitectura para conectarlas ya
existe desde la Fase 2 (`src/lib/ai/`), pero se piden explícitamente solo
cuando la fase que las usa de verdad llega (ver `DEVELOPMENT_PLAN.md`).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build de producción |
| `npm run lint` / `npm run typecheck` | Calidad de código |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run db:generate` | Genera el cliente de Prisma |
| `npm run db:migrate` | Aplica migraciones (desarrollo) |
| `npm run db:seed` | Carga datos de ejemplo |
| `npm run db:studio` | Abre Prisma Studio |

## Estructura

```
apps/aibnb-studio/
  src/
    app/
      (auth)/login, signup, forgot-password, reset-password, verify-email
      auth/callback/route.ts        → callback de Supabase (confirmación y recuperación)
      dashboard/                    → layout protegido (sidebar + topbar)
        page.tsx                    → resumen con estadísticas
        properties/                 → listado, alta y edición (fotos, amenities, normas...)
        settings/profile/           → perfil (nombre, avatar, idioma, zona horaria, notificaciones)
        settings/integrations/      → estado de proveedores de IA + preferencia del anfitrión
        settings/billing/           → plan actual, uso de propiedades, suscribirse/gestionar pago (Fase 9)
        properties/[id]/messages/   → conversaciones con huéspedes + sugerencias de IA
        properties/[id]/listing/    → generador de anuncios + historial de versiones
        properties/[id]/videos/     → generador de vídeos (Fase 5) + historial de generaciones
        properties/[id]/images/     → generador de imágenes (Fase 6) + historial de generaciones
        properties/[id]/automations/ → recordatorios automáticos (Fase 7) + historial
      api/properties/               → API REST de propiedades (CRUD + fotos + conversaciones/mensajes/sugerencias + anuncios + media-generations + image-generations + automations)
      api/cron/automations/         → endpoint protegido (CRON_SECRET) llamado por el cron de GitHub Actions (Fase 7)
      api/billing/                  → checkout y portal de cliente de Stripe (Fase 9)
      api/webhooks/stripe/          → recibe eventos de Stripe, firma verificada (Fase 9)
      api/settings/                 → API REST de perfil, avatar y preferencias de IA
    components/
      dashboard/                    → Sidebar, Topbar, StatCard
      properties/                   → PropertyForm, PropertyCard, PhotoGallery, AmenitiesInput...
      messages/                     → NewConversationForm, MessageThread, ConversationDatesForm (Fase 7)
      listing/                      → ListingGenerator
      video/                        → VideoGenerator, VideoGenerationCard (Fase 5, con sondeo de estado)
      image/                        → ImageGenerator, ImageGenerationCard (Fase 6, síncrono, sin sondeo)
      automations/                  → AutomationSettings, AutomationRunList (Fase 7)
      billing/                      → BillingPlans (Fase 9)
      settings/                     → ProfileForm, AvatarUploader, IntegrationsForm, SettingsTabs
      ui/                           → Button, Input, Label, Card, FormError
    lib/
      ai/                           → Provider Manager de texto + guestAssistant.ts (Fase 3) + listingGenerator.ts (Fase 4) — ver ARCHITECTURE.md
      video/                        → Provider Manager de vídeo + propertyVideoGenerator.ts (Fase 5) — ver ARCHITECTURE.md
      image/                        → Provider Manager de imagen + propertyImageGenerator.ts (Fase 6) — ver ARCHITECTURE.md
      automations/                  → motor de recordatorios: types.ts, templates.ts, engine.ts (Fase 7) — ver ARCHITECTURE.md
      billing/                      → planes, cliente Stripe, resolución de suscripción (Fase 9) — ver ARCHITECTURE.md
      supabase/                     → clientes browser/server + middleware de sesión
      prisma.ts                     → cliente Prisma (singleton)
      auth.ts / auth-errors.ts      → sesión + mensajes de error consistentes
      properties.ts / conversations.ts → comprobación de pertenencia (Membership) y de conversaciones
      storage.ts                    → validación de subidas a Supabase Storage
      validations/                  → esquemas Zod (auth, profile, property, ai, conversation, listing, video, image, automation, billing)
      serializers.ts                → conversión Decimal/Date/relaciones → JSON
  prisma/
    schema.prisma                   → User, Property, PropertyPhoto, Membership, Conversation, Message, ListingDraft, MediaGeneration, Automation, AutomationRun, Subscription
    migrations/                     → migraciones versionadas
  tests/unit/                       → Vitest (83 tests)
```

`.github/workflows/aibnb-studio-automations-cron.yml` (Fase 7) — cron cada
15 minutos que llama a `/api/cron/automations` en el despliegue.
