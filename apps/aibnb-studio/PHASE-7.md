# Fase 7 — Automatizaciones

## Decisiones tomadas en esta fase (y por qué)

### 1. De dónde salen las fechas de check-in/check-out

El plan original no lo especificaba, y el esquema no tenía ningún modelo de
reserva con fechas reales — solo `Property.checkInTime`/`checkOutTime`
(hora estándar del día, no una estadía concreta). Sin una fecha concreta
por huésped no hay "cuándo" para disparar un recordatorio.

Se preguntó explícitamente al cliente cómo resolver esto. Opción elegida:
**añadir `checkInDate`/`checkOutDate` (opcionales) a `Conversation`** (Fase
3) en vez de crear un modelo `Booking` nuevo — mínimo escopo nuevo, mismo
patrón manual/sin canal externo ya usado desde la Fase 3 (el anfitrión
introduce las fechas si las conoce, igual que ya introduce manualmente los
mensajes del huésped).

### 2. Qué son estas "automatizaciones" exactamente

Son **recordatorios para el anfitrión**, no mensajes que se envían solos a
ningún huésped — no hay ninguna integración con Airbnb/email/WhatsApp en
esta app (mismo alcance que las Fases 3-6). Esto está alineado con
`NotificationPreferences.emailOnBookingReminder` (ya existente desde la
Fase 2): esa preferencia es la que decidirá, en una fase futura que
integre un proveedor de email real, si además de aparecer en el dashboard
se le manda un correo al anfitrión. Por ahora, sin proveedor de email
configurado (no se inventa ninguno — ver sección de configuración), el
recordatorio solo aparece en `/dashboard/properties/<id>/automations`.

### 3. Scheduler: cron de GitHub Actions, no pg-boss

El plan dejaba la elección abierta con justificación de coste/complejidad.
Se eligió **cron de GitHub Actions** llamando a un endpoint HTTP propio:

- Cero infraestructura nueva — ya se usa GitHub Actions para CI.
- Coherente con el despliegue serverless (Vercel) asumido desde la Fase 5
  (sondeo de vídeo, subida de imágenes) — no hay ningún proceso Node de
  larga duración corriendo dentro de la app.
- `pg-boss` exigiría un *worker* persistente consumiendo la cola sobre el
  mismo Postgres — contradice el modelo serverless ya establecido y sería
  infraestructura nueva sin necesidad real a este volumen de trabajo.

## Qué incluye

### 1. Modelo de datos

- `Conversation.checkInDate` / `checkOutDate` (`DateTime?`, Fase 3
  extendida).
- `Automation` (Prisma, FK a `Property`, único por `(propertyId, type)`):
  `type`, `enabled`, `offsetHours` (horas relativas a la fecha ancla,
  negativo = antes), `messageTemplate` (placeholders `{{guestName}}` /
  `{{propertyName}}`).
- `AutomationRun` (FK a `Automation` y a `Conversation`, único por
  `(automationId, conversationId)` — evita duplicados si el cron corre más
  de una vez sobre el mismo vencimiento): `status`
  (`DUE`/`DONE`/`DISMISSED`), `scheduledFor`, `message` (ya renderizado).
- Migración: `prisma/migrations/20260914134908_phase7_automations/`.

### 2. Los 5 tipos de recordatorio

| Tipo | Ancla | Offset por defecto |
|---|---|---|
| Mensaje de bienvenida | `checkInDate` | -24h |
| Recordatorio de check-in | `checkInDate` | +2h |
| Recordatorio de check-out | `checkOutDate` | -3h |
| Seguimiento post-estancia | `checkOutDate` | +24h |
| Solicitud de reseña | `checkOutDate` | +48h |

Todo configurable por propiedad desde `/dashboard/properties/<id>/automations`
(activar/desactivar, cambiar el offset, editar la plantilla del mensaje).

### 3. `src/lib/automations/`

- `types.ts` — tipos, `ANCHOR_FIELD` (a qué fecha es relativo cada tipo),
  `DEFAULT_OFFSET_HOURS`, etiquetas.
- `templates.ts` — `DEFAULT_MESSAGE_TEMPLATE` por tipo y `renderTemplate()`
  (sustitución simple de placeholders, sin IA — a propósito: esto es
  infraestructura de recordatorios, no generación de contenido).
- `engine.ts` — `runDueAutomations(now)`: recorre las automatizaciones
  activas, calcula la fecha de vencimiento por conversación, crea un
  `AutomationRun` si ya se cumplió y todavía no existe uno (comprobación
  explícita + `@@unique` en el esquema como garantía real). Es la función
  que llama el endpoint de cron.

### 4. Endpoint de cron y workflow

- `POST /api/cron/automations` — protegido con un secreto compartido
  (`CRON_SECRET`, cabecera `Authorization: Bearer ...`), no con sesión de
  usuario, porque quien lo llama es un cron externo, no un navegador.
- `.github/workflows/aibnb-studio-automations-cron.yml` — cron cada 15
  minutos (+ `workflow_dispatch` para probarlo manualmente), llama al
  endpoint anterior con `curl`. Falla explícitamente si faltan los
  secretos del repositorio en vez de fallar en silencio.

### 5. Flujo en la aplicación

1. Al registrar o abrir una conversación con un huésped
   (`/dashboard/properties/<id>/messages/...`), el anfitrión puede indicar
   check-in/check-out (opcional, editable después).
2. En `/dashboard/properties/<id>/automations` activa los recordatorios que
   quiera, con su offset y plantilla.
3. El cron los va creando en estado `DUE` a medida que se cumple su hora.
4. El anfitrión los ve en esa misma página y los marca como "Hecho" o
   "Descartado".

### 6. Calidad de código

- 6 tests unitarios nuevos (75 en total): sustitución de plantillas,
  completitud de las tablas por tipo, y `runDueAutomations` con Prisma
  mockeado (creación cuando toca, no antes de tiempo, no si falta la
  fecha, no duplicados) — sin base de datos real en el test.
- Typecheck, lint y build de producción en verde con las rutas nuevas.

## Configuración necesaria

| Variable | Obligatoria | Para qué sirve | Dónde crearla |
|---|---|---|---|
| `CRON_SECRET` | **Sí, para que el cron funcione** | Autentica las llamadas a `/api/cron/automations` — no es la clave de ningún proveedor externo, la generas tú mismo | Genera un valor aleatorio, p. ej. `openssl rand -hex 32`; ponlo como variable de entorno del despliegue |

### Secretos de GitHub Actions requeridos

En el repositorio: **Settings → Secrets and variables → Actions**:

| Secreto | Valor |
|---|---|
| `AIBNB_SITE_URL` | URL pública del despliegue, ej. `https://tu-app.vercel.app` |
| `AIBNB_CRON_SECRET` | El mismo valor que pusiste en `CRON_SECRET` en el despliegue |

Sin esto configurado, el workflow falla explícitamente (no crea
recordatorios en silencio) y el mensaje de error dice exactamente qué
falta.

No se requiere ninguna clave de proveedor de email — ver la sección "Qué
NO incluye" abajo.

## Cómo probarlo

### Automático

```bash
cd apps/aibnb-studio
npm install
npm run db:generate && npm run db:migrate
npm run typecheck && npm run lint && npm run test   # 75 tests
npm run build
```

### Manual, end-to-end

1. Crea una conversación con `checkInDate` de mañana.
2. En `/dashboard/properties/<id>/automations`, activa "Mensaje de
   bienvenida" (offset por defecto: -24h, o sea, se activa cuando falten
   24h para el check-in).
3. Configura `CRON_SECRET` en `.env.local` y llama manualmente al endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/cron/automations \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
4. Debería aparecer un recordatorio `DUE` en
   `/dashboard/properties/<id>/automations`.

## Qué NO incluye (a propósito)

- **Envío real de email o cualquier canal externo** — no se ha pedido ni
  se ha dado ninguna clave de proveedor de email (Resend, SendGrid,
  Supabase email, etc.). Cuando llegue esa fase, se documentará aquí qué
  variable exacta hace falta y dónde crearla, y se conectará leyendo
  `NotificationPreferences.emailOnBookingReminder` (Fase 2) para decidir
  a quién avisar — no se ha inventado ningún proveedor ni contrato de API.
- **Generación de contenido con IA** para los mensajes — son plantillas
  con placeholders simples, a propósito, para mantener esta fase como
  infraestructura de recordatorios sin coste de IA añadido.
- **Un modelo de reservas (`Booking`) completo** — se decidió extender
  `Conversation` en su lugar (ver decisión #1 arriba); si una fase futura
  necesita un sistema de reservas real (disponibilidad, precios,
  solapamientos), sería una fase nueva, no parte de esta.

## Próxima fase

Fase 8 — Analítica: ocupación, ingresos, rendimiento por propiedad,
conectando los placeholders del dashboard de la Fase 1 a datos reales.
