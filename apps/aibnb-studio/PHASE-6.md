# Fase 6 — Generador de imágenes

## Decisión de proveedor

Mismo proveedor que la Fase 5 (Google Gemini API), pero su modelo de
imágenes **Imagen** en vez de Veo — ambos viven en el mismo SDK oficial
`@google/genai`, ya instalado y ya configurado (`GOOGLE_AI_API_KEY`).
Candidato natural señalado desde `DEVELOPMENT_PLAN.md` y confirmado al
llegar a esta fase: no hace falta ninguna clave ni proveedor nuevo.

La forma exacta de la API (`ai.models.generateImages`, `GenerateImagesParameters`,
`GenerateImagesConfig`, `GeneratedImage`, `Image.imageBytes`) se verificó
leyendo `node_modules/@google/genai/dist/node/node.d.ts` del SDK ya
instalado — mismo método que en la Fase 5, no se adivinó ni se copió de
blogs de terceros.

## Qué incluye

### 1. Modelo de datos

Reutiliza `MediaGeneration` (Fase 5) con `type: "IMAGE"` — no hizo falta
ninguna migración nueva. A diferencia de los vídeos, que quedan en
`PROCESSING` hasta que el sondeo confirma que están listos, las
generaciones de imagen se crean **ya en estado `READY`** (o no se crean si
falla): Imagen es una llamada síncrona, no hay paso intermedio que
persistir.

### 2. Arquitectura de proveedores de imagen (`src/lib/image/`)

Estructura paralela a `src/lib/video/` (Fase 5), pero **sin `checkStatus`
ni `VideoJobHandle`** — no hace falta, porque `generateImages` devuelve el
resultado en la misma llamada:

- `types.ts` — interfaz `ImageProvider` (`isConfigured`, `generate`).
  `generate()` devuelve directamente `{ imageBytes, mimeType, model }`.
- `errors.ts` — `ImageProviderNotConfiguredError`, mismo patrón que
  `src/lib/video/errors.ts`.
- `providers/google.ts` — implementación real con `@google/genai`:
  `ai.models.generateImages({ model, prompt, config })` →
  `response.generatedImages[0].image.imageBytes` (base64, decodificado a
  `Buffer` aquí mismo). `personGeneration: PersonGeneration.DONT_ALLOW`
  para que nunca aparezcan personas generadas por IA en fotos de una
  propiedad real.
  - Modelo por defecto: `imagen-4.0-generate-001` — el mismo que usa el
    ejemplo oficial incluido en el propio paquete `@google/genai`
    instalado (JSDoc de `Models.generateImages`), no inventado.
    Puede fijarse otro con `GEMINI_IMAGE_MODEL`.
- `imageProviderManager.ts` — registro central, mismo patrón que
  `videoProviderManager.ts` / `providerManager.ts`.
- `propertyImageGenerator.ts` — construye el prompt a partir de los datos
  de la propiedad (nombre, tipo, ubicación, amenities, descripción) y
  orquesta la llamada, igual que `propertyVideoGenerator.ts`.

### 3. Flujo en la aplicación

1. `/dashboard/properties/<id>/images` → elige formato (promocional 4:3,
   redes sociales 1:1, banner 16:9) → "🖼️ Generar imagen".
2. La imagen se genera, se sube a Supabase Storage (bucket
   `generated-images`) y aparece en pantalla **en la misma respuesta** —
   sin sondeo, sin esperar varios minutos como en el vídeo.
3. Si falla (proveedor no configurado, error del proveedor, error al
   subir a Storage), se muestra un error claro y no se crea ninguna
   generación a medias.
4. Todo el historial de imágenes generadas de una propiedad queda visible.

### 4. Calidad de código

- 7 tests unitarios nuevos (69 en total): construcción del prompt (los
  tres formatos, con/sin amenities/descripción),
  `generatePropertyImage` con el Image Provider Manager mockeado, y
  `googleImageProvider` comprobando que falla de forma controlada sin
  `GOOGLE_AI_API_KEY` — todo sin llamadas de red reales.
- Typecheck, lint y build de producción en verde con las rutas nuevas.

## Configuración necesaria

| Variable | Obligatoria | Para qué sirve | Dónde crearla |
|---|---|---|---|
| `GOOGLE_AI_API_KEY` | **Sí, para que "Generar imagen" funcione** | Ya requerida desde la Fase 5 (vídeo) — se reutiliza tal cual para imágenes | https://aistudio.google.com/apikey |
| `GEMINI_IMAGE_MODEL` | No (por defecto `imagen-4.0-generate-001`) | Fijar una versión de Imagen distinta sin tocar código | — |

Si ya configuraste `GOOGLE_AI_API_KEY` para el vídeo de la Fase 5, el
generador de imágenes funciona sin ningún paso adicional aparte de crear
el bucket de Storage (siguiente sección).

### Bucket de Supabase Storage requerido

Igual que `generated-videos` en la Fase 5, hace falta crear el bucket
`generated-images` en el proyecto de Supabase antes de producción:

```sql
insert into storage.buckets (id, name, public) values ('generated-images', 'generated-images', true)
  on conflict (id) do nothing;

create policy "generated_images_public_read" on storage.objects
  for select using (bucket_id = 'generated-images');
create policy "generated_images_member_write" on storage.objects
  for insert with check (
    bucket_id = 'generated-images'
    and exists (
      select 1 from public.memberships m
      join public.users u on u.id = m."userId"
      where u."authId" = auth.uid()::text and m."propertyId" = (storage.foldername(name))[1]
    )
  );
```

(La subida la hace nuestro propio servidor tras generar la imagen, no el
navegador directamente — misma defensa en profundidad que fotos de
propiedad y vídeos.)

## Cómo probarlo

### Automático (sin clave de Google)

```bash
cd apps/aibnb-studio
npm install
npm run db:generate && npm run db:migrate
npm run typecheck && npm run lint && npm run test   # 69 tests
npm run build
```

### Con `GOOGLE_AI_API_KEY` real

A diferencia del vídeo (Fase 5), la generación de imagen con Imagen es
rápida y de coste mucho menor por llamada — aun así, sigue siendo una
llamada real y facturable, así que se verifica solo con tu confirmación
explícita, igual que se hizo con Veo.

1. Ve a `/dashboard/properties/<id>/images`.
2. Elige un formato y pulsa "🖼️ Generar imagen".
3. La imagen debería aparecer en la tarjeta en unos segundos.

## Qué NO incluye (a propósito)

- Edición de imágenes existentes (`editImage`, `upscaleImage` del mismo
  SDK) — fuera del alcance pedido para esta fase; candidato natural para
  una fase futura si hace falta.
- Selección de imagen para usar como foto de portada de la propiedad —
  el anfitrión puede descargarla y subirla manualmente a la galería de
  fotos (Fase 2) por ahora.
- Publicación automática en ningún canal externo — mismo alcance que las
  fases anteriores.

## Próxima fase

Fase 7 — Automatizaciones: programación de mensajes, recordatorios y
solicitud de reseñas, usando `User.notificationPrefs` (Fase 2).
