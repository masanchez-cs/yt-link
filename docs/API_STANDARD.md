# API_STANDARD.md

## Propósito
Definir reglas de diseño, implementación y documentación para APIs, webhooks y endpoints operativos de backend.

## Stack base
- Node.js
- Koa
- koa-better-router
- Joi
- OpenAPI / Swagger

## Principios
- contratos claros,
- validación temprana,
- respuestas predecibles,
- separación entre rutas públicas y privadas,
- seguridad por defecto.

## Organización
- Rutas en `routes/`
- Lógica de negocio en `src/`
- Utilerías transversales en `src/system/`
- Integraciones por proveedor o canal en módulos separados
- No forzar estructura CRUD cuando el caso real sea webhook, job o proceso

## Estructura sugerida
```text
routes/
src/
src/system/
src/modules/
src/jobs/
swagger/
app.js
```

## Nombres de módulos
Usa nombres por intención. Ejemplos válidos:
- `create.js`
- `update.js`
- `get.js`
- `getAll.js`

## Validación
- Toda entrada debe validarse antes de tocar lógica o base de datos.
- No confiar en validaciones del cliente o del proveedor externo.
- Validar headers, query params, params y body cuando existan.
- En webhooks, validar firma y formato antes de procesar.
- Cuando un proveedor requiera validar firma sobre el payload crudo, preservar el raw body antes de parsearlo.
- Para mensajes y contrato de error, usar `ERROR_HANDLING_STANDARD.md`.

## Respuestas
- Deben ser consistentes y fáciles de consumir.
- Si el endpoint es síncrono, devolver resultado claro.
- Si el proceso es asíncrono, preferir `202 Accepted` con identificador de job cuando aplique.
- Por defecto, éxito y error deben incluir `trace_id`.
- Si la aplicación no genera correlación, usar `trace_id` vacío (`""`) y documentarlo. Solo omitir el campo si el contrato del proyecto lo define explícitamente.
- No mezclar campos de éxito y error en un mismo payload.
- No devolver `200` para validaciones fallidas, autenticación fallida o errores de negocio.

## Contrato recomendado
### Éxito
```json
{ "success": true, "data": {}, "message": "", "trace_id": "" }
```

### Error
Usar el formato definido en `ERROR_HANDLING_STANDARD.md`.

## HTTP
Usa códigos correctos:
- `200/201` éxito
- `202` procesamiento asíncrono
- `400` solicitud mal formada o inválida a nivel sintáctico
- `401` autenticación requerida o inválida
- `403` acceso denegado
- `404` recurso no encontrado
- `409` conflicto de negocio o idempotencia
- `422` validación semántica cuando aplique
- `429` rate limit
- `500/502/503/504`

## Criterios de diseño de rutas
- Mantener consistencia dentro del mismo proyecto.
- No mezclar en el mismo módulo estilos incompatibles de naming o versionado.
- Si el proyecto usa versionado de API, documentarlo y aplicarlo de forma uniforme.
- Si un endpoint no es CRUD, nombrarlo por intención del caso de uso.

## Seguridad del API
Aplicar autenticación, autorización, CORS, hardening, rate limiting y exposición segura según `SECURITY.md`.

## Webhooks y canales
- Verificar firma/autenticidad si el proveedor lo soporta.
- Soportar idempotencia para reintentos.
- Registrar evento recibido con trazabilidad mínima.
- No asumir orden perfecto ni entrega única de eventos.
- Si existe identificador externo de evento, persistirlo o usarlo para evitar reprocesamiento indebido.

## Observabilidad
Para logging, correlación, métricas y health checks, usar la línea base definida en `DEVELOPMENT_STANDARD.md`.

## OpenAPI / Swagger
Documentar:
- propósito de la ruta,
- auth,
- parámetros,
- body,
- respuestas,
- errores esperados,
- webhooks o callbacks cuando existan.
- campos requeridos y opcionales reales, sin documentar campos que la API no devuelve.

## Criterios de precisión para agentes
- Tratar “estructura sugerida” como referencia y no como obligación rígida, salvo que `REQUIREMENTS.md` lo exija.
- No asumir paginación, filtros, ordenamiento, versionado ni idempotency keys si no están definidos; proponerlos como `supuesto` conservador o documentarlos antes de implementarlos.
- Cuando un contrato no defina un campo opcional, no inventarlo en la respuesta pública.
- No usar `message` de éxito para duplicar `data`; si no aporta valor, dejarlo vacío según el contrato.

## Checklist
- rutas consistentes,
- validación completa,
- contrato documentado,
- errores consistentes,
- seguridad aplicada según `SECURITY.md`,
- OpenAPI actualizado.
