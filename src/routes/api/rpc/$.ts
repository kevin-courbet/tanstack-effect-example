import { toWebHandler } from "@effect/platform/HttpLayerRouter";
import { layerNdjson } from "@effect/rpc/RpcSerialization";
import { layerHttpRouter } from "@effect/rpc/RpcServer";
import { createFileRoute } from "@tanstack/react-router";
import { Effect, Layer } from "effect";
import { hasRpcCsrfHeader } from "@/lib/rpc/csrf";
import { AppRpcLive, AppRpcServer } from "@/server/features/app.live";

const AppRpcHttpRouterLive = layerHttpRouter({
  group: AppRpcServer,
  path: "/api/rpc",
  protocol: "http",
  disableFatalDefects: true,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}).pipe(Layer.provide(AppRpcLive), Layer.provide(layerNdjson)) as any as Layer.Layer<never>;

const memoMap = Effect.runSync(Layer.makeMemoMap);

const { handler: appRpcHandler } = toWebHandler(AppRpcHttpRouterLive, {
  memoMap,
});

const rejectCsrfRequest = () => new Response("Forbidden", { status: 403 });

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => appRpcHandler(request),
      POST: ({ request }: { request: Request }) =>
        hasRpcCsrfHeader(request) ? appRpcHandler(request) : rejectCsrfRequest(),
      OPTIONS: ({ request }: { request: Request }) => appRpcHandler(request),
    },
  },
});
