# Hustlers Hive

Built by students. For students. Run by students.

A student-driven technology community based in Nashik, Maharashtra — organizing tech meetups, hackathons, workshops, casual hangouts, and open-source collaborations.

## Monorepo structure

| Path | Description |
|---|---|
| `apps/web` | Public community website (Next.js) |
| `apps/admin` | Organizer dashboard (Next.js) |
| `packages/ui` | Shared UI components |
| `packages/shared` | Common types and utilities |
| `packages/typescript-config` | Shared TypeScript presets |
| `supabase/` | Database migrations (Phase 1) |

## Prerequisites

- Node.js ≥ 20
- pnpm ≥ 11

## Getting started

```bash
pnpm install
pnpm dev
```

This starts both applications concurrently:

- Public website: http://localhost:3000
- Admin panel: http://localhost:3001

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
- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (Phase 1)

## Phases

- **Phase 0** — Monorepo foundation (current)
- **Phase 1** — Supabase configuration, database schema, authentication
- **Phase 2+** — Events, content management, community features
# hustler-hive-
