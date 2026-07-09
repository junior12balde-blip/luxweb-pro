# AIbnb Studio

SaaS que ayuda a anfitriones de Airbnb a automatizar la gestión de sus
alojamientos mediante IA: mensajería con huéspedes, generación de anuncios,
imágenes y vídeos promocionales, automatizaciones y analítica.

Vive dentro del monorepo `luxweb-pro`, en `apps/aibnb-studio/`, como proyecto
independiente de LuxWeb Pro (la agencia de sitios web, en la raíz del repo).

Ver [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) para el plan completo de
fases, [`ARCHITECTURE.md`](./ARCHITECTURE.md) para las decisiones de
arquitectura y los puntos de extensión de las fases futuras, y
[`PHASE-1.md`](./PHASE-1.md) / [`PHASE-2.md`](./PHASE-2.md) para el detalle
de lo implementado en cada fase y cómo probarlo.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth +
Postgres + Storage) · Prisma · Docker (Postgres local) · Vitest.

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

Las claves de IA (Anthropic/OpenAI/Google), Higgsfield y Stripe **no
disparan ninguna llamada real todavía** — la arquitectura para conectarlas
ya existe desde la Fase 2 (`src/lib/ai/`), pero se piden explícitamente
solo cuando la fase que las usa de verdad llega (ver `DEVELOPMENT_PLAN.md`).

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
      api/properties/               → API REST de propiedades (CRUD + fotos)
      api/settings/                 → API REST de perfil, avatar y preferencias de IA
    components/
      dashboard/                    → Sidebar, Topbar, StatCard
      properties/                   → PropertyForm, PropertyCard, PhotoGallery, AmenitiesInput...
      settings/                     → ProfileForm, AvatarUploader, IntegrationsForm, SettingsTabs
      ui/                           → Button, Input, Label, Card, FormError
    lib/
      ai/                           → Provider Manager (Anthropic/OpenAI/Google) — ver ARCHITECTURE.md
      supabase/                     → clientes browser/server + middleware de sesión
      prisma.ts                     → cliente Prisma (singleton)
      auth.ts / auth-errors.ts      → sesión + mensajes de error consistentes
      properties.ts                 → comprobación de pertenencia (Membership)
      storage.ts                    → validación de subidas a Supabase Storage
      validations/                  → esquemas Zod (auth, profile, property, ai)
      serializers.ts                → conversión Decimal/Date/relaciones → JSON
  prisma/
    schema.prisma                   → User, Property, PropertyPhoto, Membership
    migrations/                     → migraciones versionadas
  tests/unit/                       → Vitest (37 tests)
```
