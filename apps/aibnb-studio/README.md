# AIbnb Studio

SaaS que ayuda a anfitriones de Airbnb a automatizar la gestión de sus
alojamientos mediante IA: mensajería con huéspedes, generación de anuncios,
imágenes y vídeos promocionales, automatizaciones y analítica.

Vive dentro del monorepo `luxweb-pro`, en `apps/aibnb-studio/`, como proyecto
independiente de LuxWeb Pro (la agencia de sitios web, en la raíz del repo).

Ver [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) para el plan completo de
fases y [`PHASE-1.md`](./PHASE-1.md) para el detalle de lo implementado en la
Fase 1 y cómo probarlo.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth +
Postgres) · Prisma · Docker (Postgres local) · Vitest.

## Empezar

```bash
cd apps/aibnb-studio
npm install
cp .env.example .env.local   # rellenar según la sección "Configuración"
docker compose up -d          # Postgres local
npm run db:generate
npm run db:migrate            # crea las tablas
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
  privada, no usada todavía en la Fase 1 pero reservada para operaciones de
  servidor futuras. Nunca exponerla al cliente.

Las claves de IA (Anthropic/OpenAI/Google), Higgsfield y Stripe **no son
necesarias en la Fase 1** — se documentan y se piden en las fases donde se
usan (ver `DEVELOPMENT_PLAN.md`).

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
      (auth)/login, (auth)/signup   → páginas de autenticación
      auth/callback/route.ts        → callback de confirmación de email de Supabase
      dashboard/                    → layout protegido (sidebar + topbar)
        page.tsx                    → resumen con estadísticas
        properties/                 → listado, alta y edición de propiedades
      api/properties/               → API REST de propiedades (CRUD)
    components/
      dashboard/                    → Sidebar, Topbar, StatCard
      properties/                   → PropertyForm, PropertyCard, DeletePropertyButton
      ui/                           → Button, Input, Label, Card, FormError
    lib/
      supabase/                     → clientes browser/server + middleware de sesión
      prisma.ts                     → cliente Prisma (singleton)
      auth.ts                       → helpers de sesión (requireUser / getCurrentUser)
      validations/                  → esquemas Zod (auth, property)
      serializers.ts                → conversión Decimal/Date → JSON
  prisma/schema.prisma               → User, Property, Membership
  tests/unit/                        → Vitest
```
