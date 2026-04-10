# DATABASE_STANDARD.md

## Propósito
Definir reglas obligatorias para modelado, persistencia y operación de MySQL en proyectos que lo requieran.

## Motor y archivo base
- Motor: MySQL
- Archivo obligatorio: `sql/schema.sql`

## Alcance de `schema.sql`
Debe permitir levantar un entorno local reproducible con:
- base de datos,
- tablas,
- relaciones,
- índices,
- datos mínimos de prueba.

## Reglas de modelado
- Usa nombres de tablas y columnas en inglés.
- La tabla debe tener nombre semántico en singular o plural, pero consistente dentro del mismo proyecto.
- La primary key debe llamarse con patrón `table_name_id` o `entity_id`.
- Usa tipos explícitos y longitudes razonables.
- Declara `NOT NULL` cuando corresponda.
- Declara índices para búsquedas frecuentes y llaves foráneas.
- No usar columnas JSON como atajo para evitar modelado relacional cuando el dato requiera filtros, joins, integridad o reporting frecuentes.

## Columnas base
Toda tabla funcional debe incluir como mínimo:
- primary key,
- `creation_date`,
- `last_update_date`.

Toda tabla funcional debe incluir `active` cuando represente una entidad con baja lógica o estado funcional activo/inactivo.
Si una tabla funcional no usa `active`, debe justificarse en `REQUIREMENTS.md` o en un documento técnico versionado dentro del repositorio.

## Claves primarias
- Puedes usar entero autoincremental como PK interna.
- Si el recurso necesita identificador público o distribuido, permite UUID adicional.
- No expongas IDs internos si el proyecto requiere otra estrategia.

## Borrado lógico
- La baja funcional debe resolverse con `active = 0` cuando la entidad use estado activo/inactivo.
- No hacer borrado físico funcional salvo excepción explícita.
- Las consultas funcionales deben considerar `active = 1` cuando aplique.

## Relaciones
- Declara llaves foráneas cuando aporten integridad real y no bloqueen un requisito explícito del proyecto.
- Toda llave foránea funcional debe tener índice compatible.
- Evita relaciones ambiguas o sin índice.
- No pongas lógica de negocio en stored procedures o triggers.
- No asumir cascadas (`ON DELETE` / `ON UPDATE`) sin decisión explícita del proyecto.

## Usuario de aplicación
- Crear usuario restringido para la app.
- Permisos mínimos típicos: `SELECT`, `INSERT`, `UPDATE`.
- `DELETE` solo para tablas técnicas o excepción explícita en `REQUIREMENTS.md`.
- No otorgar privilegios administrativos, DDL ni `INDEX` al usuario runtime.

## Fechas y zona horaria
- Persistir fechas en UTC.
- Convertir a zona local solo en capa de aplicación.
- Mantener formato consistente entre app y base.

## Seguridad y conexión
- Configuración por ambiente.
- Certificados en `cert/` cuando aplique.
- Sin credenciales reales en el repositorio.
- Para secretos y controles adicionales, usar `SECURITY.md`.

## Acceso desde backend
`src/system/mysql.js` o equivalente debe centralizar:
- pool de conexiones,
- queries parametrizados,
- manejo consistente de transacciones y rollback,
- helpers reutilizables,
- manejo de fechas UTC.

## Datos de prueba
- Deben ser mínimos, útiles y reproducibles.
- No depender de inserts manuales externos no documentados.

## Criterios de precisión para agentes
- No asumir columnas adicionales como `deleted_at`, `created_by` o `updated_by` si no están definidas por el proyecto.
- No convertir ejemplos de naming en obligación distinta a la aquí definida.
- Si una decisión de modelado impacta integridad, consultas o seguridad, documentarla antes de cambiar el esquema.

## Checklist
- esquema reproducible,
- índices razonables,
- llaves foráneas donde aporten,
- borrado lógico aplicado,
- usuario restringido,
- fechas consistentes,
- sin lógica de negocio incrustada en DB.
