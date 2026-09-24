# Flujo de desarrollo

## Preparación

Se recomienda clonar ambos repositorios como directorios hermanos:

```text
reelazo/
├── frontend/
└── backend/
```

Preparar primero el backend con `pnpm install`, `cp .env.example .env.local` y `pnpm setup`. Después instalar e iniciar el frontend. Cada repositorio conserva dependencias, lockfile, historial Git y despliegue propios.

## Cambios coordinados

- Si cambia la base, crear la migración en backend y regenerar los tipos del frontend.
- Mantener compatibles los cambios mientras se despliegan ambos repositorios.
- Desplegar primero migraciones compatibles y backend; después el frontend consumidor.
- No copiar secretos entre repositorios ni versionar `.env.local`.

## Git

- Crear ramas pequeñas desde `main`.
- Usar commits descriptivos y evitar mezclar cambios no relacionados.
- Ejecutar las verificaciones del repositorio antes de abrir un pull request.
- Explicar migraciones, variables nuevas y orden de despliegue en el pull request.

## Definición de terminado

Una funcionalidad está terminada cuando funciona de punta a punta, tiene autorización y errores contemplados, pasa lint/typecheck/build, incluye migraciones y tipos cuando corresponden, y actualiza la documentación si cambia el comportamiento o la arquitectura.
