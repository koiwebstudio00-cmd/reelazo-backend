# AGENTS.md — Reelazo Backend

## Producto y contexto

Reelazo convierte fotografías y datos comerciales confirmados en reels verticales para inmobiliarias, concesionarias y gastronomía. Leer `README.md` y los documentos de `docs/` antes de realizar cambios importantes.

La IA genera guiones, clips y voz; la composición, sincronización, branding y render son determinísticos. No inventar atributos comerciales. Cada escena utiliza un `sceneId` estable y una modificación regenera únicamente los resultados afectados.

## Alcance de este repositorio

Este repositorio contiene Supabase, migraciones, Redis, BullMQ, workers e infraestructura para el VPS. La UI Next.js pertenece al repositorio frontend hermano.

## Base de datos y seguridad

- Crear cambios mediante `pnpm exec supabase migration new <nombre>`.
- Habilitar RLS en toda tabla expuesta y autorizar por organización o propietario.
- Para `UPDATE`, definir `USING` y `WITH CHECK`.
- No usar `user_metadata` para autorización.
- Mantener funciones `SECURITY DEFINER` fuera de esquemas expuestos, fijar `search_path`, revocar ejecución pública y comprobar identidad.
- Ejecutar `pnpm db:reset`, `pnpm db:types` y `pnpm db:advisors` tras cambios de esquema.

## Workers y archivos

- PostgreSQL es la fuente duradera del workflow; Redis no es la única fuente de verdad.
- Hacer pasos idempotentes, persistir resultados parciales y reintentar solo errores transitorios.
- Usar fixtures por defecto y adaptadores para proveedores reales.
- Guardar archivos en Cloudflare R2, nunca en Supabase Storage.
- Persistir bucket, object key, hash, tamaño y MIME; nunca una URL firmada como identidad.
- Invocar FFmpeg con argumentos separados, sin concatenar entrada del usuario.

## Verificación

Ejecutar `pnpm typecheck` y `pnpm build`. Si cambia la base, ejecutar además las verificaciones Supabase. Para video, comprobar el archivo con ffprobe y evaluación visual. Actualizar documentación cuando cambien arquitectura, setup o comportamiento.
