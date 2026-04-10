# ytLink — Requisitos

## Propósito
Aplicación web ejecutada en la máquina del usuario para descargar contenido de YouTube (video o playlist) con flujo: pegar enlace → elegir formato/calidad → descargar, con feedback de progreso y soporte para varias descargas en paralelo.

## Alcance funcional
- Entrada de URL de YouTube (video, `youtu.be`, playlist).
- Selección de formato: un solo archivo con video+audio (por defecto), máxima calidad MP4 (fusiona pistas con **FFmpeg**), o solo audio MP3.
- Opción de forzar solo el video enlazado (`--no-playlist`) o permitir comportamiento estándar de yt-dlp para listas.
- Cola visual de descargas con progreso en tiempo real.
- Archivos guardados en carpeta local configurable (por defecto subcarpeta dentro de “Descargas” del usuario).

## Restricción técnica explícita
El navegador no puede realizar la descarga directamente por políticas de seguridad y CORS. El backend local (Node.js + Koa) invoca **yt-dlp** instalado en el sistema del usuario. No se requiere base de datos.

## Stack (alineado a `docs/`)
- Front: React, Semantic UI React.
- Back: Node.js LTS, Koa, Joi, `@koa/router` (equivalente operativo a un router Koa documentado en el estándar de API del repo).
- Sin ORM ni MySQL en este proyecto.

## UX / identidad visual
- Interfaz minimalista, tema oscuro con acentos modernos y animaciones sutiles.
- Texto de UI en español (México) salvo identificadores técnicos.
- Los componentes visibles deben priorizar Semantic UI React; el tema futurista se aplica mediante capa de estilos (variables CSS) sin sustituir el sistema de componentes.

## Seguridad y privacidad
- Solo se aceptan URLs de dominios YouTube permitidos.
- La ruta de salida se resuelve dentro del directorio base configurado (no rutas arbitrarias del cliente).
- Sin registro de URLs completas en logs por defecto en nivel `info` (solo trazas mínimas con `trace_id`).

## Dependencia externa del usuario
- Debe tener **yt-dlp** instalado y accesible en `PATH`, o configurar `YT_DLP_PATH` en `.env`.
- Para el preset de máxima calidad MP4 (video HD + audio por separado), hace falta **FFmpeg** en `PATH` o `FFMPEG_PATH` en `.env`; sin FFmpeg, la opción “un solo archivo” (`best`) evita archivos duplicados.

## Definition of Done (producto)
- Arranque local con un comando documentado en `package.json`.
- Descarga real verificable en disco con al menos un video de prueba y progreso visible en UI.
