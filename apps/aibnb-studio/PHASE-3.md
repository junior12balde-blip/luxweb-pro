# Fase 3 — Asistente de IA para huéspedes

## Qué incluye

### 1. Llamada real a Anthropic (sustituye el stub de la Fase 2)
- `src/lib/ai/providers/anthropic.ts` ahora usa el SDK oficial
  (`@anthropic-ai/sdk`) y llama de verdad a `claude-opus-4-8`. Sigue
  lanzando `AIProviderNotConfiguredError` si falta `ANTHROPIC_API_KEY` —
  ese comportamiento no cambia, solo se implementó lo que antes lanzaba
  `AIProviderNotImplementedError`.
- `openai.ts` y `google.ts` siguen siendo stubs — no se pidió activarlos en
  esta fase y el Provider Manager ya deja el cambio trivial cuando se
  necesiten (ver `ARCHITECTURE.md`).
- No se acepta `temperature`/`top_p`/`top_k` en la llamada — Claude Opus
  4.8 los rechaza; el estilo se dirige por prompt (tono configurado en la
  propiedad + ejemplos de estilo del anfitrión).

### 2. Modelo de datos
- `Conversation` (por propiedad; `guestName` opcional, sin canal externo
  todavía) y `Message` (`sender`: `GUEST` / `HOST` / `ASSISTANT`;
  `isStyleExample` marca los mensajes del anfitrión que sirven de
  *few-shot* para futuras sugerencias).
- `Property.aiAssistantEnabled` (apagado por defecto — el anfitrión debe
  activarlo) y `Property.aiAssistantTone` (instrucción de tono libre).
- Migración real generada y aplicada:
  `prisma/migrations/20260720204104_phase3_conversations_messages/`.

### 3. Lógica de dominio (`src/lib/ai/guestAssistant.ts`)
- `buildSystemPrompt`: compone el prompt de sistema con nombre/ciudad de la
  propiedad, check-in/out, amenities, normas de la casa, tono del
  anfitrión y hasta 5 ejemplos de su estilo de escritura.
- `suggestReply`: añade el historial de la conversación + el último
  mensaje del huésped, y llama a
  `providerManager.resolveProvider(preferencia).generateText(...)`.
- Detección de idioma: se delega en el propio modelo (instrucción "responde
  en el mismo idioma en el que escribe el huésped") en vez de una librería
  de detección de idioma aparte — más simple y más fiable en la práctica.

### 4. Flujo en la aplicación (sin canal externo conectado)
Como no hay integración con Airbnb/email/WhatsApp todavía, el flujo es:
1. El anfitrión registra manualmente el mensaje del huésped
   (`/dashboard/properties/<id>/messages`, o el botón "Registrar" dentro de
   una conversación).
2. Pulsa "Sugerir respuesta" → llamada real a Claude → aparece el texto
   sugerido, editable.
3. El anfitrión edita si quiere y pulsa "Marcar como enviada" → se guarda
   como mensaje `HOST` (aquí, y solo aquí, es donde el anfitrión decide
   además marcarlo como ejemplo de su estilo).
4. "Automático" en esta fase significa **sugerencia automática**, nunca
   envío automático a un canal real — no existe ese canal todavía.

### 5. Calidad de código
- 47 tests unitarios (10 nuevos: 4 del proveedor Anthropic con el SDK
  mockeado —sin llamadas de red—, 6 de la lógica de `guestAssistant`).
- Verificación adicional **contra Postgres real** (no solo mocks): se
  creó una conversación, se confirmó que `suggestReply` falla de forma
  controlada sin `ANTHROPIC_API_KEY`, y — con una clave inventada — se
  confirmó que la petición llega de verdad a `api.anthropic.com` y
  recibe `401 authentication_error` (prueba de que la integración está
  bien conectada, sin gastar una clave real).
- Typecheck, lint y build de producción en verde con las 8 rutas nuevas.

## Configuración necesaria

| Variable | Obligatoria | Para qué sirve | Dónde crearla |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | **Sí, para que "Sugerir respuesta" funcione** | Llamadas reales a Claude Opus 4.8 para generar sugerencias | https://console.anthropic.com/ → API Keys |

Sin esta variable, todo lo demás de la app funciona igual — el botón
"Sugerir respuesta" mostrará el error "El proveedor de IA no está
configurado" en vez de fallar de forma confusa. `/dashboard/settings/integrations`
(Fase 2) ya muestra si la clave está detectada.

## Cómo probarlo

### Automático (sin clave de Anthropic)

```bash
cd apps/aibnb-studio
npm install
npm run db:generate && npm run db:migrate
npm run typecheck && npm run lint && npm run test   # 47 tests
npm run build
```

### Con `ANTHROPIC_API_KEY` real

1. Activa el asistente de IA en `/dashboard/properties/<id>` (checkbox
   "Activar asistente de IA para huéspedes"), opcionalmente con un tono.
2. Ve a `/dashboard/properties/<id>/messages` → "Registrar mensaje de un
   huésped" → escribe algo como "¿A qué hora es el check-in?".
3. Entra en la conversación → "✨ Sugerir respuesta" → debería aparecer una
   respuesta real generada por Claude, usando el check-in/out y el tono
   configurados.
4. Edita el texto si quieres, marca "usar como ejemplo de mi estilo" si te
   gusta cómo quedó, y pulsa "Marcar como enviada".
5. Repite con otro mensaje del huésped: la nueva sugerencia debería
   reflejar el ejemplo de estilo guardado en el paso anterior.

En este entorno de desarrollo se verificó todo lo anterior salvo el paso 3
con una clave real (no disponible aquí) — en su lugar se confirmó, con una
clave inventada, que la petición llega correctamente a la API de Anthropic
(ver sección de calidad de código arriba).

## Qué NO incluye (a propósito)

- Ningún canal externo real (Airbnb API, email, WhatsApp) — los mensajes
  de huéspedes se registran manualmente. Conectar un canal real es una
  pieza de integración considerable (autenticación con la plataforma,
  webhooks, sincronización bidireccional) que no estaba en las 10 fases
  planificadas ni se pidió aquí; si se quiere abordar, sería una fase
  propia.
- Envío automático sin revisión del anfitrión — cada respuesta pasa por
  "Marcar como enviada" a propósito.
- OpenAI/Google como proveedores activos — arquitectura lista, no
  activados (nadie lo pidió para esta fase).

## Próxima fase

Fase 4 — Generador de anuncios: mismo Provider Manager, nuevo modelo
`ListingDraft` (FK a `Property`), genera títulos/descripciones/SEO. No
necesita ninguna clave nueva — reutiliza `ANTHROPIC_API_KEY` ya
configurada en esta fase.
