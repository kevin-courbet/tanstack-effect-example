import { type FromGroup, withHeaders } from "@effect/rpc/RpcClient";
import type { Any as RpcGroupAny } from "@effect/rpc/RpcGroup";
import { makeClient as makeInProcessClient } from "@effect/rpc/RpcTest";
import { Cause, Effect, Exit, ManagedRuntime } from "effect";
import { AppRpcLive, AppRpcServer } from "@/server/features/app.live";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inProcessRpcRuntime = ManagedRuntime.make(AppRpcLive as any);

export const runInProcessRpc = <Group extends RpcGroupAny, A, E, R>(
  _group: Group,
  f: (client: FromGroup<Group>) => Effect.Effect<A, E, R>,
  headers: Record<string, string>,
): Promise<A> => {
  const effect = Effect.gen(function* () {
    const client = yield* makeInProcessClient(AppRpcServer);
    return yield* f(client as unknown as FromGroup<Group>);
  }).pipe(Effect.scoped, withHeaders(headers));

  return inProcessRpcRuntime
    .runPromiseExit(
      effect as Effect.Effect<
        A,
        E,
        ManagedRuntime.ManagedRuntime.Context<typeof inProcessRpcRuntime>
      >,
    )
    .then((exit) => {
      if (Exit.isSuccess(exit)) {
        return exit.value;
      }

      return Promise.reject(Cause.squash(exit.cause));
    });
};
