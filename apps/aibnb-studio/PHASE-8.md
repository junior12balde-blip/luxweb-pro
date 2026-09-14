# Fase 8 — Analítica

## Por qué llega después de la Fase 9

El plan original tenía esta fase antes de facturación. El cliente pidió
explícitamente saltar a la Fase 9 primero (ver `PHASE-9.md`); esta fase
retoma lo pendiente, ahora sobre la base de `Subscription` ya existente
(sin ninguna dependencia entre ambas, así que el orden real no afecta el
resultado).

## De dónde salen los datos (y qué NO son)

No hay ningún modelo de reservas ni de pagos en la app — se decidió
explícitamente en la Fase 7 no construir uno (ver "Qué NO incluye" en
`PHASE-7.md`). Esta fase reutiliza el único dato de estadías que existe:
`Conversation.checkInDate`/`checkOutDate`, introducido manualmente por el
anfitrión.

Esto significa que **"ingresos" aquí es siempre una estimación**
(noches reservadas × precio/noche *actual* de la propiedad), nunca un
registro contable real — no se sabe qué se cobró de verdad en cada
estadía, ni el precio vigente en el momento de la reserva. La UI y el CSV
lo dejan explícito ("Ingresos estimados", no "Ingresos"). Si en el futuro
se añade un sistema de reservas/pagos real, esta fase se conectaría a esos
datos sin cambiar la interfaz (`computeUserMetrics` seguiría devolviendo
la misma forma).

No hace falta ninguna migración de Prisma — toda la analítica se calcula
al vuelo sobre datos que ya existían.

## Qué incluye

### 1. `src/lib/analytics/`

- `metrics.ts` — `computeUserMetrics(userId, range)`: para cada propiedad
  del usuario, suma las noches de las conversaciones con fechas que
  solapan el rango pedido (recortadas a los límites del rango con
  `computeNightsOverlap`), calcula ocupación (con tope en 100% — dos
  estadías que se solapan por error de captura no deben dar >100%) e
  ingresos estimados. Agrupa los ingresos **por moneda** — nunca se suman
  monedas distintas entre sí (un anfitrión con propiedades en EUR y USD
  vería un dato incorrecto si se sumaran directamente).
- `csv.ts` — `buildAnalyticsCsv()`: construye el CSV a mano (sin
  dependencia nueva), con el escapado estándar de comillas/comas/saltos
  de línea.
- `format.ts` — `formatCurrency()`/`formatPercent()` con `Intl.NumberFormat`
  (nativo del navegador/Node, sin dependencia nueva).

### 2. Rango de fechas

Tres opciones fijas: 7 / 30 / 90 días terminando hoy — sin selector de
fechas personalizado (no se pidió, y con el volumen de datos esperado no
se justifica la complejidad de un date-range picker todavía).

### 3. UI

- `/dashboard` — las dos tarjetas placeholder ("Ocupación (30 días)" /
  "Ingresos (30 días)") ahora muestran datos reales. Si el usuario tiene
  propiedades en más de una moneda, la tarjeta de ingresos lo indica en
  vez de sumar monedas distintas, con un enlace a la página de detalle.
- `/dashboard/analytics` (nueva, enlazada desde el Sidebar) — selector de
  rango, dos tarjetas resumen, y una tabla por propiedad (ocupación,
  noches reservadas, número de estancias, ingresos estimados). Botón
  "Descargar CSV".

### 4. Exportación

- `GET /api/analytics/export?days=7|30|90` — devuelve un CSV descargable
  (`Content-Disposition: attachment`) con el mismo desglose por propiedad
  que la tabla.

### 5. Calidad de código

- 8 tests unitarios nuevos (91 en total): `computeNightsOverlap` (estadía
  dentro del rango, recortada al inicio, sin solape), `getDefaultRange`,
  `computeUserMetrics` con Prisma mockeado (agrupación por moneda, tope de
  ocupación al 100%, usuario sin propiedades), y `buildAnalyticsCsv`
  (cabecera, formato, escapado de comillas).
- **Verificación adicional contra Postgres real** (no solo mocks): se creó
  un usuario/propiedad/conversación de prueba con una estadía de 10 a 5
  días atrás y se llamó a `computeUserMetrics` de verdad — devolvió 5
  noches reservadas, 16.67% de ocupación y 500€ de ingresos estimados
  (5 × 100€/noche), exactamente lo esperado. Confirma que la cláusula
  `where` de Prisma (combinando `not: null` con `lt`/`gt` en el mismo
  campo) genera SQL válido — algo que un mock no habría detectado. Datos
  de prueba borrados al terminar.
- Typecheck, lint y build de producción en verde con las rutas nuevas.

## Cómo probarlo

```bash
cd apps/aibnb-studio
npm install
npm run db:generate && npm run db:migrate
npm run typecheck && npm run lint && npm run test   # 91 tests
npm run build
```

Manualmente: registra una conversación con `checkInDate`/`checkOutDate`
en el pasado reciente (`/dashboard/properties/<id>/messages` → nueva
conversación, o edítalas después desde el detalle de la conversación) y
visita `/dashboard/analytics`.

## Qué NO incluye (a propósito)

- **Exportación en PDF** — el plan original mencionaba "CSV/PDF". Se
  implementó solo CSV: cubre el caso de uso real (abrir en Excel/Sheets
  para análisis propio) sin añadir una dependencia de renderizado de PDF
  para un formato que aporta menos aquí (no hay membrete ni gráficos que
  justifiquen un documento). Si hace falta en el futuro, se añadiría como
  una función más en `src/lib/analytics/` sin tocar `metrics.ts`.
- **Selector de fechas personalizado** — solo 7/30/90 días fijos.
- **Ingresos reales/contabilidad** — ver la sección de arriba; esto
  requeriría un sistema de reservas y pagos que no se ha pedido.
- **Gráficas/series temporales** — la tabla muestra el agregado del rango
  elegido, no una evolución día a día. Se podría añadir reutilizando
  `computeNightsOverlap` con sub-rangos, sin cambiar el modelo de datos.

## Próxima fase

Fase 10 — Endurecimiento y despliegue: rate limiting, manejo de errores
centralizado, logging, Dockerfile de producción, pipeline CI/CD completo.
