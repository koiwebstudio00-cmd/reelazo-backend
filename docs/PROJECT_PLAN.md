# Reelazo — Plan de desarrollo

Estado: fases 0 y base funcional de fase 1 completadas
Alcance: MVP web de generación de reels
Método: entregas verticales verificables

## 1. Objetivo

Construir una aplicación web que permita a inmobiliarias, concesionarias y negocios gastronómicos transformar fotografías y datos confirmados en reels verticales listos para descargar.

El MVP debe cubrir cuatro formatos:

1. Inmobiliaria con presentador, narración, subtítulos y CTA.
2. Concesionaria narrada con subtítulos y CTA.
3. Concesionaria viral sin voz.
4. Gastronomía visual sin voz.

La IA se utilizará para guiones, voz y clips. La edición, sincronización, branding y composición serán determinísticos mediante código y presets versionados.

## 2. Principios de implementación

- Cada escena tendrá un `sceneId` estable e independiente de su posición.
- Las relaciones entre foto, clip, voz y captions nunca dependerán del índice de un array.
- Los datos de una organización estarán aislados con Row Level Security.
- Los archivos se almacenarán en Cloudflare R2; Supabase conservará sus metadatos.
- Los procesos pesados se ejecutarán en workers, nunca dentro de una request larga de Next.js.
- Cada modificación regenerará únicamente los resultados afectados.
- Las APIs generativas estarán reemplazadas por fixtures durante el desarrollo cotidiano.
- Los presets publicados y las versiones terminadas serán inmutables.
- El código de interfaz utilizará componentes instalados desde shadcn/ui.
- No se instalarán ni importarán componentes directamente desde Radix UI.

## 3. Fase 0 — Bootstrap y experiencia local

### Entregables

- Dos repositorios independientes con pnpm.
- `frontend` con Next.js App Router y TypeScript.
- `backend` con Node.js y TypeScript.
- Paquetes compartidos `domain`, `providers`, `edit-engine` y `video`.
- Supabase CLI configurada para desarrollo local.
- Redis y worker configurados con Docker Compose.
- Variables de entorno documentadas en `.env.example`.
- Scripts únicos para preparar, iniciar y detener el entorno.
- CI inicial con lint, typecheck y tests.

### shadcn/ui

Inicializar shadcn/ui sobre Base UI:

```bash
pnpm dlx shadcn@latest init -d --base base
```

Instalar únicamente los componentes requeridos por el MVP:

```bash
pnpm dlx shadcn@latest add button card input textarea label select checkbox radio-group switch tabs dialog alert-dialog sheet dropdown-menu tooltip popover command table badge progress skeleton separator scroll-area slider sonner breadcrumb sidebar pagination
```

Los componentes quedan copiados dentro del repositorio y pueden personalizarse. Las pantallas del producto compondrán estos componentes; no se agregará una segunda librería visual.

### Criterios de aceptación

- Un developer puede clonar el repositorio y levantarlo con `pnpm setup` y `pnpm dev`.
- El mismo flujo funciona en Windows y macOS con Docker Desktop.
- `pnpm db:reset` reconstruye la base local desde migraciones y seeds.
- La aplicación muestra una pantalla base construida con componentes shadcn/ui.
- No existen imports desde `@radix-ui/*` ni desde `radix-ui`.

## 4. Fase 1 — Autenticación, organizaciones y base del producto

Estado: autenticación, onboarding, RLS base y layout autenticado implementados. Pendiente completar pruebas automatizadas de aislamiento y enriquecer el inicio con datos de reels.

### Entregables

- Registro, login, logout y recuperación de contraseña con Supabase Auth.
- Sesiones SSR compatibles con Next.js App Router.
- Organizaciones y membresías.
- Roles `business_owner` y `platform_admin`.
- Brand kit con nombre, logo, colores y contacto.
- RLS y pruebas de aislamiento entre organizaciones.
- Layout autenticado, sidebar y navegación responsive.
- Inicio con borradores, trabajos en curso y reels recientes.

### Criterios de aceptación

- Un usuario solo puede leer y modificar datos de su organización.
- Un usuario no puede consultar registros de otra organización manipulando IDs.
- Las claves privilegiadas nunca llegan al navegador.
- Las tablas expuestas tienen RLS y políticas explícitas.

## 5. Fase 2 — Proyectos, carga de archivos y storyboard

### Entregables

- Creación de proyectos por rubro.
- Creación de reels y versiones en estado borrador.
- Subida directa del navegador a Cloudflare R2 mediante URLs firmadas.
- Registro de assets y metadatos en Supabase.
- Validación de tipo, tamaño, resolución y hash.
- Miniaturas y normalización mediante Sharp.
- Storyboard con escenas estables, etiquetas, detalles y orden.
- Reordenamiento con drag-and-drop y alternativa mediante teclado.
- Selección de introducción, narración, textos y CTA según formato.
- Guardado automático de borradores.

### Criterios de aceptación

- Reordenar escenas no cambia sus IDs.
- Reemplazar una foto no afecta escenas no relacionadas.
- Los archivos son privados y se descargan mediante autorización temporal.
- La base no guarda URLs firmadas como identidad de un asset.

## 6. Fase 3 — Motor determinístico de edición

Esta fase se completa antes de integrar APIs generativas pagas.

### Entregables

- Esquema Zod del manifiesto de edición.
- Fixtures de clips, voces y alineaciones.
- Composiciones Remotion para los cuatro formatos.
- Introducción, escenas de contenido y CTA.
- Zooms, transiciones, overlays y branding.
- Subtítulos sincronizados por palabra.
- Música, ducking y mezcla con FFmpeg.
- Preview con Remotion Player.
- Render en worker y validación con ffprobe.
- Portada extraída del reel.

### Criterios de aceptación

- Un fixture completo genera un MP4 vertical reproducible.
- Los reels narrados incluyen captions en todos los fragmentos hablados.
- Las transiciones no desplazan la voz hacia otra escena.
- Cambiar branding o captions vuelve a renderizar sin regenerar clips ni voces.

## 7. Fase 4 — Cola y trabajos recuperables

### Entregables

- BullMQ y Redis.
- Tablas de trabajos, pasos e intentos.
- Outbox transaccional en Postgres.
- Dispatcher de eventos hacia BullMQ.
- Idempotencia por revisión y por paso.
- Reintentos con espera creciente.
- Cancelación y recuperación tras reinicios.
- Reconciliador de trabajos estancados.
- Progreso por etapas y escenas completadas.

### Criterios de aceptación

- Una solicitud duplicada no crea dos trabajos para la misma revisión.
- Reiniciar el worker permite continuar desde resultados persistidos.
- Un fallo de una escena no elimina resultados ya generados.
- Cerrar el navegador no interrumpe el procesamiento.

## 8. Fase 5 — Integraciones generativas

### Entregables

- Adaptador de guion con salida estructurada.
- Validación factual y correspondencia por `sceneId`.
- Adaptador de generación de clips.
- Adaptador de ElevenLabs para voz y timestamps.
- Catálogo de voces y presentadores.
- Referencias para identidad del presentador.
- Regeneración por escena.
- Cálculo de duración y ajuste controlado de tempo.
- Registro de consumo técnico por proveedor y paso.

### Criterios de aceptación

- Ningún proveedor puede insertar una escena inexistente.
- El guion solo utiliza hechos ingresados por el usuario.
- Los formatos sin voz no llaman al generador de guion ni a ElevenLabs.
- Una frase modificada invalida su voz, captions, mezcla y render, no el clip visual.
- Una respuesta tardía no sobrescribe una revisión posterior.

## 9. Fase 6 — Presets y administración

### Entregables

- CRUD de presets en borrador.
- Versiones publicadas inmutables.
- Editor de prompts y variables permitidas.
- Preview de prompts con datos de ejemplo.
- Prueba de una escena con estimación de costo.
- Configuración de captions, transiciones, filtros, música y CTA.
- Catálogo de identidades, voces, música y proveedores.
- Panel de trabajos, errores, tiempos y consumos.
- Auditoría de cambios administrativos.

### Criterios de aceptación

- Publicar un preset nuevo no cambia reels existentes.
- Los campos administrativos no ejecutan JavaScript.
- Solo administradores de plataforma acceden al módulo.
- Es posible previsualizar una edición con assets existentes sin consumir IA.

## 10. Fase 7 — Biblioteca, versiones y experiencia final

### Entregables

- Biblioteca con filtros y búsqueda.
- Detalle del reel y reproducción del MP4.
- Historial de versiones.
- Duplicación de reels.
- Descarga autorizada de reel y portada.
- Reintento de componentes fallidos.
- Archivo lógico de reels.
- Estados vacíos, skeletons y errores accionables.
- Revisión responsive y accesible.

### Criterios de aceptación

- El usuario puede retomar un borrador desde otro navegador.
- Una versión conserva sus assets y presets exactos.
- Un reel no aparece como completo si falta un asset obligatorio.
- Drag-and-drop tiene una alternativa accesible mediante teclado.

## 11. Fase 8 — Staging y producción

### Entregables

- Proyecto Supabase de staging.
- Bucket R2 de staging.
- Deploy de Next.js en Vercel.
- VPS con Redis y workers en Docker.
- Migraciones automáticas y controladas.
- Monitoreo básico de workers, disco y trabajos estancados.
- Backups y políticas de retención.
- Pruebas end-to-end sobre staging.
- Proyecto Supabase, bucket R2 y secretos independientes para producción.

### Criterios de aceptación

- Las mismas migraciones pasan por local, staging y producción.
- Ningún secreto productivo existe en repositorios o máquinas de desarrollo.
- Se completa al menos un reel real de cada formato en staging.
- Los archivos finales cumplen dimensiones, fps, codecs y audio configurados.

## 12. Estrategia de pruebas

### Unitarias

- Esquemas Zod.
- Reglas de formatos.
- Invalidation graph de regeneraciones.
- Cálculo de frames y transiciones.
- Transformación de timestamps.
- Construcción de prompts.

### Integración

- RLS y membresías.
- Migraciones desde cero.
- Outbox, cola e idempotencia.
- Adaptadores de R2 y proveedores.
- Recuperación de jobs.

### End-to-end

- Registro y onboarding.
- Creación y guardado de un storyboard.
- Generación con fixtures.
- Seguimiento de progreso.
- Preview y descarga.
- Regeneración de una sola escena.

### Evaluación humana

- Fidelidad visual de clips.
- Naturalidad de voz.
- Calidad de captions.
- Ritmo del reel.
- Coherencia entre escena y narración.

## 13. Fuera del MVP

- Publicación directa en redes.
- Calendario de publicaciones.
- Suscripciones y cobros.
- Métricas sociales.
- Aplicación móvil nativa.
- Lip-sync.
- Editor libre de timeline.
- Música generada con IA.
- Render 4K por defecto.
- Integraciones CRM.

## 14. Definición de terminado

Una fase está terminada cuando:

1. Su flujo funciona de extremo a extremo.
2. Las pruebas relevantes pasan.
3. Los estados de error y recuperación están cubiertos.
4. La documentación y variables de entorno están actualizadas.
5. No se muestran datos, costos o capacidades ficticias como reales.
6. Las dependencias externas pendientes están identificadas explícitamente.
