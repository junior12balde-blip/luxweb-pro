# AIbnb Studio — Plan de Desarrollo

SaaS que ayuda a anfitriones de Airbnb a automatizar la gestión de sus
alojamientos mediante IA: mensajería automática con huéspedes, generación de
anuncios, imágenes y vídeos promocionales, automatizaciones y analítica.

Vive en `apps/aibnb-studio/` de este monorepo, como proyecto independiente de
LuxWeb Pro (que sigue intacto en la raíz del repo).

## Principios de desarrollo

- Fases pequeñas, verificables antes de avanzar a la siguiente.
- Cada fase: código + pruebas + documentación + `npm run typecheck` / `lint` /
  `test` / `build` en verde antes de cerrarla.
- Ninguna clave de API se inventa. Cuando una fase necesita una API externa,
  el documento de la fase indica: qué API, para qué sirve, dónde crear la
  clave y cómo configurarla en `.env.local` / variables de entorno de
  despliegue.
- Arquitectura preparada para añadir proveedores de IA (Anthropic, OpenAI,
  Google AI, Higgsfield, otros futuros) sin reescribir el dominio: toda
  llamada a IA pasa por el Provider Manager (`src/lib/ai/providerManager.ts`
  — ver `ARCHITECTURE.md`).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Estilos | Tailwind CSS |
| Base de datos | PostgreSQL (Supabase) |
| ORM | Prisma (con migraciones versionadas) |
| Auth | Supabase Auth (email/password; recuperación y verificación de email incluidas) |
| Almacenamiento | Supabase Storage (avatares, fotos de propiedad) |
| Pagos | Stripe (Fase 9) |
| Contenedores | Docker / docker-compose (Postgres local) |
| CI/CD | GitHub Actions |
| IA texto | Anthropic API / OpenAI API / Google AI, vía Provider Manager |
| IA vídeo | Google Gemini API (Veo), vía `@google/genai` (Fase 5 — cambiado de Higgsfield, ver `PHASE-5.md`) |
| IA imagen | Google Gemini API (Imagen), vía `@google/genai` (Fase 6, mismo SDK que el vídeo) |

## Fases

### Fase 0 — Planificación
Estructura del monorepo, plan de fases, decisiones de arquitectura.
**Estado: hecho.**

### Fase 1 — Fundación: Auth + Dashboard + Propiedades
- Scaffolding Next.js + TypeScript + Tailwind dentro de `apps/aibnb-studio`.
- Esquema Prisma inicial: `User`, `Property`, `Membership`.
- Autenticación básica con Supabase (registro, login, logout, sesión
  protegida por middleware).
- Dashboard con layout responsive (sidebar + topbar) y tarjetas de
  estadísticas placeholder.
- CRUD de propiedades (crear, listar, editar, eliminar).
- Pruebas unitarias (Vitest), Docker Compose para Postgres local, CI.
- **Estado: hecho** (PR #1).

### Fase 2 — Autenticación completa, perfiles, propiedades avanzadas y arquitectura de IA
- Recuperación/restablecimiento de contraseña, reenvío de verificación,
  página de verificación de email, manejo de errores de auth consistente.
- Perfil de usuario: nombre, foto, idioma, zona horaria, preferencias de
  notificaciones.
- Propiedades avanzadas: galería de fotos, amenities, normas de la casa,
  check-in/out, estado activo/inactivo.
- Arquitectura de proveedores de IA (Anthropic/OpenAI/Google) desacoplada
  mediante interfaces + Provider Manager, **sin llamadas reales todavía**.
- Migraciones de Prisma versionadas (no solo `db push`).
- **Estado: hecho** (PR #2 — ver `PHASE-2.md`).

### Fase 3 — Asistente de IA para huéspedes
- Modelo `Conversation` / `Message` en Prisma (FK a `Property`); campos
  `Property.aiAssistantEnabled` / `aiAssistantTone`.
- Implementación real de `generateText()` en `src/lib/ai/providers/anthropic.ts`
  (sustituye el stub de la Fase 2, vía SDK oficial `@anthropic-ai/sdk`),
  seleccionado a través del Provider Manager.
- Sugerencia de respuestas (revisada y confirmada por el anfitrión antes de
  guardarse como enviada — sin canal externo conectado todavía, ver
  `PHASE-3.md`).
- Detección de idioma del huésped y respuesta en el mismo idioma (delegada
  en el propio modelo vía system prompt).
- "Aprendizaje del estilo": el anfitrión marca mensajes propios como
  ejemplo de su estilo; se usan como *few-shot examples* en el prompt.
- Requiere que definas `ANTHROPIC_API_KEY` (ver sección APIs abajo).
- **Estado: hecho** (PR #3 — ver `PHASE-3.md`).

### Fase 4 — Generador de anuncios
- Modelo `ListingDraft` (Prisma, FK a `Property`) con historial de versiones
  (`isApplied` marca cuál usa el anfitrión; nunca se sobrescribe una
  versión anterior).
- `src/lib/ai/listingGenerator.ts`: genera título, descripción optimizada,
  puntos destacados y palabras clave SEO, usando el mismo Provider Manager
  de la Fase 2/3 — el modelo responde en JSON estricto (parseado y
  validado con Zod) en vez de depender de "structured outputs" específicos
  de un proveedor.
- El anfitrión puede generar varias versiones, compararlas, y aplicar una
  como descripción de la propiedad.
- No requiere ninguna clave nueva — reutiliza `ANTHROPIC_API_KEY`.
- **Estado: hecho** (PR #4 — ver `PHASE-4.md`).

### Fase 5 — Generador de vídeos (Google Gemini/Veo)
- Proveedor cambiado de Higgsfield a **Google Gemini API (Veo)** por
  decisión explícita del cliente — ver `PHASE-5.md` para el detalle.
- Modelo `MediaGeneration` (Prisma, FK a `Property`) con estado
  (`PENDING`, `PROCESSING`, `READY`, `FAILED`) — reutilizable para
  imágenes en la Fase 6.
- `src/lib/video/`: arquitectura de proveedores de vídeo separada de la de
  texto (trabajo asíncrono con sondeo, no una llamada síncrona), con SDK
  oficial `@google/genai` verificado directamente contra sus tipos
  TypeScript instalados.
- Vídeos cinematográficos (16:9) y verticales (9:16, TikTok/Reels/Shorts).
- Sondeo de estado desde el navegador cada 10s — sin *worker* en segundo
  plano, apto para despliegue serverless.
- Requiere: `GOOGLE_AI_API_KEY` (ver sección APIs abajo).
- **Estado: hecho** (PR #5 — ver `PHASE-5.md`).

### Fase 6 — Generador de imágenes
- Fotos promocionales (4:3), imágenes para redes sociales (1:1) y banners
  panorámicos (16:9).
- Reutiliza el modelo `MediaGeneration` de la Fase 5 (tipo `IMAGE`) sin
  ninguna migración nueva.
- `src/lib/image/`: arquitectura de proveedores de imagen paralela a
  `src/lib/video/`, pero sin sondeo — Imagen (`@google/genai`) devuelve el
  resultado en la misma llamada, así que las generaciones se crean
  directamente en estado `READY` (o no se crean si fallan).
- No requiere ninguna clave nueva — reutiliza `GOOGLE_AI_API_KEY` (Fase 5).
- **Estado: hecho** (PR #6 — ver `PHASE-6.md`).

### Fase 7 — Automatizaciones
- Programación de mensajes (check-in, check-out, bienvenida), recordatorios,
  seguimiento post-estancia, solicitud automática de reseñas.
- Usa `User.notificationPrefs` (Fase 2) para saber qué quiere recibir cada
  anfitrión.
- Requiere un *scheduler* (cron de GitHub Actions o `pg-boss` sobre el mismo
  Postgres — se decidirá en la fase con justificación de coste/complejidad).

### Fase 8 — Analítica
- Ocupación, ingresos, rendimiento por propiedad y agregados. Informes
  descargables (CSV/PDF).
- Conecta los placeholders del dashboard de Fase 1 a datos reales.

### Fase 9 — Facturación (Stripe)
- Planes de suscripción (Starter/Pro/Business), checkout, portal de
  cliente, webhooks de Stripe, límites por plan.
- Requiere: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

### Fase 10 — Endurecimiento y despliegue
- Rate limiting, manejo de errores centralizado, logging.
- Dockerfile de producción multi-stage.
- Pipeline CI/CD completo (build, test, deploy) y documentación de
  operaciones.

## APIs externas — resumen de lo que se necesitará y cuándo

Ninguna de estas claves se inventa ni se pide antes de que la fase
correspondiente las necesite. Cuando llegue el momento, se indicará aquí y en
`.env.example` exactamente:

| Variable | Para qué sirve | Dónde crearla | Fase |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (DB + Auth + Storage) | https://supabase.com/dashboard → New project → Settings → API | 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (cliente) de Supabase | Supabase → Settings → API → `anon public` | 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada (servidor) de Supabase, para operaciones admin | Supabase → Settings → API → `service_role` (¡nunca exponer al cliente!) | 1 |
| `DATABASE_URL` / `DIRECT_URL` | Conexión Postgres para Prisma (pooler / directa) | Supabase → Settings → Database → Connection string | 1 |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio, para los enlaces de los emails de Supabase | Tu dominio de producción (opcional; sin ella se deriva de la petición) | 2 |
| `AI_DEFAULT_PROVIDER` | Proveedor de IA por defecto de la instancia (no secreta) | `anthropic` \| `openai` \| `google` | 2 |
| `ANTHROPIC_API_KEY` | Respuestas IA a huéspedes (Claude) — **en uso real desde la Fase 3** | https://console.anthropic.com/ → API Keys | 3 |
| `OPENAI_API_KEY` | Alternativa de proveedor de IA de texto (arquitectura lista, no activada) | https://platform.openai.com/api-keys | arquitectura lista desde la 2 |
| `GOOGLE_AI_API_KEY` | Alternativa de proveedor de IA de texto (arquitectura lista, no activada) **y generación real de vídeo (Veo, Fase 5) e imagen (Imagen, Fase 6)** | https://aistudio.google.com/apikey | texto: arquitectura lista desde la 2; vídeo: en uso real desde la 5; imagen: en uso real desde la 6 |
| `GEMINI_VIDEO_MODEL` | Fijar una versión de Veo distinta a la por defecto (no secreta, opcional) | `veo-2.0-generate-001` u otra vigente | 5 |
| `GEMINI_IMAGE_MODEL` | Fijar una versión de Imagen distinta a la por defecto (no secreta, opcional) | `imagen-4.0-generate-001` u otra vigente | 6 |
| Supabase Storage (buckets `avatars`, `property-photos`, `generated-videos`, `generated-images`) | Fotos de perfil, de propiedad, vídeos e imágenes generados | SQL de configuración en `PHASE-2.md` / `PHASE-5.md` / `PHASE-6.md` | 2 / 5 / 6 |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Pagos y suscripciones | https://dashboard.stripe.com/apikeys y https://dashboard.stripe.com/webhooks | 9 |

## Estructura del monorepo

```
luxweb-pro/                    (proyecto existente, intacto — LuxWeb Pro)
apps/
  aibnb-studio/                (nuevo — este proyecto)
    src/
      app/                     App Router: (auth), dashboard, api
      components/              UI + componentes de dominio
      lib/                     supabase, prisma, ai/ (Provider Manager), validations
      types/
    prisma/
      schema.prisma
      migrations/              migraciones versionadas (Fase 2+)
    tests/
    docker-compose.yml
    .env.example
    DEVELOPMENT_PLAN.md        (este archivo)
    ARCHITECTURE.md            (puntos de extensión para las Fases 5+)
    PHASE-1.md / PHASE-2.md / PHASE-3.md / PHASE-4.md /
    PHASE-5.md / PHASE-6.md    (detalle + cómo probar cada fase)
    README.md
.github/workflows/aibnb-studio-ci.yml
```

Nota: no existe todavía un `Dockerfile` de producción — está planificado
para la Fase 10 (Endurecimiento y despliegue). `docker-compose.yml` es solo
para levantar Postgres en desarrollo local.
