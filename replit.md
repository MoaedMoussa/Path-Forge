# PathForge

A browser-based computer-science learning platform: a procedural dungeon generator and pathfinding AI visualizer, plus an interactive data-structures academy. Includes three generation algorithms, six pathfinding algorithms, live obstacle replanning, shareable levels, and hands-on curriculum labs. Portfolio project for Moaed.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/pathforge run dev` — run the React frontend (port managed by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Wouter (routing), TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (tables: `levels`, `path_runs`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/pathforge/src/engine/` — Pure TypeScript algorithm engine (no React). Generators, pathfinders, state machine
- `artifacts/pathforge/src/components/CanvasRenderer.tsx` — HTML5 Canvas 2D grid renderer
- `artifacts/pathforge/src/hooks/useEngine.ts` — Central React hook bridging engine → UI
- `artifacts/pathforge/src/pages/Home.tsx` — Main editor page
- `artifacts/pathforge/src/pages/Level.tsx` — Shared level view (/level/:slug)
- `artifacts/pathforge/src/pages/Gallery.tsx` — Public gallery (/gallery)
- `artifacts/pathforge/src/pages/Courses.tsx` — Data-structures academy curriculum catalog (/courses)
- `artifacts/pathforge/src/pages/Lesson.tsx` — Interactive individual course lessons (/courses/:id)
- `artifacts/pathforge/src/components/CourseVisualizer.tsx` — Client-side data structure and algorithm simulators
- `artifacts/pathforge/src/data/courseContent.ts` — Curriculum copy, concepts, complexity notes, and interview prompts
- `artifacts/api-server/src/routes/levels.ts` — REST API for save/load/list/delete levels
- `lib/db/src/schema/levels.ts` — DB schema for levels + path_runs tables
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)

## Architecture decisions

- Engine layer (`src/engine/`) is completely isolated from React — pure TypeScript, zero UI imports. This enables unit testing in isolation and is a deliberate architectural showcase.
- Grid data stored as flat `number[]` in PostgreSQL jsonb column; reconstructed client-side on load.
- `ownerToken` pattern instead of full auth — returned once at save time, lets creator delete without login. Intentional scope trade-off.
- All three pathfinders (A*, Dijkstra, BFS) share the same return shape — differ only in priority function.
- Rate limiting on POST /api/levels is in-memory (per process) — sufficient for a portfolio demo.

## Product

- **Main editor** (`/`): Auto-generates a BSP dungeon + runs A* on load. Three generation algorithms (BSP rooms, Cellular Automata caves, Recursive Backtracker maze). Six pathfinding algorithms (A*, Dijkstra, BFS, Bidirectional BFS, Greedy Best-First, DFS) with animated frontier expansion and agent walk. Live obstacle drop + replanning. Save & Share via short URL.
- **Shared level view** (`/level/:slug`): Load any saved level by slug, rendered read-only with optional pathfinding.
- **Gallery** (`/gallery`): Paginated public gallery with stats.
- **Academy** (`/courses`): Seven interactive data-structure and algorithm modules: arrays, linked lists, stacks & queues, searching, sorting, binary search trees, and graphs. Each lesson has a live lab, complexity explanation, mental model, and interview prompt.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Orval generates `zod.int()` for OpenAPI `integer` types, which doesn't exist in Zod v3. Use `number` type in the OpenAPI spec instead.
- `useRef<T>()` in React 19 types requires an initial value argument: use `useRef<T | undefined>(undefined)`.
- `queryKey` is required in TanStack Query v5 `UseQueryOptions` — always pass `getGet*QueryKey(...)` when using the `query:` options object.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
