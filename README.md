# TanStack Start + Effect RPC — Runnable Example

A minimal, fully runnable example showing how to wire up [TanStack Start](https://tanstack.com/start) with [Effect.ts](https://effect.website) using the Effect RPC pattern.

## Quick Start

```bash
bun install
bun dev
# Open http://localhost:3000
```

## What This Shows

- **Effect RPC contract + live handlers** — type-safe client↔server communication
- **Service + Repository layers** — proper dependency injection via `Effect.Tag` + `Layer`
- **RPC middleware** — request context injection (simplified, no real auth)
- **SSR in-process RPC** — server-side preloads bypass HTTP via `@effect/rpc/RpcTest`
- **TanStack Router** — file-based route with loader
- **React Query integration** — list query + mutation with router invalidation
- **Error handling** — `Schema.TaggedError` for typed domain errors
- **CSRF protection** — `x-requested-with` header check on POST

## Architecture

```
src/
├── server/
│   ├── features/
│   │   ├── app.contract.ts              # Merges all RPC groups
│   │   ├── app.live.ts                  # Assembles all layers
│   │   ├── app-rpc.middleware.ts         # Request context middleware
│   │   ├── auth/models.ts               # UserId branded type
│   │   └── example-todo/
│   │       ├── example-todo.contract.ts  # RPC contract (client-safe)
│   │       ├── example-todo.live.ts      # RPC handlers
│   │       ├── example-todo.service.ts   # Business logic
│   │       ├── example-todo.repository.ts # In-memory data store
│   │       └── example-todo.schemas.ts   # Shared schemas/errors
│   └── rpc/
│       └── in-process.ts                # SSR in-process RPC transport
├── lib/
│   ├── rpc/
│   │   ├── call.ts                      # callRpc() — SSR + client entry point
│   │   ├── runtime.ts                   # HTTP RPC client runtime
│   │   ├── csrf.ts                      # CSRF header constants
│   │   └── schemas.ts                   # NoPayload schema
│   └── url.ts                           # Host origin helper
├── features/example-todo/
│   ├── api.ts                           # Client API (callRpc + queryOptions)
│   └── ui/example-todo-page.tsx         # React component
├── routes/
│   ├── __root.tsx                       # Root layout
│   ├── index.tsx                        # / route (todo list)
│   └── api/rpc/$.ts                     # RPC HTTP endpoint
├── router.tsx                           # Router + React Query setup
└── css/globals.css                      # Tailwind entry
```

## Data Flow

**List (SSR preload → hydrate):**
```
Route loader → queryOptions → callRpc() → [SSR: in-process RPC] → Middleware → Service → Repository
                                          [Client: HTTP POST /api/rpc] ↗
```

**Mutation (client-side):**
```
Form submit → callRpc(createTodo) → HTTP POST /api/rpc → Middleware → Service → Repository → router.invalidate()
```

## Adding a New Feature

1. Create `src/server/features/<name>/<name>.contract.ts` — define RPC methods
2. Create schemas, service, repository, live handler
3. Merge contract into `app.contract.ts`, layer into `app.live.ts`
4. Create `src/features/<name>/api.ts` — `callRpc()` + `queryOptions()`
5. Create UI component, wire into a route

## Based On

Extracted from a production TanStack Start + Effect.ts app. See the [architecture gist](https://gist.github.com/kevin-courbet/4bebb17f5f2509667e6c6a20cbe72812) for the full pattern.

## License

MIT
