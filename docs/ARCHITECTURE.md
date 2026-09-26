# Arquitectura de Reelazo

## Visión general

Reelazo transforma fotografías y datos comerciales confirmados en reels verticales. El sistema se divide en dos repositorios independientes que se despliegan por separado.

```text
Navegador
   │
   ▼
Frontend Next.js en Vercel
   ├── Supabase Auth
   ├── Supabase PostgreSQL y Realtime
   └── carga y descarga autorizada de Cloudflare R2
             │
             ▼
       trabajos persistidos
             │
             ▼
Backend en VPS
   ├── Redis + BullMQ
   ├── workers Node.js
   ├── Gemini y ElevenLabs
   ├── Remotion, FFmpeg y Sharp
   └── Cloudflare R2
```

## Repositorios

### Frontend

Responsable de navegación, autenticación, onboarding, CRUD, storyboard, seguimiento de progreso, preview y descarga. Utiliza Next.js App Router, TypeScript, Tailwind y shadcn/ui con Base UI. Se despliega en Vercel y no ejecuta renders ni procesos largos.

### Backend

Responsable del esquema PostgreSQL, RLS, migraciones, Redis, colas y workers. Ejecuta generación, polling, procesamiento multimedia y render. Se despliega en un VPS. PostgreSQL es la fuente duradera del workflow; Redis solamente transporta tareas.

## Flujo principal

1. El usuario inicia sesión mediante Supabase Auth.
2. El frontend crea un proyecto y registra las escenas con IDs estables.
3. El navegador sube originales privados a R2 mediante URLs firmadas.
4. El frontend persiste la revisión solicitada en PostgreSQL.
5. El backend encola y ejecuta los pasos idempotentes.
6. Cada resultado parcial queda registrado antes de continuar.
7. Supabase Realtime comunica el progreso al frontend.
8. El usuario previsualiza y descarga el MP4 mediante autorización temporal.

## Límites importantes

- La IA genera guiones, clips y voz; la edición es determinística.
- Nunca se inventan atributos comerciales.
- Cada escena conserva un `sceneId` independiente del orden visual.
- Cambiar un elemento regenera solo sus dependencias.
- Supabase Storage no se utiliza; los archivos viven en R2.
- Las claves privilegiadas nunca llegan al navegador.
- Los presets publicados y las versiones terminadas son inmutables.

## Contrato entre repositorios

Las migraciones del backend son la fuente de verdad del esquema. El comando `pnpm db:types` del backend regenera `frontend/src/types/database.types.ts` cuando ambos repositorios son hermanos. Los cambios incompatibles deben coordinarse para que el backend se despliegue antes que el frontend que los consume.

## Arquitectura del worker actual

```text
Productor
   │ enqueueReelGeneration
   ▼
BullMQ: reel-generation
   │ generate-reel
   ▼
Worker
   ├── valida el contrato con Zod
   ├── ejecuta el pipeline por etapas
   ├── publica progreso en BullMQ
   ├── delega generación a proveedores
   └── informa estado a WorkflowStore
```

Los contratos viven en `src/domain/jobs.ts`, la infraestructura BullMQ en `src/jobs`, el pipeline en `src/workflow` y las integraciones en `src/providers`. Las implementaciones fixture permiten probar la coordinación sin consumir APIs. `WorkflowStore` será implementado con PostgreSQL cuando se agregue la persistencia de jobs.
