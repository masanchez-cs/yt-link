# UX_UI_GUIDELINES.md

## Propósito
Definir el estándar visual, de navegación y experiencia de usuario para proyectos con React JS y Semantic UI React.

## Principios
- claridad antes que densidad,
- consistencia por sistema,
- composición antes que styling manual,
- Semantic-first,
- resistencia a contenido real,
- responsive real.

## Librería base
- Usar Semantic UI React como base principal.
- Preferir componentes nativos antes que `<div>` y CSS manual.
- Minimizar `style` inline y hacks de layout.
- Usar la documentación oficial como fuente principal.
- Si se requiere CSS personalizado, mantenerlo localizado y mínimo.

## Identidad visual
- Color primario: `#00549F`
- Fondo claro
- Contraste suficiente
- Estética moderna, sobria y empresarial
- Todo texto visible debe seguir el idioma definido en `REQUIREMENTS.md`; si no está definido, usar español (México).

## Jerarquía de componentes
- Encabezados: `Header`
- Layout: `Grid`, `Container`, `Segment`
- Formularios: `Form`, `Form.Field`, `Form.Group`
- Estado/feedback: `Message`, `Loader`, `Modal`, `Popup`, `Confirm`
- Navegación: `Menu`, `Sidebar`, `Accordion`, `Icon`

## Layout base
Toda app debe tener una estructura de navegación y contenido consistente.
- Para aplicaciones tipo dashboard o backoffice, preferir header superior + sidebar izquierdo + contenido central.
- Para landing pages, checkout, formularios lineales o flujos de alta conversión, usar el layout que mejor priorice claridad, lectura y avance del usuario.
- El footer es opcional cuando aporte contexto real y no estorbe la conversión o el flujo principal.

## Reglas de layout
- Usar `LayoutComponent` o equivalente cuando ayude a mantener consistencia.
- Resolver responsive con `Grid`.
- Respetar la grilla de 16 columnas cuando se use `Grid` de Semantic UI React.
- Evitar márgenes manuales “a ojo”.
- En desktop, el contenido debe sentirse centrado y contenido.
- En mobile, el contenido debe reorganizarse antes de romperse.

## Menú lateral
- Debe ser claro, elegante y consistente cuando el flujo use navegación lateral.
- Agrupar módulos relacionados con `Accordion` cuando aplique.
- La ruta activa debe reflejarse en el menú.
- El sidebar debe cerrarse correctamente al navegar cuando aplique.
- No debe generar scroll horizontal ni estados ambiguos.

## Formularios
- Todo campo obligatorio debe marcarse claramente.
- Validaciones claras y accionables.
- Formularios largos deben dividirse por bloques lógicos.
- No comprimir campos solo para que “quepan”.
- Labels, ayudas y errores deben soportar contenido largo.
- No depender solo del placeholder como etiqueta.

## Tablas y listas
- Encabezados claros
- Acciones por fila identificables
- Estrategia móvil explícita si la tabla es amplia
- Estados vacíos bien resueltos
- Filtros y búsqueda visibles y reversibles

## Anti-desborde e i18n
- No asumir textos cortos.
- Evitar anchos o altos rígidos para contenido variable.
- Soportar español e inglés sin romper layout.
- Si el proyecto es bilingüe, centralizar los textos por locale y no mezclar literales de ambos idiomas sin necesidad.
- No permitir texto fuera de botones o contenedores.
- No aceptar scroll horizontal global salvo excepción controlada.

## Estados y feedback
- loading visible
- empty state claro
- error state seguro y entendible
- confirmaciones para acciones destructivas
- notificaciones consistentes entre módulos

## Accesibilidad mínima
- contraste suficiente
- targets táctiles razonables
- navegación clara
- no depender solo del color
- jerarquía visual comprensible
- iconos o botones críticos con texto visible o `aria-label` claro

## Criterios de precisión para agentes
- No convertir una preferencia de layout en obligación universal si `REQUIREMENTS.md` describe otro flujo.
- No introducir componentes visuales ajenos a Semantic UI React sin necesidad técnica o requisito explícito.
- No sacrificar legibilidad por “verse premium”.
- Mantener nombres accesibles o selectores estables en controles críticos cuando ayuden a pruebas automatizadas.

## Checklist UX/UI
- layout consistente
- responsive verificado
- menú estable cuando exista
- sin desbordes ni encimados
- formularios claros
- mensajes entendibles
- estados vacíos y de carga definidos
- Semantic UI React usado como primera opción
