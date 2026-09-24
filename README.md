# Reelazo Backend

Backend, base de datos e infraestructura de Reelazo, una plataforma SaaS que transforma fotografías y datos comerciales confirmados en reels verticales listos para descargar y publicar.

El MVP está dirigido a inmobiliarias, concesionarias y negocios gastronómicos. Este repositorio mantiene el estado seguro del producto y ejecuta fuera de Vercel todos los procesos pesados de generación y edición.

## Responsabilidad de este repositorio

- Esquema PostgreSQL, migraciones, triggers y RLS de Supabase.
- Redis y BullMQ para distribución de tareas.
- Workers Node.js idempotentes y recuperables.
- Integraciones con Cloudflare R2, Gemini y ElevenLabs.
- Composición con Remotion y procesamiento con FFmpeg, ffprobe y Sharp.
- Registro duradero del workflow y sus resultados parciales.
- Infraestructura Docker del worker y Redis para el VPS.

La navegación, UI y requests breves pertenecen al repositorio frontend desplegado en Vercel.

## Stack

- Node.js y TypeScript.
- Supabase PostgreSQL, Auth y Realtime.
- BullMQ y Redis.
- Cloudflare R2.
- Remotion, FFmpeg, ffprobe y Sharp.
- Gemini y ElevenLabs detrás de adaptadores.
- Docker Compose y VPS para producción.
- pnpm para dependencias.

Supabase Storage no se utiliza. PostgreSQL conserva metadatos estables y R2 almacena los archivos.

## Estado actual

Implementado: Supabase local, esquema inicial de perfiles/organizaciones/membresías/brand kits, RLS, triggers de onboarding, Redis y worker base conectado a BullMQ.

Siguiente entrega: pruebas RLS automatizadas, proyectos/reels/versiones/escenas/assets, URLs firmadas de R2 y primer workflow persistido.

## Desarrollo local

La disposición recomendada es:

```text
reelazo/
├── frontend/
└── backend/
```

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm setup
pnpm dev
```

`pnpm setup` comprueba Docker Desktop, inicia Supabase y Redis y configura el `.env.local` del frontend hermano cuando existe.

## Comandos

| Comando | Función |
|---|---|
| `pnpm setup` | Prepara Supabase, Redis y el frontend local |
| `pnpm dev` | Inicia el worker en modo desarrollo |
| `pnpm build` | Compila el worker |
| `pnpm typecheck` | Verifica TypeScript |
| `pnpm services:start` | Inicia Redis |
| `pnpm services:stop` | Detiene Supabase y Redis |
| `pnpm db:start` | Inicia Supabase local |
| `pnpm db:reset` | Reconstruye la base desde migraciones |
| `pnpm db:types` | Regenera los tipos en el frontend hermano |
| `pnpm db:advisors` | Ejecuta asesores de Supabase |

## Variables

Consultar `.env.example`. Los proveedores permanecen en modo `fixture` durante el desarrollo cotidiano. No se versionan `.env.local`, claves privilegiadas, credenciales R2 ni URLs firmadas.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Plan completo](docs/PROJECT_PLAN.md)
- [Decisiones técnicas](docs/TECH_DECISIONS.md)
- [Flujo de desarrollo](docs/DEVELOPMENT_WORKFLOW.md)
- [Reglas para colaboradores y agentes](AGENTS.md)

## Despliegue

Los workers y Redis se despliegan en el VPS. Las migraciones pasan por local, staging y producción. Los cambios incompatibles deben coordinarse para desplegar primero la base/backend compatible y después el frontend consumidor.
