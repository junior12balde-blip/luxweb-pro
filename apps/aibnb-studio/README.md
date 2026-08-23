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
[`PHASE-5.md`](./PHASE-5.md) para el detalle de lo implementado en cada
fase y cómo probarlo.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth +
Postgres + Storage) · Prisma · Docker (Postgres local) · Vitest · Anthropic
API (texto) · Google Gemini API / Veo (vídeo, Fase 5).

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
  (generación real con Google Gemini API / Veo). Crear en
  [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Sin
  ella, ese botón muestra el mismo tipo de error claro ("proveedor no
  configurado"). `GEMINI_VIDEO_MODEL` (opcional) fija una versión de Veo
  distinta a la por defecto (`veo-2.0-generate-001`).
- Bucket de Supabase Storage `generated-videos` — necesario para que los
  vídeos generados tengan una URL persistente (Fase 5). SQL de creación y
  políticas de RLS en [`PHASE-5.md`](./PHASE-5.md).

Las claves de OpenAI/Google (como proveedor de texto) y Stripe **no
disparan ninguna llamada real todavía** — la arquitectura para conectarlas
ya existe desde la Fase 2 (`src/lib/ai/`), pero se piden explícitamente
solo cuando la fase que las usa de verdad llega (ver
`DEVELOPMENT_PLAN.md`).

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
        properties/[id]/messages/   → conversaciones con huéspedes + sugerencias de IA
        properties/[id]/listing/    → generador de anuncios + historial de versiones
        properties/[id]/videos/     → generador de vídeos (Fase 5) + historial de generaciones
      api/properties/               → API REST de propiedades (CRUD + fotos + conversaciones/mensajes/sugerencias + anuncios + media-generations)
      api/settings/                 → API REST de perfil, avatar y preferencias de IA
    components/
      dashboard/                    → Sidebar, Topbar, StatCard
      properties/                   → PropertyForm, PropertyCard, PhotoGallery, AmenitiesInput...
      messages/                     → NewConversationForm, MessageThread
      listing/                      → ListingGenerator
      video/                        → VideoGenerator, VideoGenerationCard (Fase 5, con sondeo de estado)
      settings/                     → ProfileForm, AvatarUploader, IntegrationsForm, SettingsTabs
      ui/                           → Button, Input, Label, Card, FormError
    lib/
      ai/                           → Provider Manager de texto + guestAssistant.ts (Fase 3) + listingGenerator.ts (Fase 4) — ver ARCHITECTURE.md
      video/                        → Provider Manager de vídeo + propertyVideoGenerator.ts (Fase 5) — ver ARCHITECTURE.md
      supabase/                     → clientes browser/server + middleware de sesión
      prisma.ts                     → cliente Prisma (singleton)
      auth.ts / auth-errors.ts      → sesión + mensajes de error consistentes
      properties.ts / conversations.ts → comprobación de pertenencia (Membership) y de conversaciones
      storage.ts                    → validación de subidas a Supabase Storage
      validations/                  → esquemas Zod (auth, profile, property, ai, conversation, listing, video)
      serializers.ts                → conversión Decimal/Date/relaciones → JSON
  prisma/
    schema.prisma                   → User, Property, PropertyPhoto, Membership, Conversation, Message, ListingDraft, MediaGeneration
    migrations/                     → migraciones versionadas
  tests/unit/                       → Vitest (62 tests)
```
