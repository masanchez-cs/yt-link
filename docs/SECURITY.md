# SECURITY.md

## Propósito
Definir los controles obligatorios de seguridad para web apps en AWS.

## Principios
- seguridad por defecto,
- privilegio mínimo,
- defensa en profundidad,
- secretos fuera del código,
- validación temprana,
- falla segura,
- trazabilidad y auditoría.

## Secretos
- Nunca hardcodear API keys, passwords, tokens, certificados o connection strings reales.
- Usar variables de entorno y `.env.example` con placeholders.
- En AWS, preferir Secrets Manager, SSM Parameter Store o equivalente.
- Rotar secretos cuando el proyecto lo requiera.

## Ambientes
Usar los ambientes definidos en `DEVELOPMENT_STANDARD.md`.
Controles mínimos:
- no reutilizar credenciales ni bases de producción fuera de producción,
- no habilitar debugging inseguro en producción,
- fallar al arrancar si falta configuración crítica.

## Seguridad del API
- Aplicar validación, autenticación, autorización, CORS y hardening en backend.
- No exponer stack traces ni secretos.
- Delimitar rutas públicas y privadas.
- CORS debe ser restrictivo por allowlist; no usar `*` con credenciales.
- Para contratos y validación operativa, usar `API_STANDARD.md`.

## Headers y hardening
- Usar Helmet o equivalente cuando aplique.
- HSTS en producción detrás de HTTPS.
- `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y frame protections según el caso.
- Evaluar CSP cuando la app sirva HTML o renderice contenido sensible; si no se usa, documentar la razón.
- Documentar excepciones necesarias para Swagger o callbacks.

## Webhooks e integraciones
- Verificar firma/autenticidad si el proveedor lo soporta.
- Proteger contra replay cuando aplique.
- Definir timeouts y retries seguros, con límites y backoff cuando aplique.
- Validar payloads externos siempre.
- No confiar en respuestas de terceros.
- No registrar firmas, tokens o payloads sensibles completos en logs.

## Base de datos
- Usuario runtime con privilegios mínimos.
- Sin privilegios administrativos, DDL ni `INDEX`.
- Certificados en `cert/` si la conexión lo requiere.
- Para reglas de modelado y borrado lógico, usar `DATABASE_STANDARD.md`.

## Dependencias
- Usar librerías vigentes y mantenidas.
- Revisar vulnerabilidades y actualizaciones críticas.
- Evitar paquetes abandonados o redundantes.
- Corregir o justificar vulnerabilidades críticas antes de liberar.

## Logging y auditoría
- Logs útiles sin secretos ni PII innecesaria.
- Registrar auth failures, cambios sensibles y errores relevantes.
- Incluir `trace_id` o correlación equivalente.
- Enmascarar o truncar tokens, links mágicos, firmas y datos sensibles cuando sea suficiente para soporte.

## Seguridad del front end y sesión
- No confiar en el front end para aplicar seguridad real; el backend es la autoridad final.
- No exponer secretos, tokens privilegiados ni lógica sensible en el cliente.
- Proteger rutas privadas en UI por experiencia de usuario, no como único control de acceso.
- Minimizar datos sensibles en `localStorage`, `sessionStorage`, IndexedDB o caches del navegador.
- Evitar persistir PII innecesaria en el navegador.

## Cookies, sesión y autenticación web
- Si se usan cookies para sesión o autenticación, considerar:
  - `HttpOnly` cuando el token o sesión no deba ser accesible desde JavaScript,
  - `Secure` en producción bajo HTTPS,
  - `SameSite=Lax` o `SameSite=Strict` según el flujo,
  - expiración razonable,
  - invalidación de sesión al cerrar sesión o revocar acceso.
- Si se usan tokens en front end, definir explícitamente:
  - dónde se almacenan,
  - tiempo de vida,
  - estrategia de refresh,
  - y mitigaciones contra robo, replay o uso indebido.
- No usar cookies o tokens persistentes sin justificar duración, revocación y riesgo.
- Por defecto, toda sesión o token debe tener vigencia finita. La no expiración es una excepción del proyecto y debe quedar explícita.

## Links mágicos y acceso por URL
- Si el proyecto usa links mágicos, el token debe ser aleatorio de alta entropía, resistente a manipulación y no debe exponer identificadores internos simples.
- El enlace debe validarse en backend antes de permitir acceso al recurso.
- El token debe quedar asociado al recurso o contexto correcto y transmitirse solo por HTTPS.
- Por defecto, un link mágico debe expirar y/o tener reutilización controlada. Si el proyecto permite reutilización o no expiración, esa excepción debe estar explícita en `REQUIREMENTS.md` y no debe asumirse por defecto en otros proyectos.
- No registrar links mágicos completos en logs.
- Aplicar rate limiting o controles equivalentes al endpoint de acceso cuando el riesgo del flujo lo justifique.
- Registrar accesos relevantes asociados al enlace cuando el riesgo del flujo lo justifique.

## CSRF y navegación autenticada
- Si la autenticación depende de cookies y existen operaciones mutantes, la protección CSRF es obligatoria salvo justificación técnica documentada.
- Las operaciones sensibles no deben depender solo de controles visuales del front end.
- Toda operación sensible debe validarse también en backend aunque la UI ya haya validado sesión, rol o permisos.

## Checklist mínimo
- sin secretos en repo,
- `.env.example` presente,
- auth y autorización revisadas,
- CORS restringido,
- queries parametrizados,
- usuario DB con privilegio mínimo,
- hardening básico activo,
- integraciones externas validadas,
- logs sin secretos ni PII innecesaria,
- front end sin secretos ni datos sensibles persistidos sin justificación,
- estrategia de cookies o tokens definida si existe autenticación web,
- protección CSRF evaluada o aplicada si la autenticación depende de cookies,
- operaciones sensibles validadas en backend aunque existan controles en UI.

## Definition of Done de seguridad
Una entrega cumple seguridad mínima si:
- no expone secretos,
- controla acceso correctamente,
- aplica privilegio mínimo,
- protege integraciones críticas,
- no delega seguridad real al front end,
- define correctamente sesión, cookies o tokens cuando aplique,
- evalúa o implementa CSRF si usa autenticación basada en cookies,
- y no introduce configuraciones inseguras por omisión.
