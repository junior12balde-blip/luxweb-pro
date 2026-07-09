# Fase 2 — Autenticación completa, perfiles, propiedades avanzadas y arquitectura de IA

## Qué incluye

### 1. Autenticación completa
- Recuperación de contraseña (`/forgot-password`) y restablecimiento
  (`/reset-password`) vía `supabase.auth.resetPasswordForEmail` +
  `updateUser`.
- Reenvío del email de confirmación (`supabase.auth.resend`) desde la nueva
  página `/verify-email`, a la que redirige el registro.
- Manejo de errores consistente: `src/lib/auth-errors.ts` traduce los
  mensajes de Supabase Auth a español y los usa **toda** Server Action de
  autenticación (login, signup, forgot, resend, update password).
- `src/lib/url.ts` resuelve la URL pública del sitio (`NEXT_PUBLIC_SITE_URL`
  o las cabeceras de la petición) para construir los `redirectTo` de los
  emails de Supabase de forma correcta en cualquier entorno.
- Protección de rutas: sin cambios de fondo respecto a la Fase 1
  (`src/middleware.ts` ya protegía todo `/dashboard/*`); se auditó que
  `/reset-password` funcione tanto con sesión de recuperación como con
  sesión normal, y que `/forgot-password`, `/verify-email` sean accesibles
  sin sesión.

### 2. Perfil de usuario
- Campos nuevos en `User`: `avatarUrl`, `locale`, `timezone`,
  `notificationPrefs` (JSON), `aiPreferences` (JSON).
- Página `/dashboard/settings/profile`: nombre, idioma, zona horaria
  (validada contra `Intl.supportedValuesOf("timeZone")`), preferencias de
  notificaciones, y subida de foto de perfil a Supabase Storage.
- `aiPreferences.defaultProvider` ya es editable desde
  `/dashboard/settings/integrations` — es el único campo del "modelo
  preparado para IA" que tiene UI en esta fase; el resto de la
  configuración de IA (Fase 3+) se añadirá al mismo campo JSON sin
  necesitar una migración de esquema.

### 3. Gestión avanzada de propiedades
- Campos nuevos en `Property`: `active`, `amenities` (`String[]`),
  `houseRules`, `checkInTime`/`checkOutTime` (`HH:mm`).
- Modelo nuevo `PropertyPhoto` (galería multi-foto, orden por `position`).
- UI: interruptor de propiedad activa/inactiva, input de amenities con
  chips sugeridos, normas de la casa, horarios de check-in/check-out,
  galería de fotos con subida, reordenado (← →) y borrado.
- `src/lib/properties.ts` centraliza la comprobación de pertenencia
  (`findOwnedProperty` / `isPropertyOwner`), usada por las rutas de
  propiedades y de fotos.

### 4. Arquitectura de IA (sin llamadas reales)
- `src/lib/ai/types.ts` — contrato `AIProvider` común (`isConfigured`,
  `generateText`) más los tipos de mensajes/resultados.
- `src/lib/ai/errors.ts` — `AIProviderNotConfiguredError` (falta la clave) y
  `AIProviderNotImplementedError` (la clave existe, pero la llamada real
  llega en la Fase 3).
- `src/lib/ai/providers/{anthropic,openai,google}.ts` — un stub por
  proveedor, cada uno con su metadato (`label`, `envVar`, `consoleUrl`).
- `src/lib/ai/providerManager.ts` — registro central + selección de
  proveedor por defecto (`AI_DEFAULT_PROVIDER`) o por preferencia del
  usuario. **Todo el código futuro debe importar de aquí, nunca de un
  proveedor concreto.**
- `/dashboard/settings/integrations` — estado de configuración de cada
  proveedor (lee `isConfigured()`) y guarda la preferencia del anfitrión.
- Ningún proveedor realiza una llamada de red real todavía — `generateText`
  siempre lanza uno de los dos errores anteriores. Ver `ARCHITECTURE.md`
  para cómo se conectará en la Fase 3.

### 5. Calidad de código
- Typecheck, lint y build de producción en verde.
- 37 tests unitarios (Vitest): 22 nuevos en esta fase (proveedor de IA,
  validaciones de perfil, campos avanzados de propiedad, serializador con
  fotos) + 15 heredados de la Fase 1.
- Migración de Prisma real (`prisma/migrations/20260709061405_init_phase1_phase2/`)
  generada y aplicada contra un PostgreSQL 16 real en este entorno de
  desarrollo (no solo `db push`), para que el despliegue use
  `prisma migrate deploy` de forma reproducible.

## Configuración necesaria

### Variables de entorno nuevas

| Variable | Obligatoria en Fase 2 | Para qué sirve | Dónde configurarla |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | No (recomendada en producción) | URL pública del sitio, usada para construir los enlaces de los emails de Supabase (confirmación, recuperación). Sin ella, se deriva de las cabeceras de la petición. | Tu propio dominio, ej. `https://app.aibnb.studio` |
| `AI_DEFAULT_PROVIDER` | No (por defecto `anthropic`) | Qué proveedor de IA usa la plataforma cuando el anfitrión no ha elegido uno. No es secreta. | `anthropic`, `openai` o `google` |
| `ANTHROPIC_API_KEY` | No todavía (la Fase 2 no hace llamadas reales) | Se usará en la Fase 3 para el asistente de IA. Configúrala ya si quieres ver el proveedor como "Configurado" en `/dashboard/settings/integrations`. | https://console.anthropic.com/ → API Keys |
| `OPENAI_API_KEY` | No todavía | Proveedor alternativo, mismo uso que arriba. | https://platform.openai.com/api-keys |
| `GOOGLE_AI_API_KEY` | No todavía | Tercer proveedor alternativo (Gemini). | https://aistudio.google.com/apikey |

Ninguna de las tres claves de IA es necesaria para que la Fase 2 funcione:
si no están definidas, la app sencillamente muestra "No configurado" en la
página de integraciones. **No se ha inventado ni hardcodeado ninguna clave
en el código.**

### Supabase Storage (nuevo requisito de esta fase)

La subida de foto de perfil y de fotos de propiedad necesita dos buckets en
tu proyecto de Supabase. Todas las subidas pasan por nuestras propias API
routes (el navegador nunca habla directamente con Supabase Storage), así
que el control de acceso principal ya está en el servidor
(`getCurrentUser()` + `isPropertyOwner()`); las políticas de RLS de abajo
son una capa adicional de defensa en profundidad, recomendada antes de
producción.

Ejecuta esto en el **SQL Editor** de tu proyecto Supabase
(`https://supabase.com/dashboard/project/_/sql/new`):

```sql
-- Buckets (público de lectura; escritura restringida por política)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('property-photos', 'property-photos', true)
  on conflict (id) do nothing;

-- avatars: cada usuario solo puede escribir en su propia carpeta ({authId}/...)
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_owner_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_owner_update" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_owner_delete" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- property-photos: solo un miembro de la propiedad puede escribir en su carpeta ({propertyId}/...)
create policy "property_photos_public_read" on storage.objects
  for select using (bucket_id = 'property-photos');
create policy "property_photos_member_write" on storage.objects
  for insert with check (
    bucket_id = 'property-photos'
    and exists (
      select 1 from public.memberships m
      join public.users u on u.id = m."userId"
      where u."authId" = auth.uid()::text and m."propertyId" = (storage.foldername(name))[1]
    )
  );
create policy "property_photos_member_delete" on storage.objects
  for delete using (
    bucket_id = 'property-photos'
    and exists (
      select 1 from public.memberships m
      join public.users u on u.id = m."userId"
      where u."authId" = auth.uid()::text and m."propertyId" = (storage.foldername(name))[1]
    )
  );
```

## Cómo probarlo

### Automático (sin Supabase real)

```bash
cd apps/aibnb-studio
npm install
npm run db:generate
npm run typecheck
npm run lint
npm run test     # 37 tests
npm run build
```

### Con un proyecto Supabase real

1. Sigue `PHASE-1.md` para crear el proyecto, configurar Auth y aplicar
   `npm run db:migrate deploy` (o `prisma migrate dev` en desarrollo).
2. Ejecuta el SQL de la sección "Supabase Storage" de arriba.
3. En **Authentication → URL Configuration**, añade también
   `http://localhost:3000/auth/callback` si no lo hiciste en la Fase 1 (el
   mismo callback sirve para confirmación de email y recuperación de
   contraseña, distinguidos por el parámetro `next`).
4. Flujo manual:
   - `/signup` → redirige a `/verify-email` → confirma desde el email →
     `/dashboard`.
   - `/login` → "¿Olvidaste tu contraseña?" → `/forgot-password` → email →
     `/reset-password` → nueva contraseña → `/dashboard?passwordUpdated=1`.
   - `/dashboard/settings/profile` → sube foto, cambia nombre/idioma/zona
     horaria/notificaciones → guardar.
   - `/dashboard/properties/<id>` → añade fotos, reordénalas, añade
     amenities, normas de la casa, check-in/out, desactiva la propiedad.
   - `/dashboard/settings/integrations` → confirma que los proveedores con
     clave configurada muestran "Configurado" y que se puede guardar una
     preferencia.

En este entorno de desarrollo (sandbox) se verificó lo automático más las
páginas públicas nuevas (`/forgot-password`, `/reset-password`,
`/verify-email`) en un navegador real, y el esquema de Prisma contra un
PostgreSQL real (migración generada y aplicada, seed ejecutado). Los flujos
que requieren una sesión de Supabase real (perfil, subida de fotos,
integraciones) están cubiertos por los tests unitarios de sus validaciones
y por el build de producción, pero no se ejecutaron interactivamente por no
haber un proyecto Supabase disponible aquí — quedan documentados arriba
para que se verifiquen contra un proyecto real antes de producción.

## Qué NO incluye (a propósito)

- Ninguna llamada real a un proveedor de IA — eso es la Fase 3.
- Generador de anuncios, vídeos, imágenes, automatizaciones, analítica,
  Stripe — fases posteriores (ver `DEVELOPMENT_PLAN.md`).
- OAuth social (Google/Apple login) — no se pidió; se puede añadir después
  reutilizando el mismo `src/lib/supabase/*` sin cambios estructurales.

## Próxima fase

Fase 3 — Asistente de IA para huéspedes: implementa `generateText` de
verdad en `src/lib/ai/providers/anthropic.ts` (y opcionalmente los otros),
añade los modelos `Conversation`/`Message`, y construye la sugerencia y
respuesta automática. Requiere que definas `ANTHROPIC_API_KEY` (o
`OPENAI_API_KEY`/`GOOGLE_AI_API_KEY`) en el entorno — no se usará ninguna
clave hasta que la definas tú.
