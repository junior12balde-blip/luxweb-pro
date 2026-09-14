# Fase 9 — Facturación (Stripe)

## Por qué esta fase, saltando la 8

El plan original tenía la Fase 8 (Analítica) antes que esta. El cliente
pidió explícitamente saltar directo a facturación después de preguntar
"cómo podemos ganar dinero con este app" — la respuesta fue que el negocio
es vender el software a otros anfitriones (suscripción SaaS), y facturar
es el paso que lo hace real. La Fase 8 queda pendiente, no cancelada — ver
`DEVELOPMENT_PLAN.md`.

## Qué incluye

### 1. Modelo de datos

- `Subscription` (Prisma, FK 1:1 a `User`): `plan` (`FREE`/`STARTER`/`PRO`/
  `BUSINESS`), `status` (mismo vocabulario que `Stripe.Subscription.Status`:
  `ACTIVE`/`TRIALING`/`PAST_DUE`/`CANCELED`/`INCOMPLETE`/
  `INCOMPLETE_EXPIRED`/`UNPAID`/`PAUSED`), `stripeCustomerId`,
  `stripeSubscriptionId`, `currentPeriodEnd`, `cancelAtPeriodEnd`.
- Un usuario **sin** fila en `Subscription` se trata como plan `FREE`
  activo — mismo patrón que las automatizaciones de la Fase 7 (config por
  defecto sin persistir hasta que el usuario actúa de verdad). No hace
  falta ninguna migración de backfill.
- Migración: `prisma/migrations/20260914142634_phase9_billing/`.

### 2. Planes

| Plan | Límite de propiedades (rol OWNER) |
|---|---|
| Gratis (`FREE`) | 1 |
| Starter | 3 |
| Pro | 10 |
| Business | Sin límite |

El límite solo cuenta propiedades de las que el usuario es **OWNER** — los
co-editores invitados a una propiedad no cuentan para el límite de quien
los invitó. Se aplica en `POST /api/properties` (devuelve `402` con un
mensaje claro si se alcanza).

### 3. `src/lib/billing/`

- `plans.ts` — tablas de límites/etiquetas y el mapeo de cada plan de pago
  a su variable de entorno de Price ID (`STRIPE_PRICE_STARTER` /
  `_PRO` / `_BUSINESS`) — los Price ID son específicos de la cuenta de
  Stripe de cada despliegue, **no se inventan aquí**.
- `stripeClient.ts` — cliente de Stripe perezoso; `apiVersion` fijado al
  valor exacto que exporta el propio SDK instalado
  (`node_modules/stripe/esm/apiVersion.d.ts` → `"2026-08-26.dahlia"`), no
  adivinado.
- `subscription.ts` — `getUserSubscription()` (con el "FREE implícito" de
  arriba) y `checkPropertyLimit()`.
- `errors.ts` — `StripeNotConfiguredError`, `PlanNotConfiguredError`.

### 4. Verificación de la forma exacta de la API de Stripe

Igual que con `@google/genai` en las Fases 5-6, no se adivinó ningún campo:
se instaló el SDK oficial `stripe` y se leyeron sus `.d.ts` directamente.
Dos detalles que **habrían sido erróneos** si se hubieran asumido por
conocimiento previo de versiones antiguas de la API de Stripe:

- `Subscription.current_period_end` **ya no existe** en el objeto
  `Subscription` de esta versión de la API — se movió a
  `subscription.items.data[].current_period_end` (por ítem, no por
  suscripción completa). El código lee `items.data[0].current_period_end`.
- `Invoice.subscription` tampoco existe ya en el objeto — la suscripción
  que generó una factura vive en
  `invoice.parent.subscription_details.subscription`.

### 5. Endpoints

- `POST /api/billing/checkout` — crea una `Checkout Session` de Stripe
  (`mode: "subscription"`) para el plan pedido y devuelve su URL;
  `client_reference_id` lleva el `userId` para poder mapear el webhook de
  vuelta a un usuario.
- `POST /api/billing/portal` — crea una sesión del *Customer Portal* de
  Stripe (gestionar método de pago, cancelar, ver facturas) — requiere que
  el usuario ya tenga `stripeCustomerId` (haber pasado por checkout antes).
- `POST /api/webhooks/stripe` — verifica la firma con
  `stripe.webhooks.constructEvent(body, header, STRIPE_WEBHOOK_SECRET)`
  sobre el **body crudo** (imprescindible: firmar sobre JSON re-serializado
  no coincide). Procesa `checkout.session.completed` (crea/actualiza la
  `Subscription`, es el único evento que trae el `userId` vía
  `client_reference_id`), `customer.subscription.updated` /`.deleted`
  (actualiza una fila que ya exista, buscada por `stripeSubscriptionId` o
  `stripeCustomerId` — si no existe todavía se ignora, se resolverá con el
  evento de checkout) e `invoice.payment_failed` (relee la suscripción real
  desde Stripe para reflejar su estado actual, típicamente `past_due`).

### 6. UI

`/dashboard/settings/billing` — plan actual + uso de propiedades, tarjetas
de los 4 planes con botón "Suscribirse" (redirige a Stripe Checkout) y
"Gestionar facturación" (Customer Portal) si ya hay una suscripción.
Enlazada desde `SettingsTabs`.

### 7. Calidad de código

- 8 tests unitarios nuevos (83 en total): tablas de planes, resolución de
  Price ID ↔ plan, `getUserSubscription` (FREE implícito, plan activo,
  plan cancelado → `effectivePlan` FREE pero se conserva el plan real para
  mostrarlo), `checkPropertyLimit` (bloquea en el límite, ilimitado en
  Business) — todo con Prisma mockeado, sin base de datos real.
- **Verificación en vivo del webhook sin necesitar una clave real de
  Stripe**: se generó una firma válida con
  `Stripe.webhooks.generateTestHeaderString()` (utilidad del propio SDK,
  pensada exactamente para esto) y se golpeó `/api/webhooks/stripe` en el
  servidor de desarrollo real — sin firma → 400, firma incorrecta → 400,
  firma válida → 200. Esto prueba que la verificación de firma funciona de
  verdad, sin gastar ninguna llamada de pago ni necesitar credenciales.
- Typecheck, lint y build de producción en verde con las rutas nuevas.

## Configuración necesaria

| Variable | Obligatoria | Para qué sirve | Dónde crearla |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | **Sí, para checkout/portal/webhooks** | Clave privada de servidor de Stripe | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | **Sí, para que el webhook funcione** | Verifica que las notificaciones vienen de verdad de Stripe | https://dashboard.stripe.com/webhooks → crea un endpoint apuntando a `<tu-dominio>/api/webhooks/stripe`, eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No (reservada, no usada todavía — el checkout actual redirige a una página alojada por Stripe, no usa Stripe.js en el cliente) | — | https://dashboard.stripe.com/apikeys |
| `STRIPE_PRICE_STARTER` / `STRIPE_PRICE_PRO` / `STRIPE_PRICE_BUSINESS` | **Sí, uno por cada plan que quieras activar** | ID del Price de Stripe de cada plan — específico de tu cuenta, no se inventa | Dashboard de Stripe → Product catalog → crea un producto recurrente por plan → copia el Price ID (`price_...`) |

Sin `STRIPE_SECRET_KEY`, los botones de "Suscribirse"/"Gestionar
facturación" muestran un error claro ("Stripe no está configurado") — el
resto de la app (incluido el límite de propiedades del plan Gratis) sigue
funcionando igual, porque no depende de Stripe para nada.

## Cómo probarlo

### Automático (sin claves de Stripe)

```bash
cd apps/aibnb-studio
npm install
npm run db:generate && npm run db:migrate
npm run typecheck && npm run lint && npm run test   # 83 tests
npm run build
```

### Con claves de Stripe reales (modo test de Stripe, sin cobros reales)

1. Crea una cuenta de Stripe (o usa una existente) y quédate en **modo
   test** (nunca se pidió activar modo real).
2. Crea 3 productos recurrentes (Starter/Pro/Business) y copia sus Price
   ID a `STRIPE_PRICE_STARTER`/`_PRO`/`_BUSINESS`.
3. `STRIPE_SECRET_KEY` desde el Dashboard (clave de test, `sk_test_...`).
4. Para probar webhooks en local: `stripe listen --forward-to
   localhost:3000/api/webhooks/stripe` (Stripe CLI) te da un
   `STRIPE_WEBHOOK_SECRET` de test al vuelo.
5. Ve a `/dashboard/settings/billing`, pulsa "Suscribirse" en un plan,
   completa el checkout con una [tarjeta de prueba de
   Stripe](https://docs.stripe.com/testing) (`4242 4242 4242 4242`).
6. Deberías volver a `/dashboard/settings/billing` con el plan actualizado.

## Qué NO incluye (a propósito)

- **Cobro real** — todo lo anterior se verifica en modo test de Stripe; no
  se ha pedido ni se ha hecho ningún cobro real.
- **Múltiples suscripciones por equipo/organización** — la app no tiene
  concepto de "organización" todavía (ver `ARCHITECTURE.md`, multi-tenancy
  vía `Membership`); quien paga es el `User` que gestiona sus propiedades,
  no un grupo. Si en el futuro se añade un concepto de organización,
  `Subscription` movería su FK de `User` a esa entidad sin tocar la
  arquitectura de Stripe.
- **Cupones/descuentos/facturación anual** — nada de eso se pidió; se
  puede configurar del lado de Stripe (Price/Coupon) sin tocar código,
  siempre que el Price ID siga siendo uno de los tres configurados.
- **Reconciliación de eventos fuera de orden** — si `customer.subscription.updated`
  llega antes que `checkout.session.completed` para una suscripción nueva
  (raro pero posible en Stripe), el evento de actualización se ignora
  porque todavía no existe la fila; el de checkout la crea con el estado
  correcto igualmente (relee la suscripción completa desde Stripe, no
  depende del contenido del evento anterior). No se construyó una cola de
  reintentos para este caso — con el volumen esperado de esta app no
  se justifica la complejidad.

## Próxima fase

Fase 8 — Analítica (pendiente, saltada por decisión del cliente): ocupación,
ingresos, rendimiento por propiedad, conectando los placeholders del
dashboard de la Fase 1 a datos reales. Fase 10 — Endurecimiento y
despliegue tras eso.
