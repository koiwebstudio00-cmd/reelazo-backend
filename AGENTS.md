# AGENTS.md — Reelazo Backend

- Este repositorio contiene Supabase, Redis, BullMQ y workers; no contiene el frontend.
- Todo cambio de esquema debe estar en `supabase/migrations` y todas las tablas expuestas deben tener RLS.
- Cloudflare R2 almacena archivos; no usar Supabase Storage.
- Los trabajos pesados se ejecutan en workers, con PostgreSQL como fuente duradera del estado.
- Los pasos deben ser idempotentes y usar fixtures por defecto en desarrollo.
- Ejecutar `pnpm typecheck`, `pnpm build`, `pnpm db:reset`, `pnpm db:types` y `pnpm db:advisors` según corresponda.
