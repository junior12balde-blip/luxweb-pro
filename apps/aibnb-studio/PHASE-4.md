# Fase 4 — Generador de anuncios

## Qué incluye

### 1. Modelo de datos
- `ListingDraft` (Prisma, FK a `Property`): `title`, `description`,
  `highlights[]`, `seoKeywords[]`, `provider`/`model` (trazabilidad de qué
  generó esta versión), `isApplied` (marca cuál usa el anfitrión ahora).
  Cada generación crea una fila nueva — nunca se sobrescribe una versión
  anterior, así que queda un historial completo.
- Migración real generada y aplicada:
  `prisma/migrations/20260823151757_phase4_listing_drafts/`.

### 2. Generación de anuncios (`src/lib/ai/listingGenerator.ts`)
- `buildListingPrompt`: construye el prompt a partir de nombre, tipo,
  ciudad/país, capacidad, amenities, normas de la casa y (si existe) la
  descripción actual como referencia — nunca inventa datos que no se le
  han dado.
- El modelo se le pide **JSON estricto** (título, descripción, highlights,
  palabras clave SEO) en la propia instrucción del prompt, en vez de usar
  una función de "structured output" específica de un proveedor — así el
  mismo código funciona con cualquier `AIProvider` que devuelva texto
  (Anthropic hoy, OpenAI/Google el día que se activen), sin acoplar la
  interfaz genérica a una función de un proveedor concreto.
- `parseGeneratedListing`: quita un posible envoltorio ` ```json `,
  parsea y valida la forma con Zod; si el modelo no devuelve JSON válido,
  lanza un error claro en español en vez de romper con un error de
  parseo críptico.
- Reutiliza el mismo Provider Manager y la misma preferencia de proveedor
  del anfitrión (`User.aiPreferences.defaultProvider`) que la Fase 3 — no
  se ha tocado nada de esa arquitectura.

### 3. Flujo en la aplicación
1. `/dashboard/properties/<id>/listing` → botón "✨ Generar anuncio" →
   llamada real a Claude → aparece una tarjeta nueva con título,
   descripción, highlights y palabras clave.
2. El anfitrión puede generar varias versiones y compararlas — todas
   quedan en el historial.
3. "Marcar como versión en uso" señala cuál es la vigente (sin tocar la
   ficha de la propiedad). "Usar también como descripción de la
   propiedad" además copia esa descripción a `Property.description`
   (mismo campo que edita el formulario de propiedad de la Fase 1/2).

### 4. Calidad de código
- 8 tests unitarios nuevos (55 en total): `buildListingPrompt` (contenido
  del prompt), `parseGeneratedListing` (JSON válido, con envoltorio de
  code fence, JSON inválido, forma incorrecta) y `generateListing`
  (mockeando el Provider Manager, sin red real).
- **Verificación real, no solo mocks**: con la clave de Anthropic
  proporcionada, se ejecutó `generateListing()` de verdad contra la API —
  devolvió un JSON válido con título, descripción de 3 párrafos, 6
  highlights y 8 palabras clave SEO, coherentes con los datos de entrada
  (ver ejemplo en el PR).
- Typecheck, lint y build de producción en verde con las 10 rutas nuevas
  (2 API + 1 página, más las ya existentes).

## Configuración necesaria

Ninguna nueva. Reutiliza `ANTHROPIC_API_KEY`, ya requerida desde la Fase 3
(ver `PHASE-3.md`). Si no está configurada, el botón "Generar anuncio"
muestra el mismo error claro que ya existía ("proveedor no configurado").

## Cómo probarlo

### Automático (sin clave de Anthropic)

```bash
cd apps/aibnb-studio
npm install
npm run db:generate && npm run db:migrate
npm run typecheck && npm run lint && npm run test   # 55 tests
npm run build
```

### Con `ANTHROPIC_API_KEY` real

1. Ve a `/dashboard/properties/<id>/listing`.
2. Pulsa "✨ Generar anuncio" — debería aparecer una tarjeta con un
   título, una descripción de varios párrafos, una lista de highlights y
   palabras clave SEO, todo coherente con los datos reales de la
   propiedad (ciudad, capacidad, amenities, normas de la casa).
3. Genera una segunda versión y compárala con la primera — ambas quedan
   en el historial.
4. Pulsa "Usar también como descripción de la propiedad" en la que
   prefieras — ve a la página de edición de la propiedad y confirma que
   `Descripción` se actualizó.

## Qué NO incluye (a propósito)

- Generación de imágenes o vídeos para el anuncio — Fases 5-6.
- Publicación automática del anuncio en Airbnb u otra plataforma — no hay
  integración con ningún canal externo (mismo alcance que la Fase 3).
- Edición manual del JSON generado dentro de la propia tarjeta — si el
  anfitrión quiere ajustar el texto, edita `Property.description`
  directamente en el formulario de la propiedad tras aplicar la versión;
  no se ha añadido un editor de texto enriquecido para no duplicar esa UI.

## Próxima fase

Fase 5 — Generador de vídeos (Higgsfield): vídeos cinematográficos y
verticales de la propiedad. Requiere credenciales de Higgsfield — ya
disponible como servidor MCP en este entorno de desarrollo; en producción
se documentará el endpoint/API key equivalente cuando se aborde esa fase.
