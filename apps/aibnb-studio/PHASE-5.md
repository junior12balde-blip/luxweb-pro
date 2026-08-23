# Fase 5 — Generador de vídeos

## Decisión de proveedor

El plan original (`DEVELOPMENT_PLAN.md`) preveía Higgsfield para esta fase.
Se cambió a **Google Gemini API (modelos Veo)** a petición explícita del
cliente durante esta sesión de desarrollo. Motivo práctico añadido: este
entorno de desarrollo no tiene acceso de red a la documentación pública de
Higgsfield (`docs.higgsfield.ai`) para verificar su contrato de API exacto
sin inventarlo, mientras que la integración con Gemini/Veo se pudo
verificar de forma fiable leyendo directamente los tipos TypeScript del
SDK oficial `@google/genai` ya instalado (ver más abajo) — más fiable
incluso que la documentación web, porque son los tipos exactos de la
versión que usa el proyecto.

## Qué incluye

### 1. Modelo de datos
- `MediaGeneration` (Prisma, FK a `Property`): `type` (`VIDEO` — `IMAGE`
  reservado para la Fase 6, mismo modelo y misma cola), `status`
  (`PENDING` → `PROCESSING` → `READY` | `FAILED`), `prompt`,
  `provider`/`model` (trazabilidad), `providerJobId` (para consultar el
  estado más tarde), `resultUrl`, `errorMessage`.
- Migración real generada y aplicada:
  `prisma/migrations/20260823180804_phase5_media_generations/`.

### 2. Arquitectura de proveedores de vídeo (`src/lib/video/`)
Deliberadamente **separada** de `src/lib/ai/` (proveedores de texto): la
generación de vídeo es un trabajo asíncrono de varios minutos con consulta
de estado, no una llamada síncrona que devuelve texto — forzar la misma
interfaz habría sido una abstracción incorrecta.

- `types.ts` — interfaz `VideoProvider` (`isConfigured`, `startGeneration`,
  `checkStatus`).
- `errors.ts` — `VideoProviderNotConfiguredError`, mismo patrón que
  `src/lib/ai/errors.ts`.
- `providers/google.ts` — implementación real con el SDK oficial
  `@google/genai`:
  - `ai.models.generateVideos({ model, source: { prompt }, config })` →
    devuelve una operación asíncrona.
  - `ai.operations.getVideosOperation({ operation })` para consultar el
    estado (se reconstruye un objeto mínimo con el `name` de la operación,
    ya que solo tenemos el identificador guardado en la base de datos
    entre peticiones HTTP separadas — la app es *stateless* entre
    peticiones).
  - `ai.files.download({ file: video, downloadPath })` para descargar el
    vídeo terminado a un archivo temporal, que luego se sube a Supabase
    Storage (bucket `generated-videos`) para tener una URL persistente —
    mismo patrón que las fotos de propiedad de la Fase 2.
  - Modelo por defecto: `veo-2.0-generate-001` — es el modelo usado en el
    ejemplo oficial incluido en el propio paquete `@google/genai`
    instalado (`node_modules/@google/genai/dist/node/node.d.ts`, JSDoc de
    `Models.generateVideos`), no inventado. Puede haber versiones más
    recientes de Veo disponibles cuando leas esto — se puede cambiar sin
    tocar código fijando `GEMINI_VIDEO_MODEL`.
- `videoProviderManager.ts` — registro central, mismo patrón que
  `src/lib/ai/providerManager.ts` (hoy solo hay un proveedor, pero añadir
  otro es symmetric: nuevo archivo en `providers/` + una línea de
  registro).
- `propertyVideoGenerator.ts` — construye el prompt a partir de los datos
  de la propiedad (nombre, tipo, ubicación, amenities, descripción) y
  orquesta el inicio de la generación.

### 3. Flujo en la aplicación (sin canal externo, sin envío automático)
1. `/dashboard/properties/<id>/videos` → elige formato (cinematográfico
   16:9 o vertical 9:16 para TikTok/Reels/Shorts) → "🎬 Generar vídeo".
2. Se crea un `MediaGeneration` en `PROCESSING` y la página empieza a
   consultar su estado automáticamente cada 10 segundos (sondeo desde el
   navegador — no hay un *worker* en segundo plano; encaja con un
   despliegue serverless como Vercel, sin infraestructura adicional).
3. Cuando el proveedor termina, el vídeo se descarga y se sube a Storage;
   la tarjeta muestra un reproductor `<video>` con el resultado. Si falla,
   se muestra el motivo.
4. Todo el historial de generaciones de una propiedad queda visible y
   revisable.

### 4. Calidad de código
- 7 tests unitarios nuevos (62 en total): construcción del prompt (con y
  sin amenities/descripción, formato cinematográfico vs. vertical),
  `startPropertyVideoGeneration` con el Provider Manager mockeado, y
  `googleVideoProvider` comprobando que falla de forma controlada sin
  `GOOGLE_AI_API_KEY` — todo sin llamadas de red reales.
- La forma exacta de la API (`generateVideos`, `getVideosOperation`,
  `files.download`, tipos `GenerateVideosOperation`/`GenerateVideosConfig`/
  `Video`) se verificó leyendo los `.d.ts` del SDK instalado en
  `node_modules/@google/genai`, no adivinando ni copiando de blogs de
  terceros — el acceso de red de este entorno a `ai.google.dev` y a
  `docs.higgsfield.ai` está bloqueado, así que esta fue la fuente más
  fiable disponible aquí.
- Typecheck, lint y build de producción en verde con las rutas nuevas.

## Configuración necesaria

| Variable | Obligatoria | Para qué sirve | Dónde crearla |
|---|---|---|---|
| `GOOGLE_AI_API_KEY` | **Sí, para que "Generar vídeo" funcione** | Llamadas reales a la API de Gemini/Veo | https://aistudio.google.com/apikey |
| `GEMINI_VIDEO_MODEL` | No (por defecto `veo-2.0-generate-001`) | Fijar una versión de Veo distinta sin tocar código | — |

Esta app ya tenía `GOOGLE_AI_API_KEY` documentada desde la Fase 2 (como
proveedor de texto alternativo, sin activar) — en la Fase 5 es la primera
vez que se usa de verdad, y es para vídeo, no para texto. Sin ella, el
botón "Generar vídeo" muestra el mismo tipo de error claro que ya existía
para IA de texto ("proveedor no configurado").

### Bucket de Supabase Storage requerido

Igual que en la Fase 2 (`avatars`, `property-photos`), hace falta crear el
bucket `generated-videos` en el proyecto de Supabase antes de producción:

```sql
insert into storage.buckets (id, name, public) values ('generated-videos', 'generated-videos', true)
  on conflict (id) do nothing;

create policy "generated_videos_public_read" on storage.objects
  for select using (bucket_id = 'generated-videos');
create policy "generated_videos_member_write" on storage.objects
  for insert with check (
    bucket_id = 'generated-videos'
    and exists (
      select 1 from public.memberships m
      join public.users u on u.id = m."userId"
      where u."authId" = auth.uid()::text and m."propertyId" = (storage.foldername(name))[1]
    )
  );
```

(La subida la hace nuestro propio servidor tras descargar el vídeo del
proveedor, no el navegador directamente — igual que con las fotos de
propiedad, esta política es una capa adicional de defensa en profundidad,
no el único control de acceso.)

## Cómo probarlo

### Automático (sin clave de Google)

```bash
cd apps/aibnb-studio
npm install
npm run db:generate && npm run db:migrate
npm run typecheck && npm run lint && npm run test   # 62 tests
npm run build
```

### Con `GOOGLE_AI_API_KEY` real

La generación de vídeo real tiene coste y tarda varios minutos (a
diferencia de las llamadas de texto de las Fases 3-4, instantáneas y
gratuitas o de coste mínimo) — verificar esto se hizo solo tras confirmar
explícitamente contigo que querías gastar la llamada real.

1. Ve a `/dashboard/properties/<id>/videos`.
2. Elige un formato y pulsa "🎬 Generar vídeo".
3. La tarjeta debería pasar de "Generando..." a mostrar un reproductor de
   vídeo funcional en unos minutos.

## Qué NO incluye (a propósito)

- Higgsfield — cambiado a Gemini/Veo por decisión explícita del cliente
  (ver arriba).
- Generación de imágenes — Fase 6, reutilizará el mismo modelo
  `MediaGeneration` (tipo `IMAGE`) y la misma arquitectura de sondeo.
- Publicación automática del vídeo en ningún canal externo — mismo alcance
  que las Fases 3-4, sin integración con plataformas externas.
- Un *worker* en segundo plano o cola persistente — el sondeo se hace
  desde el navegador mientras la página está abierta; si el anfitrión
  cierra la pestaña antes de que termine, puede volver más tarde a
  `/dashboard/properties/<id>/videos` y el sondeo se reanuda solo con
  abrir la página (el estado vive en la base de datos, no en el navegador).

## Próxima fase

Fase 6 — Generador de imágenes: mismo modelo `MediaGeneration` (tipo
`IMAGE`), muy probablemente reutilizando el mismo SDK `@google/genai`
(Imagen) o el mismo patrón de arquitectura si se elige otro proveedor.
