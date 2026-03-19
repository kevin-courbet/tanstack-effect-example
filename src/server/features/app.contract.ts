import { make as makeRpcGroup } from "@effect/rpc/RpcGroup";
import { ExampleTodoRpc } from "@/server/features/example-todo/example-todo.contract";

export const AppRpc = makeRpcGroup().merge(ExampleTodoRpc);
