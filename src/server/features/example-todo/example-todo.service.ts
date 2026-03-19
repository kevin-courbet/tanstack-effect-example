import { Effect, Layer } from "effect";
import type { UserId } from "@/server/features/auth/models";
import {
  ExampleTodoRepository,
  type ExampleTodo,
} from "@/server/features/example-todo/example-todo.repository";
import { ExampleTodoValidationError } from "@/server/features/example-todo/example-todo.schemas";

export { type ExampleTodo } from "@/server/features/example-todo/example-todo.repository";

type ExampleTodoServiceShape = {
  readonly listTodos: (userId: UserId) => Effect.Effect<readonly ExampleTodo[]>;
  readonly createTodo: (
    userId: UserId,
    input: { readonly text: string },
  ) => Effect.Effect<ExampleTodo, ExampleTodoValidationError>;
};

export class ExampleTodoService extends Effect.Tag("@services/ExampleTodoService")<
  ExampleTodoService,
  ExampleTodoServiceShape
>() {}

export const ExampleTodoServiceLive = Effect.gen(function* () {
  const repository = yield* ExampleTodoRepository;

  const listTodos: ExampleTodoServiceShape["listTodos"] = (userId) => repository.list(userId);

  const createTodo: ExampleTodoServiceShape["createTodo"] = (userId, input) =>
    Effect.gen(function* () {
      const text = input.text.trim();

      if (text.length < 3) {
        return yield* new ExampleTodoValidationError({
          message: "Use at least 3 characters so the mutation shows a real validation path.",
        });
      }

      return yield* repository.create(userId, { text });
    });

  return ExampleTodoService.of({
    listTodos,
    createTodo,
  });
});

export const ExampleTodoServiceLiveLayer = Layer.effect(ExampleTodoService, ExampleTodoServiceLive);
