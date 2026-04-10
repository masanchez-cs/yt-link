# DEVELOPMENT_STANDARD.md

## Propósito
Definir reglas transversales de desarrollo para web apps.

## Principios rectores
Todo proyecto debe ser:
- mantenible,
- consistente,
- fácil de entender,
- fácil de depurar,
- seguro por diseño,
- ejecutable localmente,
- operable con mocks cuando falten dependencias externas.

## Reglas generales
1. Todo requisito debe ser atómico, verificable y no ambiguo.
2. Todo texto visible al usuario debe seguir el idioma definido en `REQUIREMENTS.md`; si no está definido, usar español (México).
3. Todo identificador técnico debe estar en inglés.
4. Prioriza claridad sobre complejidad innecesaria.
5. No dejes comportamientos silenciosos o ambiguos.
6. Un ejemplo de código no es contrato, salvo que `REQUIREMENTS.md` lo indique.
7. La solución debe correr con configuración estándar y predecible.
8. Si falta un servicio externo, usa mock explícito, no comportamiento implícito.
9. No asumir dependencias, servicios ni procesos no definidos; documentarlos como `supuesto` o dejarlos pendientes.
10. Todo comportamiento por ambiente debe tener configuración documentada y un valor por defecto seguro cuando aplique.

## Convenciones de código
- Nombres claros y semánticos.
- Bajo acoplamiento y responsabilidades bien separadas.
- Evita funciones excesivamente largas.
- Evita duplicación innecesaria.
- Comenta solo lógica no obvia, integraciones o decisiones importantes.
- Mantén formato y linting consistentes.

## Principios de implementación
- Resolver con la opción más simple que mantenga calidad.
- Tocar solo lo necesario.
- Corregir causa raíz cuando sea razonable.
- Evitar abstracciones prematuras.
- Priorizar mantenibilidad sobre “ingenio”.

## Stack base back end
- Node.js LTS
- Koa
- Joi
- MySQL cuando aplique
- OpenAPI / Swagger

## Stack base front end
- React JS
- Semantic UI React

## Regla de stack para agentes
- El stack base es obligatorio salvo excepción explícita y justificada en `REQUIREMENTS.md`.
- No reemplazar librerías base por equivalentes solo por preferencia personal del agente.
- No introducir TypeScript, ORMs, state managers, schedulers o frameworks adicionales sin necesidad técnica clara o requisito explícito.
- No introducir librerías de UI, manejo de estado, formularios, data fetching o CSS que dupliquen responsabilidades del stack base sin necesidad técnica clara o requisito explícito.

## Dependencias
### Política
- Usa dependencias vigentes, mantenidas y compatibles.
- Justifica toda dependencia nueva.
- No mezcles varias librerías para la misma función sin motivo.
- Prefiere SDKs oficiales y versiones soportadas.
- No agregues dependencias para resolver utilidades menores si el lenguaje o el stack ya cubren el caso de forma clara.

### Preferencias
- `mysql2` en lugar de múltiples clientes MySQL
- un solo scheduler por proyecto
- SDK modular de AWS cuando aplique
- clientes oficiales para IA y proveedores externos

## Ambientes
- Mínimo: `dev` y `prod`
- Configuración separada por ambiente
- Variables sensibles fuera del código
- `.env.example` obligatorio con placeholders

## Mocks
- Usar mocks solo para acelerar desarrollo o aislar dependencias externas.
- Deben estar claramente identificados.
- No deben ocultar reglas críticas ni contratos.
- Deben poder desactivarse claramente.
- La validación final debe cubrir también la integración real cuando aplique.

## Observabilidad mínima
- logging estructurado,
- `trace_id` o equivalente,
- métricas básicas,
- health check y readiness check cuando aplique.

## Release
Antes de liberar:
- lint exitoso,
- pruebas relevantes exitosas,
- variables verificadas,
- documentación actualizada,
- cambios importantes documentados,
- comandos de arranque y validación documentados si cambiaron.

## Versionado
- Usa semver cuando aplique.
- Mantén changelog breve para cambios relevantes.

## Definition of Done global
Una entrega cumple el estándar si:
- corre localmente,
- respeta stack y documentos fuente,
- mantiene naming e idioma correctos,
- no introduce complejidad innecesaria,
- y deja evidencia mínima de funcionamiento.
