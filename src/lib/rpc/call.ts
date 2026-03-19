import { type FromGroup, make as makeRpcClient, withHeaders } from "@effect/rpc/RpcClient";
import type { Any as RpcGroupAny } from "@effect/rpc/RpcGroup";
import { Effect } from "effect";
import { RPC_CSRF_HEADER } from "@/lib/rpc/csrf";
import { rpcRuntime, runRpcPromise } from "@/lib/rpc/runtime";

type GetRequestHeaders = () => Headers;
type RunInProcessRpc = <Group extends RpcGroupAny, A, E, R>(
  group: Group,
  f: (client: FromGroup<Group>) => Effect.Effect<A, E, R>,
  headers: Record<string, string>,
) => Promise<A>;

let getRequestHeaders: GetRequestHeaders | undefined;
let runInProcessRpc: RunInProcessRpc | undefined;
let runInProcessRpcLoadError: unknown;

if (import.meta.env.SSR) {
  try {
    const mod = await import("@tanstack/react-start/server");
    getRequestHeaders = mod.getRequestHeaders;
  } catch {
    // Server helper can be unavailable in non-Start contexts (tests/scripts).
  }

  try {
    const mod = await import("@/server/rpc/in-process");
    runInProcessRpc = mod.runInProcessRpc;
  } catch (error) {
    runInProcessRpcLoadError = error;
  }
}

const getSSRHeaders = (): Record<string, string> | undefined => {
  if (!getRequestHeaders) return undefined;

  try {
    const headers = getRequestHeaders();
    return Object.fromEntries(headers.entries());
  } catch (error) {
    rpcRuntime.runFork(
      Effect.logWarning("Failed to read SSR request headers for RPC call").pipe(
        Effect.annotateLogs({
          error: error instanceof Error ? error.message : String(error),
        }),
      ),
    );
    return undefined;
  }
};

const makeTypedRpcClient = <Group extends RpcGroupAny>(
  group: Group,
): Effect.Effect<FromGroup<Group>, never, never> =>
  makeRpcClient(
    group as unknown as Parameters<typeof makeRpcClient>[0],
  ) as unknown as Effect.Effect<FromGroup<Group>, never, never>;

export const callRpc = <Group extends RpcGroupAny, A, E, R>(
  group: Group,
  f: (client: FromGroup<Group>) => Effect.Effect<A, E, R>,
) => {
  if (import.meta.env.SSR) {
    const ssrHeaders = getSSRHeaders();
    if (ssrHeaders) {
      if (!runInProcessRpc) {
        let message = "unknown import error";
        if (runInProcessRpcLoadError instanceof Error) {
          message = runInProcessRpcLoadError.message;
        } else if (runInProcessRpcLoadError) {
          message = String(runInProcessRpcLoadError);
        }

        return Promise.reject(new Error(`Failed to load SSR in-process RPC transport: ${message}`));
      }

      return runInProcessRpc(group, f, {
        ...ssrHeaders,
        ...RPC_CSRF_HEADER,
      });
    }
  }

  const effect = Effect.gen(function* () {
    const client = yield* makeTypedRpcClient(group);
    return yield* f(client);
  }).pipe(Effect.scoped);

  return runRpcPromise(effect.pipe(withHeaders(RPC_CSRF_HEADER)));
};
