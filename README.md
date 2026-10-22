# Hustlers Hive

Built by students. For students. Run by students.

A student-driven technology community based in Nashik, Maharashtra — organizing tech meetups, hackathons, workshops, casual hangouts, and open-source collaborations.

## Monorepo structure

| Path | Description |
|---|---|
| `apps/web` | Public community website (Next.js) |
| `apps/admin` | Organizer dashboard (Next.js) |
| `packages/ui` | Shared UI components |
| `packages/shared` | Common types, utilities, Supabase client, and database types |
| `packages/typescript-config` | Shared TypeScript presets |
| `supabase/` | Database migrations, config, and seed data |

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 11
- Supabase CLI (installed as devDependency, v2.121.0)
- Docker (optional, for local Supabase)

## Getting started

```bash
pnpm install
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local
pnpm dev
```

This starts both applications concurrently:

- Public website: http://localhost:3000
- Admin panel: http://localhost:3001

## Environment setup

Copy `.env.example` to `.env.local` and configure:

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser + server | Supabase publishable (anon) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service-role key — never expose to browser |
| `NEXT_PUBLIC_SITE_URL` | Browser | Public website URL |
| `NEXT_PUBLIC_ADMIN_URL` | Browser | Admin dashboard URL |

Get keys from: Supabase Dashboard → Project Settings → API

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Production build for all apps and packages |
| `pnpm lint` | Lint all apps and packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm format` | Format code |
| `pnpm clean` | Remove build artifacts |

## Tech stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Auth**: `@supabase/ssr` with cookie-based server clients

## Database schema (Phase 1)

### Tables

| Table | Purpose |
|---|---|
| `admin_users` | Authorized organizers and roles (super_admin, admin, editor) |
| `events` | Community events with status workflow (draft → published → completed) |
| `event_images` | Gallery images per event |
| `projects` | Community and member projects |
| `gallery_images` | Community photo gallery (optionally linked to events) |
| `site_settings` | Editable website content (single-row validated JSONB) |

### Row Level Security

All tables have RLS enabled with policies enforcing:

- **Public visitors**: can only read published/completed content
- **Editors**: can create and update content
- **Admins**: can delete content and manage most resources
- **Super admins**: full access including organizer management

Authorization is checked via `public.is_admin(role)` — a `SECURITY DEFINER` function that queries `admin_users` directly, avoiding recursive RLS.

### Storage

Bucket `community-media` (public reads, organizer-only writes):

- `events/{event-id}/{filename}` — event covers and gallery
- `projects/{project-id}/{filename}` — project covers
- `gallery/{filename}` — community gallery
- 10 MB file size limit
- Allowed: JPEG, PNG, WebP, GIF, SVG

## Supabase workflows

### Apply migrations (hosted project)

```bash
npx supabase db push
```

### Apply migrations (local Docker)

```bash
npx supabase start
npx supabase db reset
```

### Generate TypeScript types

```bash
# From remote project:
npx supabase gen types typescript --project-id <project-id> > packages/shared/src/database.types.ts

# From local instance:
npx supabase gen types typescript --local > packages/shared/src/database.types.ts
```

### Provision the first admin

After signing up through Supabase Auth:

```sql
INSERT INTO public.admin_users (user_id, role)
VALUES ('<your-auth-user-uuid>', 'super_admin');
```

This must be done via the Supabase SQL editor or a direct database connection. There is no public admin registration.

### Create the storage bucket

The bucket is created by migration `20261023000700_create_storage_bucket.sql`. If applying manually:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('community-media', 'community-media', TRUE, 10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']);
```

## Security assumptions

- Service-role key is never exposed to browser code
- All authorization checks use the `admin_users` table (not user metadata)
- RLS is enabled on every application table
- Storage policies verify organizer roles before allowing uploads
- The `is_admin()` helper uses `SECURITY DEFINER` with `SET search_path = ''`
- Editors cannot promote themselves to admin or super_admin
- Public users cannot access drafts or perform mutations

## Phases

- **Phase 0** — Monorepo foundation ✓
- **Phase 1** — Supabase backend foundation ✓
- **Phase 2** — Admin dashboard and content management
- **Phase 3+** — Public website, community features
