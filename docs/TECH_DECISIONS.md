# Reelazo — Decisiones finales de tecnología y herramientas

Estado: aprobado para iniciar el MVP
Objetivo: mantener un stack pequeño, reproducible y fácil de operar en Windows y macOS

## 1. Resumen ejecutivo

Reelazo se divide en dos repositorios TypeScript independientes: `frontend`, desplegable en Vercel con Next.js, y `backend`, desplegable en el VPS y responsable de Supabase, Redis y los workers. Supabase proporcionará PostgreSQL, autenticación y actualizaciones en tiempo real. Cloudflare R2 almacenará los archivos. Los procesos largos se coordinarán mediante BullMQ y Redis. Remotion compondrá los videos y FFmpeg procesará los medios.

El equipo utilizará un único flujo local basado en Node.js, pnpm y Docker Desktop. Las integraciones de IA estarán simuladas por defecto para que el desarrollo cotidiano no dependa de credenciales ni genere costos.

## 2. Stack definitivo

| Área | Decisión |
|---|---|
| Lenguaje | TypeScript |
| Aplicación web | Next.js App Router + React |
| Hosting web | Vercel |
| Estilos | Tailwind CSS |
| Componentes | shadcn/ui con Base UI |
| Iconos | Lucide React |
| Formularios | React Hook Form |
| Validación | Zod |
| Estado remoto | TanStack Query |
| Ordenamiento | dnd-kit |
| Base de datos | Supabase PostgreSQL |
| Autenticación | Supabase Auth |
| Actualizaciones | Supabase Realtime con refetch de respaldo |
| Archivos | Cloudflare R2 |
| Cliente de archivos | AWS SDK para JavaScript v3, API S3 compatible |
| Backend pesado | Node.js + TypeScript |
| Cola | BullMQ + Redis |
| Composición de video | Remotion |
| Procesamiento multimedia | FFmpeg + ffprobe |
| Procesamiento de imágenes | Sharp |
| Guiones | Gemini con salida estructurada |
| Clips generativos | Gemini Omni Flash, sujeto a prueba de capacidades |
| Voz | ElevenLabs |
| Tests | Vitest + Playwright |
| Logs | Pino |
| Repositorio | Git + pnpm workspaces |
| Workers en producción | VPS con Docker Compose |

## 3. Decisión de UI: shadcn/ui, no Radix UI directo

Toda la interfaz se construirá con componentes instalados desde el registro oficial de shadcn/ui. No se instalarán componentes manualmente desde Radix UI ni se permitirán imports desde:

```text
@radix-ui/*
radix-ui
```

Para cumplir esta decisión, shadcn/ui se inicializará con Base UI como biblioteca de primitivas:

```bash
pnpm dlx shadcn@latest init -d --base base
```

Los componentes se copiarán al repositorio, normalmente en:

```text
frontend/src/components/ui/
```

Los componentes iniciales serán:

```text
AlertDialog
Badge
Breadcrumb
Button
Card
Checkbox
Command
Dialog
DropdownMenu
Input
Label
Pagination
Popover
Progress
RadioGroup
ScrollArea
Select
Separator
Sheet
Sidebar
Skeleton
Slider
Sonner
Switch
Table
Tabs
Textarea
Tooltip
```

No se instalará `--all`: cada componente debe responder a una necesidad concreta del producto.

Los componentes propios —storyboard, preview vertical, escena, estado de job, reproductor y editor de preset— se construirán componiendo estos elementos.

## 4. Decisión de Next.js y Vercel

Se utilizará Next.js App Router con estas reglas:

- Server Components por defecto.
- Client Components solamente para interacción, formularios, drag-and-drop y preview.
- Server Actions para mutaciones breves estrechamente ligadas a la UI.
- Route Handlers para URLs firmadas, webhooks y endpoints consumidos por workers o clientes externos.
- Runtime Node.js por defecto.
- Ningún render o proceso generativo largo dentro de una request de Vercel.
- `next/image` para imágenes mostradas por la aplicación.
- `next/font` para tipografías versionadas y consistentes.

Vercel ejecutará:

- Aplicación Next.js.
- Navegación y render web.
- Autenticación SSR.
- CRUD y validaciones breves.
- Creación y consulta de trabajos.
- Generación de URLs firmadas para R2.
- Webhooks breves e idempotentes.

Vercel no ejecutará:

- Remotion Renderer.
- FFmpeg.
- Generación completa de reels.
- Polling prolongado a proveedores.
- Workers BullMQ.

## 5. Decisión de Supabase

Supabase se utilizará únicamente para:

- PostgreSQL.
- Autenticación.
- Realtime para estados de trabajos.
- Políticas RLS.

Supabase Storage no se utilizará.

La base local se ejecutará con Supabase CLI sobre Docker. El esquema se administrará exclusivamente mediante migraciones versionadas en Git.

Flujo de esquema:

```text
Migración local → db reset → tests → staging → producción
```

Reglas:

- No modificar el esquema productivo manualmente desde el Dashboard.
- Habilitar RLS en todas las tablas expuestas.
- Autorizar por pertenencia a organización, no solo por usuario autenticado.
- No utilizar `user_metadata` para autorización.
- No exponer claves privilegiadas en el navegador.
- Guardar datos de autorización controlados por servidor.
- Probar políticas RLS como parte de la integración.

## 6. Decisión de almacenamiento: Cloudflare R2

R2 será el único almacenamiento de objetos de la aplicación.

Se utilizarán buckets separados:

```text
reelazo-development
reelazo-staging
reelazo-production
```

En desarrollo, cada usuario utilizará un prefijo propio:

```text
dev/<developer>/...
```

Flujo de subida:

1. El navegador solicita autorización a Next.js.
2. Next.js valida sesión, organización, tipo y tamaño esperado.
3. El servidor genera una URL firmada de corta duración.
4. El navegador sube directamente a R2.
5. El backend verifica el objeto y registra sus metadatos en Supabase.

La tabla de assets guardará bucket, object key, hash, tamaño, tipo y metadatos. Nunca utilizará una URL firmada temporal como identidad permanente.

No se utilizará MinIO durante el MVP. Probar directamente contra R2 reduce servicios locales y valida la integración real.

## 7. Decisión de workers y colas

Los trabajos largos se ejecutarán fuera de Next.js.

Componentes:

- Worker Node.js.
- BullMQ.
- Redis.
- FFmpeg y ffprobe.
- Chromium compatible con Remotion.

El worker se distribuirá como una imagen Docker para que macOS, Windows y producción utilicen las mismas versiones de sistema.

Postgres será la fuente duradera del workflow. Redis gestionará ejecución y concurrencia, pero no será la única fuente de verdad.

Se utilizará una outbox transaccional para evitar perder tareas entre la escritura en Supabase y la publicación en BullMQ.

## 8. Decisión de video

Remotion será responsable de:

- Timeline visual.
- Composición de escenas.
- Captions.
- Overlays.
- Branding.
- Zooms y transiciones.
- Render final.

FFmpeg será responsable de:

- Normalización de medios.
- Trim.
- Ajustes de tempo.
- Mezcla y loudness.
- Validación y multiplexado cuando sea necesario.

ffprobe medirá duración, resolución, fps, codecs y pistas. No se estimarán esos datos desde metadatos incompletos de proveedores.

## 9. Decisión de proveedores de IA

Las integraciones estarán detrás de interfaces internas:

```text
ScriptProvider
VideoProvider
VoiceProvider
```

Esto permitirá utilizar fixtures en desarrollo y proveedores reales en staging/producción.

Defaults locales:

```env
SCRIPT_PROVIDER=fixture
VIDEO_PROVIDER=fixture
VOICE_PROVIDER=fixture
```

Los proveedores reales solo se habilitarán explícitamente. Antes de depender de un modelo, se hará una prueba pequeña de acceso, referencias, duración, polling, cancelación y costos.

## 10. Entorno local definitivo

Cada developer instalará únicamente:

1. Git.
2. Node.js LTS.
3. Docker Desktop.
4. Un editor de código.

Docker Desktop será el estándar tanto para Windows como para macOS. En Windows utilizará WSL2.

No se instalarán manualmente:

- PostgreSQL.
- Redis.
- FFmpeg.
- Chromium.
- Supabase CLI global.
- pnpm global.
- MinIO.

Supabase CLI será una dependencia de desarrollo del repositorio. pnpm se administrará con Corepack y su versión quedará fijada en `package.json`.

## 11. Flujo local definitivo

Primera ejecución:

```bash
git clone <repositorio>
cd reelazo
corepack enable
pnpm install
cp .env.example .env.local
pnpm setup
```

Uso cotidiano:

```bash
pnpm dev
```

Detener servicios:

```bash
pnpm dev:stop
```

Reconstruir la base local:

```bash
pnpm db:reset
```

Los scripts encapsularán Supabase CLI y Docker Compose. El developer no necesitará recordar comandos internos para trabajar normalmente.

## 12. Entornos y despliegue

### Local

- Next.js en la máquina.
- Supabase local en Docker.
- Redis y worker en Docker.
- R2 de desarrollo.
- Proveedores de IA fixture.

### Staging

- Vercel Preview o proyecto de staging.
- Supabase staging.
- R2 staging.
- VPS/worker staging.
- Proveedores reales con límites controlados.

### Producción

- Vercel producción.
- Supabase producción.
- R2 producción.
- VPS con Redis persistente y workers Docker.
- Secretos y credenciales independientes.

## 13. Dependencias que no se incorporarán

No se utilizarán durante el MVP:

- Prisma.
- NestJS.
- Turborepo.
- Kubernetes.
- MinIO.
- n8n.
- LangChain.
- Radix UI directo.
- Un segundo framework backend.
- Supabase Storage.

Estas exclusiones reducen duplicación, configuración y puntos de fallo.

## 14. Política de versiones y seguridad

- Fijar versiones y guardar `pnpm-lock.yaml`.
- Mantener todos los paquetes de Remotion en la misma versión compatible.
- Mantener credenciales únicamente en servidor.
- No registrar claves, muestras de voz o URLs firmadas completas.
- Utilizar buckets y proyectos separados por entorno.
- Probar migraciones desde cero antes de promoverlas.
- Ejecutar lint, typecheck y tests en CI.
- Verificar aislamiento por organización antes del despliegue.

## 15. Decisiones pendientes antes de integrar proveedores reales

Las siguientes decisiones requieren pruebas técnicas, no nuevas tecnologías:

- Confirmar el identificador y capacidades vigentes del modelo de video.
- Confirmar si el proveedor acepta referencias simultáneas de propiedad y presentador.
- Medir costo y duración real de clips.
- Definir límites de imágenes y regeneraciones por formato.
- Seleccionar pistas musicales con licencias adecuadas.
- Confirmar requisitos de autorización para imagen y voz clonada.
