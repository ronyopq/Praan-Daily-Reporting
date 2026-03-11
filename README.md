# PRAAN Daily Reporting

Production-minded multi-user workflow platform for PRAAN teams. The app combines monthly work planning, daily activity entry, follow-up reminders, monthly reporting, admin approvals, audit logging, Bangladesh holiday support, and print-ready A4 exports.

This implementation uses a Cloudflare Pages-compatible architecture:

- `Next.js 16` App Router frontend exported statically to `out/`
- `Cloudflare Pages Functions` backend API in `functions/`
- `Cloudflare D1` via Drizzle ORM
- `Cloudflare KV` for reminder/session-adjacent state
- `Tailwind CSS`, `shadcn/ui`, `Zod`, `React Hook Form`, `TanStack Table`, `FullCalendar`

Default seeded password for sample users: `PraanAdmin@2026`

## Quick start

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

## Local Cloudflare-ready workflow

1. Copy local secret template:

```bash
copy .dev.vars.example .dev.vars
```

2. Create Cloudflare resources and update `wrangler.jsonc`:

```bash
npx wrangler d1 create praan-daily-reporting --location apac
npx wrangler kv namespace create APP_KV
npx wrangler kv namespace create APP_KV --preview
```

3. Add Pages secret:

```bash
npx wrangler pages secret put SESSION_SECRET --project-name praan-daily-reporting
```

4. Apply schema and seed:

```bash
npm run db:migrate:local
npm run db:seed:local
```

5. Build and run Pages locally:

```bash
npm run build
npm run cf:dev
```

## Core scripts

- `npm run dev` - Next.js frontend dev server
- `npm run build` - static export to `out/`
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript validation
- `npm run db:generate` - generate Drizzle migration SQL
- `npm run db:migrate:local` - apply D1 migrations locally
- `npm run db:migrate:remote` - apply D1 migrations remotely
- `npm run db:seed:local` - seed local D1
- `npm run db:seed:remote` - seed remote D1
- `npm run cf:dev` - run Cloudflare Pages locally from `out/`
- `npm run cf:deploy` - deploy `out/` to Cloudflare Pages

## Deployment to Cloudflare Pages

### 1. Authenticate

```bash
npx wrangler login
```

### 2. Create the Pages project

```bash
npx wrangler pages project create praan-daily-reporting --production-branch main --compatibility-date 2026-03-12
```

### 3. Create D1 and KV

```bash
npx wrangler d1 create praan-daily-reporting --location apac
npx wrangler kv namespace create APP_KV
npx wrangler kv namespace create APP_KV --preview
```

Update the generated IDs in [`wrangler.jsonc`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/wrangler.jsonc).

### 4. Add secret

```bash
npx wrangler pages secret put SESSION_SECRET --project-name praan-daily-reporting
```

### 5. Apply migrations and seed

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

### 6. Deploy

```bash
npm run build
npx wrangler pages deploy out --project-name praan-daily-reporting --branch main
```

If you want the final production URL to be `https://praan-daily-reporting.pages.dev/`, the Pages project name must remain `praan-daily-reporting`.

## GitHub setup

```bash
git init
git add .
git commit -m "Build PRAAN Daily Reporting platform"
git branch -M main
git remote add origin https://github.com/ronyopq/Praan-Daily-Reporting.git
git push -u origin main
```

## D1 + KV command summary

```bash
npx wrangler d1 create praan-daily-reporting --location apac
npx wrangler kv namespace create APP_KV
npx wrangler kv namespace create APP_KV --preview
npm run db:migrate:remote
npm run db:seed:remote
```

## Seeded sample accounts

- `superadmin@praan.org`
- `admin@praan.org`
- `rahim@praan.org`
- `sadia@praan.org`
- `new.user@praan.org` (pending approval)

Password for all seeded users: `PraanAdmin@2026`

## Key files

- [`docs/architecture.md`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/docs/architecture.md)
- [`wrangler.jsonc`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/wrangler.jsonc)
- [`drizzle/0000_narrow_deadpool.sql`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/drizzle/0000_narrow_deadpool.sql)
- [`seed/001_seed.sql`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/seed/001_seed.sql)
- [`src/db/schema.ts`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/src/db/schema.ts)
- [`functions/api/[[route]].ts`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/functions/api/[[route]].ts)

## Current verification

- `npm run typecheck` passed
- `npm run lint` passed
- `npm run build` passed
