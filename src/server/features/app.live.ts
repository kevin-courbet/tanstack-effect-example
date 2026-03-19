import { Layer } from "effect";
import { ExampleTodoRpcLive } from "@/server/features/example-todo/example-todo.live";
import { ExampleTodoServiceLiveLayer } from "@/server/features/example-todo/example-todo.service";
import { ExampleTodoRepositoryLive } from "@/server/features/example-todo/example-todo.repository";
import { AppRpc } from "./app.contract";
import { AppRpcAuthMiddleware, AppRpcAuthMiddlewareLive } from "./app-rpc.middleware";

export const AppRpcServer = AppRpc.middleware(AppRpcAuthMiddleware);

export const AppRpcLive = Layer.mergeAll(
  ExampleTodoRpcLive,
  AppRpcAuthMiddlewareLive,
).pipe(
  Layer.provide(ExampleTodoServiceLiveLayer),
  Layer.provide(ExampleTodoRepositoryLive),
);
