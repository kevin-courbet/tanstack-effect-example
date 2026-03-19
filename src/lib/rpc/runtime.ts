import { layer as fetchHttpClientLayer } from "@effect/platform/FetchHttpClient";
import { mapRequest as mapHttpRequest } from "@effect/platform/HttpClient";
import { setHeader } from "@effect/platform/HttpClientRequest";
import { layerProtocolHttp } from "@effect/rpc/RpcClient";
import { layerNdjson } from "@effect/rpc/RpcSerialization";
import { Effect, Layer, ManagedRuntime } from "effect";
import { RPC_CSRF_HEADER_NAME, RPC_CSRF_HEADER_VALUE } from "@/lib/rpc/csrf";
import { getHostOrigin } from "@/lib/url";

const RPC_PATH = "/api/rpc";

const resolveRpcUrl = (): string => `${getHostOrigin()}${RPC_PATH}`;

export const RpcProtocolLive = Layer.unwrapEffect(
  Effect.sync(() =>
    layerProtocolHttp({
      url: resolveRpcUrl(),
      transformClient: (client) =>
        mapHttpRequest(client, setHeader(RPC_CSRF_HEADER_NAME, RPC_CSRF_HEADER_VALUE)),
    }).pipe(Layer.provide(fetchHttpClientLayer), Layer.provide(layerNdjson)),
  ),
);

export const rpcRuntime = ManagedRuntime.make(RpcProtocolLive);

export type RpcRuntimeContext = ManagedRuntime.ManagedRuntime.Context<typeof rpcRuntime>;

export const runRpcPromise = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  options?: { readonly signal?: AbortSignal },
) => rpcRuntime.runPromise(effect as Effect.Effect<A, E, RpcRuntimeContext>, options);
