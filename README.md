# Reelazo Backend

Backend e infraestructura de Reelazo. Contiene Supabase PostgreSQL/Auth, migraciones, Redis, BullMQ y el worker Node.js para procesos pesados.

## Desarrollo

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm setup
pnpm dev
```

`pnpm setup` inicia Supabase y Redis. Si `../frontend` existe, también genera sus variables públicas locales.

## Base de datos

```bash
pnpm db:reset
pnpm db:types
pnpm db:advisors
```

Las migraciones viven en `supabase/migrations`. `pnpm db:types` actualiza los tipos del frontend hermano.

## Despliegue

El worker y Redis se desplegarán en el VPS. Las migraciones se aplicarán al proyecto Supabase correspondiente antes de desplegar una versión que dependa de ellas.
