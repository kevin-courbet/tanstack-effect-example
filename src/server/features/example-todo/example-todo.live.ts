import { Effect } from "effect";
import { AuthenticatedRequestContext } from "@/server/features/app-rpc.middleware";
import { ExampleTodoRpc } from "@/server/features/example-todo/example-todo.contract";
import { ExampleTodoService } from "@/server/features/example-todo/example-todo.service";

export const ExampleTodoRpcLive = ExampleTodoRpc.toLayer(
  Effect.gen(function* () {
    const exampleTodoService = yield* ExampleTodoService;

    return ExampleTodoRpc.of({
      "exampleTodo.listTodos": () =>
        Effect.gen(function* () {
          const { userId } = yield* AuthenticatedRequestContext;
          return yield* exampleTodoService.listTodos(userId);
        }),

      "exampleTodo.createTodo": ({ text }) =>
        Effect.gen(function* () {
          const { userId } = yield* AuthenticatedRequestContext;
          return yield* exampleTodoService.createTodo(userId, { text });
        }),
    });
  }),
);
