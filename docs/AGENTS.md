# AGENTS.md

## Propósito
Define cómo debe comportarse el agente de codificación dentro del repositorio.

## Alcance
Este repositorio construye web apps.

## Orden de precedencia
1. `REQUIREMENTS.md`
2. `SECURITY.md`
3. `API_STANDARD.md`
4. `DATABASE_STANDARD.md`
5. `UX_UI_GUIDELINES.md`
6. `ERROR_HANDLING_STANDARD.md`
7. `TESTING_STANDARD.md`
8. `DEVELOPMENT_STANDARD.md`

## Regla de interpretación
- `REQUIREMENTS.md` define qué se construye.
- Los estándares definen cómo se construye.
- Si `REQUIREMENTS.md` contradice un estándar, `REQUIREMENTS.md` solo prevalece cuando la excepción esté explícita y justificada.
- Si un estándar contradice a otro, prevalece el documento con mayor prioridad según el orden anterior.
- Si algo no está definido, el agente debe declararlo como `supuesto` conservador y no presentarlo como requisito confirmado.

## Reglas obligatorias
1. Lee primero `REQUIREMENTS.md` y luego los estándares relevantes.
2. No inventes requisitos, pantallas, integraciones ni reglas críticas.
3. Si algo no está definido, dilo explícitamente y usa un `supuesto` conservador.
4. No cambies stack, seguridad, contratos ni persistencia sin justificación técnica.
5. No dupliques reglas entre archivos; actualiza el documento fuente correcto.
6. Si detectas contradicciones entre documentos, repórtalas antes de cambios grandes.
7. Mantén separadas las capas: UI, API, dominio y persistencia.
8. Corrige solo lo necesario; evita refactors laterales innecesarios.
9. No cierres una tarea solo porque “compila”.
10. Interpreta el lenguaje normativo así:
   - `debe`, `obligatorio`, `no debe`: requisito obligatorio.
   - `cuando aplique`, `si existe`, `si se usa`, `detrás de HTTPS` y expresiones equivalentes: obligación condicional.
   - `preferir`: preferencia.
   - `equivalente`: alternativa válida solo si mantiene el mismo nivel de control, seguridad o resultado esperado.
11. No conviertas ejemplos, estructuras sugeridas o nombres ilustrativos en contrato rígido si el documento no lo declara como obligatorio.
12. Si un `supuesto` impacta seguridad, autenticación, pagos, contratos públicos, persistencia, costos externos o datos sensibles, trátalo como pendiente o decisión explícita y no como comportamiento definitivo.
13. Si el repositorio ya tiene una convención válida que no contradice estos documentos, respétala antes de introducir una nueva.

## Flujo de trabajo
1. Leer `REQUIREMENTS.md`.
2. Leer estándares aplicables.
3. Planear si la tarea no es trivial.
4. Implementar con cambio mínimo seguro.
5. Validar con evidencia.
6. Actualizar documentación afectada.

## Consultar por tipo de tarea
- API y webhooks: `API_STANDARD.md`
- MySQL: `DATABASE_STANDARD.md`
- UX/UI: `UX_UI_GUIDELINES.md`
- Seguridad: `SECURITY.md`
- Errores y mensajes: `ERROR_HANDLING_STANDARD.md`
- Pruebas: `TESTING_STANDARD.md`
- Reglas transversales: `DEVELOPMENT_STANDARD.md`

## Definition of Done
No cierres una tarea hasta validar:
- respeta el estándar,
- no degrada seguridad,
- mantiene contratos y consistencia,
- actualiza documentación afectada,
- y tiene evidencia mínima según `TESTING_STANDARD.md`.
