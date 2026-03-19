import { Effect, Either, Layer } from "effect";
import { ExampleTodoRepositoryLive } from "@/server/features/example-todo/example-todo.repository";
import {
  ExampleTodoService,
  ExampleTodoServiceLiveLayer,
} from "@/server/features/example-todo/example-todo.service";
import { ExampleTodoValidationError } from "@/server/features/example-todo/example-todo.schemas";

const ExampleTodoTestLayer = ExampleTodoServiceLiveLayer.pipe(
  Layer.provide(ExampleTodoRepositoryLive),
);

const testUserId = "user_example" as never;

const runWithExampleTodoService = <A, E>(effect: Effect.Effect<A, E, ExampleTodoService>) =>
  Effect.runPromise(effect.pipe(Effect.provide(ExampleTodoTestLayer)));

describe("ExampleTodoService", () => {
  it("lists seeded todos and prepends newly created ones", async () => {
    const result = await runWithExampleTodoService(
      Effect.gen(function* () {
        const service = yield* ExampleTodoService;
        const initialTodos = yield* service.listTodos(testUserId);
        const createdTodo = yield* service.createTodo(testUserId, {
          text: "Ship the bare-bones example.",
        });
        const updatedTodos = yield* service.listTodos(testUserId);

        return {
          initialTodos,
          createdTodo,
          updatedTodos,
        };
      }),
    );

    expect(result.initialTodos).toHaveLength(2);
    expect(result.createdTodo.text).toBe("Ship the bare-bones example.");
    expect(result.updatedTodos[0]?.text).toBe("Ship the bare-bones example.");
    expect(result.updatedTodos).toHaveLength(3);
  });

  it("rejects too-short todo text with a tagged validation error", async () => {
    const result = await runWithExampleTodoService(
      Effect.gen(function* () {
        const service = yield* ExampleTodoService;
        return yield* service.createTodo(testUserId, { text: " a " });
      }).pipe(Effect.either),
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(ExampleTodoValidationError);
      expect(result.left.message).toMatch(/at least 3 characters/i);
    }
  });
});
