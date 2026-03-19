import { make as makeRpc } from "@effect/rpc/Rpc";
import { make as makeRpcGroup } from "@effect/rpc/RpcGroup";
import { Schema } from "effect";
import { NoPayload } from "@/lib/rpc/schemas";
import {
  CreateExampleTodoPayloadSchema,
  ExampleTodoSchema,
  ExampleTodoValidationError,
} from "@/server/features/example-todo/example-todo.schemas";

export class ExampleTodoRpc extends makeRpcGroup(
  makeRpc("exampleTodo.listTodos", {
    payload: NoPayload,
    success: Schema.Array(ExampleTodoSchema),
    error: Schema.Never,
  }),
  makeRpc("exampleTodo.createTodo", {
    payload: CreateExampleTodoPayloadSchema,
    success: ExampleTodoSchema,
    error: ExampleTodoValidationError,
  }),
) {}
