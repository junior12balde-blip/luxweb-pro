# Fase 1 — Fundación: Auth + Dashboard + Propiedades

## Qué incluye

- **Scaffolding**: Next.js 15 (App Router) + TypeScript + Tailwind CSS,
  configurado como app independiente en `apps/aibnb-studio/` dentro del
  monorepo `luxweb-pro`.
- **Base de datos**: esquema Prisma (`User`, `Property`, `Membership`) sobre
  PostgreSQL. `docker-compose.yml` para Postgres local; compatible con
  Supabase Postgres en producción.
- **Autenticación**: Supabase Auth (registro, login, logout) con sesión
  gestionada por `src/middleware.ts` — protege todo `/dashboard/*` y
  redirige usuarios ya autenticados fuera de `/login` y `/signup`.
- **Dashboard**: layout responsive (sidebar + topbar) y página de resumen con
  tarjetas de estadísticas (nº de propiedades real; ocupación/ingresos como
  placeholders explícitos, pendientes de la Fase 7).
- **Propiedades**: CRUD completo (crear, listar, editar, eliminar) vía API
  REST (`/api/properties`, `/api/properties/[id]`) con validación Zod y
  control de acceso por `Membership` (cada propiedad solo es visible/editable
  por sus miembros).
- **Pruebas**: 15 tests unitarios (Vitest) para validaciones (`property`,
  `auth`) y el serializador de Prisma → JSON.
- **CI**: `.github/workflows/aibnb-studio-ci.yml` corre typecheck, lint,
  tests y build en cada push/PR que toque `apps/aibnb-studio/`.

## Cómo probarlo

### 1. Requisitos

- Node.js 22+
- Docker (para Postgres local) **o** un proyecto Supabase

### 2. Base de datos local

```bash
cd apps/aibnb-studio
cp .env.example .env.local
docker compose up -d
npm install
npm run db:generate
npm run db:migrate   # nombra la migración, p. ej. "init"
npm run db:seed       # crea un usuario y una propiedad de ejemplo
```

### 3. Autenticación (requiere un proyecto Supabase real)

1. Crear un proyecto en https://supabase.com/dashboard.
2. Copiar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` desde
   **Settings → API** a `.env.local`.
3. En **Authentication → URL Configuration**, añadir
   `http://localhost:3000/auth/callback` a las Redirect URLs.
4. `npm run dev` y abrir http://localhost:3000 → redirige a `/login`.
5. Ir a `/signup`, crear una cuenta. Si la confirmación de email está
   activada en el proyecto Supabase (por defecto), confirmar desde el correo
   recibido antes de iniciar sesión.
6. Iniciar sesión → redirige a `/dashboard`, con la sidebar, las tarjetas de
   resumen y la sección de Propiedades.
7. Crear, editar y eliminar una propiedad desde `/dashboard/properties`.
8. Cerrar sesión desde el botón de la topbar → vuelve a `/login`; intentar
   visitar `/dashboard` directamente confirma que el middleware redirige de
   nuevo a `/login`.

### 4. Verificación automática (sin Supabase/DB reales)

Estos comandos no requieren credenciales — se ejecutan en CI con valores
"placeholder":

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # next lint
npm run test         # vitest (15 tests)
npm run build        # build de producción
```

Todos verificados en verde antes de cerrar esta fase (incluyendo un
`npm run dev` real con capturas de pantalla de `/login` y `/signup` para
confirmar que Tailwind y el flujo de formularios funcionan).

## Qué NO incluye (a propósito)

- Nada de IA (asistente, generador de anuncios, imágenes, vídeos) — eso
  empieza en la Fase 2.
- Analítica real (ocupación/ingresos) — placeholders explícitos en el
  dashboard, conectados a datos reales en la Fase 7.
- Facturación/Stripe — Fase 8.
- Equipos/roles avanzados — el modelo `Membership` ya soporta varios
  usuarios por propiedad con rol (`OWNER`/`EDITOR`/`VIEWER`), pero la UI de
  Fase 1 solo expone el flujo de un anfitrión gestionando sus propias
  propiedades.

## Próxima fase

Fase 2 — Asistente de IA para huéspedes (ver `DEVELOPMENT_PLAN.md`):
capa de abstracción de proveedores de IA (Anthropic/OpenAI), modelo de
conversaciones/mensajes, sugerencias y respuestas automáticas
multi-idioma. Requiere `ANTHROPIC_API_KEY` y/o `OPENAI_API_KEY` — se pedirán
explícitamente al empezar esa fase.
