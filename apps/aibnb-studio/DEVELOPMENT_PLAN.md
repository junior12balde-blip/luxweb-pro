# AIbnb Studio — Plan de Desarrollo

SaaS que ayuda a anfitriones de Airbnb a automatizar la gestión de sus
alojamientos mediante IA: mensajería automática con huéspedes, generación de
anuncios, imágenes y vídeos promocionales, automatizaciones y analítica.

Vive en `apps/aibnb-studio/` de este monorepo, como proyecto independiente de
LuxWeb Pro (que sigue intacto en la raíz del repo).

## Principios de desarrollo

- Fases pequeñas, verificables antes de avanzar a la siguiente.
- Cada fase: código + pruebas + documentación + `npm run typecheck` / `lint` /
  `test` en verde antes de cerrarla.
- Ninguna clave de API se inventa. Cuando una fase necesita una API externa,
  el documento de la fase indica: qué API, para qué sirve, dónde crear la
  clave y cómo configurarla en `.env.local` / variables de entorno de
  despliegue.
- Arquitectura preparada para añadir proveedores de IA (Anthropic, OpenAI,
  Google AI, Higgsfield, otros futuros) sin reescribir el dominio: toda
  llamada a IA pasa por una capa de abstracción (`src/lib/ai/`).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Estilos | Tailwind CSS |
| Base de datos | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | Supabase Auth (email/password + OAuth) |
| Pagos | Stripe |
| Contenedores | Docker / docker-compose (Postgres local) |
| CI/CD | GitHub Actions |
| IA texto | Anthropic API / OpenAI API / Google AI (intercambiables) |
| IA vídeo | Higgsfield |
| IA imagen | proveedor de imágenes (a definir en Fase 5, vía capa `src/lib/ai/image.ts`) |

## Fases

### Fase 0 — Planificación (este documento)
Estructura del monorepo, plan de fases, decisiones de arquitectura. **Estado: hecho.**

### Fase 1 — Fundación: Auth + Dashboard + Propiedades
- Scaffolding Next.js + TypeScript + Tailwind dentro de `apps/aibnb-studio`.
- Esquema Prisma inicial: `User`, `Property`, `Membership` (relación
  usuario↔propiedad, preparada para equipos/multi-usuario futuro).
- Autenticación con Supabase (registro, login, logout, sesión protegida por
  middleware).
- Dashboard con layout responsive (sidebar + topbar).
- CRUD de propiedades (crear, listar, editar, eliminar) — sin IA todavía.
- Panel de estadísticas con tarjetas placeholder (nº propiedades, ocupación,
  ingresos) listas para conectarse a datos reales en la Fase 7.
- Pruebas unitarias (Vitest) de validaciones y helpers.
- Docker Compose para Postgres local + `.env.example` documentado.
- CI (GitHub Actions): typecheck + lint + test en cada push/PR.
- **Estado: en progreso en esta sesión.**

### Fase 2 — Asistente de IA para huéspedes
- Modelo `Conversation` / `Message` en Prisma.
- Capa de abstracción `src/lib/ai/provider.ts` con interfaz común
  (`generateReply`, `suggestReplies`) e implementaciones para Anthropic y
  OpenAI seleccionables por variable de entorno.
- Sugerencia de respuestas + respuesta automática configurable por el
  anfitrión (tono, idioma, reglas).
- Detección de idioma del huésped y respuesta en el mismo idioma.
- "Aprendizaje del estilo": el anfitrión marca respuestas pasadas como
  ejemplo de su estilo; se usan como *few-shot examples* en el prompt.
- Requiere: `ANTHROPIC_API_KEY` y/o `OPENAI_API_KEY` (ver sección APIs abajo).

### Fase 3 — Generador de anuncios
- Formulario que recoge datos de la propiedad (ubicación, tipo, servicios,
  fotos existentes).
- Generación de títulos, descripciones optimizadas y listas de servicios
  usando la misma capa `src/lib/ai/provider.ts`.
- Sugerencias de optimización SEO (palabras clave, longitud, estructura).
- Historial de versiones generadas por propiedad.

### Fase 4 — Generador de vídeos (Higgsfield)
- Integración con Higgsfield (MCP/API) para:
  - Vídeos cinematográficos de la propiedad.
  - Vídeos verticales (TikTok/Reels/Shorts).
  - Anuncios publicitarios automáticos.
- Cola de generación (los vídeos tardan) con estado (`pending`,
  `processing`, `ready`, `failed`) y notificación al terminar.
- Requiere: acceso a Higgsfield (ya disponible como MCP en este entorno de
  desarrollo; en producción se documentará el endpoint/API key equivalente).

### Fase 5 — Generador de imágenes
- Fotos promocionales, imágenes para redes sociales, banners.
- Misma cola de generación que vídeos, reutilizando infraestructura de Fase 4.
- Requiere: proveedor de generación de imágenes (a decidir — p. ej. la misma
  cuenta de Higgsfield/Magnific ya disponible, u otra API de imagen).

### Fase 6 — Automatizaciones
- Programación de mensajes (check-in, check-out, bienvenida).
- Recordatorios al anfitrión y al huésped.
- Seguimiento post-estancia.
- Solicitud automática de reseñas.
- Requiere un *scheduler* (cron jobs vía GitHub Actions programado, o cola
  tipo `pg-boss` sobre el mismo Postgres — se decidirá en la fase con
  justificación de coste/complejidad).

### Fase 7 — Analítica
- Ocupación, ingresos, rendimiento por propiedad y agregados.
- Informes descargables (CSV/PDF).
- Conecta los placeholders del dashboard de Fase 1 a datos reales.

### Fase 8 — Facturación (Stripe)
- Planes de suscripción (Starter/Pro/Business).
- Checkout, portal de cliente, webhooks de Stripe.
- Límites por plan (nº de propiedades, generaciones de IA/mes).
- Requiere: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

### Fase 9 — Endurecimiento y despliegue
- Rate limiting, manejo de errores centralizado, logging.
- Dockerfile de producción multi-stage.
- Pipeline CI/CD completo (build, test, deploy).
- Documentación de operaciones.

## APIs externas — resumen de lo que se necesitará y cuándo

Ninguna de estas claves se inventa ni se pide antes de que la fase
correspondiente las necesite. Cuando llegue el momento, se indicará aquí y en
`.env.example` exactamente:

| Variable | Para qué sirve | Dónde crearla | Fase |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (DB + Auth) | https://supabase.com/dashboard → New project → Settings → API | 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (cliente) de Supabase | Supabase → Settings → API → `anon public` | 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada (servidor) de Supabase, para operaciones admin | Supabase → Settings → API → `service_role` (¡nunca exponer al cliente!) | 1 |
| `DATABASE_URL` | Cadena de conexión Postgres para Prisma | Supabase → Settings → Database → Connection string (modo `URI`, usar el *pooler* `?pgbouncer=true` para runtime y la conexión directa para migraciones) | 1 |
| `ANTHROPIC_API_KEY` | Respuestas IA a huéspedes / generación de anuncios (Claude) | https://console.anthropic.com/ → API Keys | 2 |
| `OPENAI_API_KEY` | Alternativa/fallback de proveedor de IA de texto | https://platform.openai.com/api-keys | 2 |
| `GOOGLE_AI_API_KEY` | Alternativa adicional de proveedor de IA de texto (Gemini) | https://aistudio.google.com/apikey | 2 (opcional) |
| Higgsfield (vídeo) | Generación de vídeos cinematográficos y verticales | Ya disponible como servidor MCP en este entorno; en producción, ver https://higgsfield.ai para credenciales de API equivalentes | 4 |
| Proveedor de imágenes | Fotos promocionales, banners | A decidir en Fase 5 | 5 |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Pagos y suscripciones | https://dashboard.stripe.com/apikeys y https://dashboard.stripe.com/webhooks | 8 |

## Estructura del monorepo

```
luxweb-pro/                    (proyecto existente, intacto — LuxWeb Pro)
apps/
  aibnb-studio/                (nuevo — este proyecto)
    src/
      app/                     App Router: (auth), dashboard, api
      components/              UI + componentes de dominio
      lib/                     supabase, prisma, ai/, validations
      types/
    prisma/
      schema.prisma
    tests/
    docker-compose.yml
    Dockerfile
    .env.example
    DEVELOPMENT_PLAN.md        (este archivo)
    PHASE-1.md                 (detalle + cómo probar la Fase 1)
    README.md
.github/workflows/aibnb-studio-ci.yml
```
