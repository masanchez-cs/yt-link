# ERROR_HANDLING_STANDARD.md

## Propósito
Definir un estándar consistente para validaciones, errores, warnings y mensajes operativos del backend.

## Objetivos
- mensajes claros,
- trazabilidad interna,
- mínima exposición técnica,
- consistencia entre módulos,
- soporte más simple.

## Principios
- claridad para el usuario,
- separación entre mensaje técnico y mensaje público,
- códigos estables,
- trazabilidad con correlación.

## Tipos de error
- validación,
- autenticación,
- autorización,
- recurso no encontrado,
- negocio,
- dependencia externa,
- timeout,
- rate limit,
- error interno.

## Reglas para mensajes públicos
- Usar el idioma definido en `REQUIREMENTS.md`; si no está definido, usar español (México).
- Claros, breves y accionables.
- Sin stack traces, queries, nombres internos ni datos sensibles.
- No culpar al usuario.
- Si el error es corregible, indicar cómo avanzar.

## Reglas para logs internos
Para política de logging y filtrado sensible, usar `SECURITY.md`. Como mínimo, registrar:
- módulo,
- operación,
- `error_code`,
- severidad,
- contexto mínimo,
- `trace_id`.

## Contrato recomendado de error
```json
{
  "success": false,
  "error_code": "RESOURCE_NOT_FOUND",
  "message": "No fue posible encontrar la información solicitada.",
  "details": [],
  "trace_id": ""
}
```

## Campos
- `error_code`: identificador técnico estable
- `message`: mensaje público seguro
- `details`: lista opcional para validaciones
- `trace_id`: correlación para soporte
- Por defecto, incluir `trace_id`; si no existe correlación, usar cadena vacía (`""`). Solo omitirlo si el contrato del proyecto lo define explícitamente.

## Estructura recomendada para `details`
Cuando `details` represente errores de validación, por defecto usar una estructura consistente como:

```json
[
  { "field": "email", "code": "REQUIRED", "message": "El correo es obligatorio." }
]
```

Si el proyecto usa otra estructura, debe mantenerse uniforme en todos los endpoints.

## Catálogo base
- `VALIDATION_ERROR`
- `AUTHENTICATION_REQUIRED`
- `ACCESS_DENIED`
- `RESOURCE_NOT_FOUND`
- `RESOURCE_ALREADY_EXISTS`
- `BUSINESS_RULE_VIOLATION`
- `RATE_LIMIT_EXCEEDED`
- `IDEMPOTENCY_CONFLICT`
- `EXTERNAL_SERVICE_ERROR`
- `TIMEOUT_ERROR`
- `INTERNAL_SERVER_ERROR`

## Mapeo HTTP sugerido
- `400` solicitud inválida
- `401` autenticación requerida
- `403` acceso denegado
- `404` recurso no encontrado
- `409` conflicto de negocio o idempotencia
- `422` validación semántica si aplica
- `429` límite excedido
- `500` error interno
- `502/503/504` dependencia externa

## Reglas por categoría
### Validación
- Indicar campo o condición.
- Permitir corrección inmediata.
- Puede incluir múltiples `details`.
- Cada elemento de `details` debe ser consistente dentro del proyecto; si se define estructura por campo, mantenerla igual en todos los endpoints.
- Cuando sea razonable, mantener orden estable en `details` para facilitar depuración y pruebas.

### Negocio
- Explicar por qué no se puede ejecutar la acción.
- No exponer internals del dominio.

### Dependencia externa
- No propagar mensajes crudos del tercero.
- Traducir a mensaje controlado.
- Mantener detalle técnico solo en logs.

### Error interno
- Respuesta genérica y segura.
- Diagnóstico en logs.
- No inventar causa si no se conoce.

## Warnings
Usar warning solo si la operación puede continuar.
No mezclar warnings con errores fatales.

## Criterios de precisión para agentes
- No inventar `error_code` nuevos si el catálogo existente cubre el caso.
- Si se requiere uno nuevo, documentarlo y mantener naming estable en mayúsculas con guiones bajos.
- No mezclar mensajes públicos bilingües dentro del mismo payload salvo que el proyecto lo defina explícitamente.
- No mezclar campos de error con respuestas exitosas.
- Mantener el mismo significado funcional para un `error_code` aunque cambie el texto del mensaje.

## Checklist
- catálogo básico definido,
- mensajes públicos seguros,
- validaciones accionables,
- mapeo HTTP consistente,
- logs con `trace_id`,
- errores externos traducidos,
- sin exposición de internals.
