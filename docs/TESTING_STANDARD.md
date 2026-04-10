# TESTING_STANDARD.md

## Propósito
Definir la estrategia mínima de pruebas y evidencia para proyectos alineados a este estándar.

## Framework base
- Jest
- Playwright para front-end E2E

## Principios
- no asumir que compilar equivale a funcionar,
- probar el cambio real realizado,
- usar evidencia reproducible,
- cubrir flujos críticos antes de cerrar.

## Tipos de prueba
### Unit tests
Funciones, validadores, transformaciones y lógica aislada.

### Integration tests
Interacción entre módulos, API, MySQL, jobs o integraciones simuladas.

### End-to-end tests backend
Flujos completos del sistema:
- request o evento de entrada,
- procesamiento,
- persistencia,
- respuesta o side effect esperado.

### End-to-end tests front-end
Usar Playwright cuando exista interfaz web para validar:
- navegación principal,
- autenticación,
- formularios críticos,
- tablas, filtros y búsquedas,
- estados vacíos, loading y errores,
- flujos críticos del usuario,
- y comportamiento responsive básico cuando aplique.

### Security tests
Cuando aplique:
- auth,
- autorización,
- validación,
- errores seguros,
- rutas protegidas.

### Performance tests
Cuando el proyecto lo requiera:
- latencia,
- throughput,
- degradación bajo carga.

## Cobertura mínima sugerida
- validaciones de entrada,
- casos de uso críticos,
- autenticación y autorización,
- errores relevantes,
- contratos principales del API,
- borrado lógico si existe,
- jobs o webhooks críticos si existen,
- y flujos críticos del front-end si existe UI.

## Regla de selección de pruebas
- cambios de lógica aislada: unit tests como mínimo,
- cambios de contrato, persistencia o integración: integration tests como mínimo,
- cambios en flujos críticos de usuario o UI crítica: Playwright o E2E equivalente, salvo justificación explícita,
- bugs reproducibles: prueba antes y después cuando sea razonable,
- cambios en validaciones: cubrir al menos un caso válido y un caso inválido representativo,
- proyectos bilingües: validar al menos un flujo crítico por idioma o justificar una cobertura equivalente.

## Datos de prueba
- reproducibles y mínimos
- sin dependencia de datos manuales no documentados
- separados por ambiente cuando aplique
- para Playwright, usar fixtures o datos controlados
- aislar o resetear estado compartido entre suites cuando aplique

## Ejecución
El repositorio debe exponer scripts claros, por ejemplo:
- `npm test`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:e2e`
- `npx playwright test`

## Evidencia esperada
Toda entrega debe poder demostrar:
- qué se probó,
- cómo se ejecuta,
- resultado esperado,
- evidencia de que los flujos críticos pasan.
- comando ejecutado y resultado final cuando sea relevante para cierre de tarea.

## Reglas obligatorias antes de cierre
- reproducir el bug si es posible antes de corregirlo
- verificar antes y después cuando sea relevante
- ejecutar el nivel de prueba adecuado según impacto
- si el cambio afecta UI crítica, correr Playwright o justificar por qué no aplica
- si se agrega o cambia un contrato crítico, validar también el caso de error relevante y no solo el happy path
- si la automatización no cubre todo el riesgo relevante, documentar verificación manual complementaria

## Qué no hacer
- no depender solo de pruebas manuales
- no dejar flujos críticos sin prueba
- no usar mocks que oculten fallas reales sin documentarlo
- no asumir que una respuesta 200 garantiza comportamiento correcto
- no asumir que una vista “se ve bien” sin validar interacción crítica
- no usar snapshots como única evidencia para flujos críticos

## Reglas específicas para Playwright
- cubrir happy path y al menos un caso de error relevante
- usar selectores estables
- preferir `data-testid`, roles accesibles o labels estables antes que selectores frágiles por CSS
- no depender de tiempos fijos innecesarios
- validar comportamiento visible para el usuario
- mantener pruebas independientes y reproducibles

## Criterios de precisión para agentes
- No reportar una tarea como validada solo por lint, build o ejecución local.
- No asumir que un mock reemplaza la integración real en validación final si el riesgo principal está en la integración.
- Si una prueba no aplica, documentar por qué no aplica en lugar de omitirla silenciosamente.
- No marcar una tarea como probada si solo existe cobertura parcial del flujo crítico afectado.
