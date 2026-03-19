# TanStack Start + Effect RPC — Bare-Bones Example

A minimal but production-ish example showing how to wire up [TanStack Start](https://tanstack.com/start) with [Effect.ts](https://effect.website) using the Effect RPC pattern.

## What This Shows

- **Effect RPC contract + live handlers** — type-safe client↔server communication
- **Service + Repository layers** — proper dependency injection via `Effect.Tag` + `Layer`
- **TanStack Router** — file-based route with loader
- **React Query integration** — list query + mutation with optimistic invalidation
- **Error handling** — `Schema.TaggedError` for typed domain errors

## Architecture

```
src/
├── server/features/example-todo/
│   ├── example-todo.contract.ts    # RPC contract (client-safe)
│   ├── example-todo.live.ts        # RPC handlers
│   ├── example-todo.service.ts     # Business logic (Effect Tag + Layer)
│   ├── example-todo.repository.ts  # Data access (in-memory for demo)
│   ├── example-todo.schemas.ts     # Shared schemas/errors
│   └── example-todo.service.spec.ts
├── features/example-todo/
│   ├── api.ts                      # Client API (callRpc + queryOptions)
│   └── ui/example-todo-page.tsx    # React component
└── routes/_authenticated/examples/
    └── effect-rpc.tsx              # TanStack Router route
```

## Flow

**List Query:**
```
Route loader → queryOptions → callRpc(ExampleTodoRpc) → RPC middleware (auth) → Service → Repository
```

**Mutation:**
```
Form submit → callRpc(ExampleTodoRpc, client.createTodo) → RPC middleware → Service.create → Repository → router.invalidate()
```

## Integration Points

To wire this into your app, you need to:

1. Merge `ExampleTodoRpc` into your `AppRpc` group (`app.contract.ts`)
2. Merge `ExampleTodoRpcLive` into your `AppRpcLive` layer (`app.live.ts`)
3. Provide `ExampleTodoRepository` in your runtime (`runtime.ts`)
4. Add query keys to your centralized key factory (`query-keys.ts`)

## Based On

This example is extracted from a production TanStack Start + Effect.ts app. See the [architecture gist](https://gist.github.com/kevin-courbet/4bebb17f5f2509667e6c6a20cbe72812) for the full pattern.

## License

MIT
