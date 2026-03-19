import { Context, Effect, Layer, Ref } from "effect";
import type { UserId } from "@/server/features/auth/models";

export type ExampleTodo = {
  readonly id: number;
  readonly userId: UserId;
  readonly text: string;
  readonly createdAt: string;
};

type ExampleTodoState = {
  readonly nextId: number;
  readonly byUser: Readonly<Record<string, readonly ExampleTodo[]>>;
};

type CreateExampleTodoData = {
  readonly text: string;
};

export type ExampleTodoRepository = {
  readonly list: (userId: UserId) => Effect.Effect<readonly ExampleTodo[]>;
  readonly create: (
    userId: UserId,
    data: CreateExampleTodoData,
  ) => Effect.Effect<ExampleTodo>;
};

export const ExampleTodoRepository = Context.GenericTag<ExampleTodoRepository>(
  "@repositories/ExampleTodoRepository",
);

const createSeedTodos = (userId: UserId, nextId: number): readonly ExampleTodo[] => [
  {
    id: nextId,
    userId,
    text: "Read through the feature contract first.",
    createdAt: new Date("2026-01-05T09:00:00.000Z").toISOString(),
  },
  {
    id: nextId + 1,
    userId,
    text: "Keep route loaders and query options in sync.",
    createdAt: new Date("2026-01-05T09:05:00.000Z").toISOString(),
  },
];

const ensureUserTodos = (state: ExampleTodoState, userId: UserId) => {
  const existing = state.byUser[userId];
  if (existing) {
    return { state, todos: existing };
  }

  const seededTodos = createSeedTodos(userId, state.nextId);

  return {
    state: {
      nextId: state.nextId + seededTodos.length,
      byUser: {
        ...state.byUser,
        [userId]: seededTodos,
      },
    },
    todos: seededTodos,
  };
};

export const ExampleTodoRepositoryLive = Layer.effect(
  ExampleTodoRepository,
  Effect.gen(function* () {
    const stateRef = yield* Ref.make<ExampleTodoState>({
      nextId: 1,
      byUser: {},
    });

    const list: ExampleTodoRepository["list"] = (userId) =>
      Ref.modify(stateRef, (state) => {
        const hydrated = ensureUserTodos(state, userId);
        return [hydrated.todos, hydrated.state] as const;
      });

    const create: ExampleTodoRepository["create"] = (userId, data) =>
      Ref.modify(stateRef, (state) => {
        const hydrated = ensureUserTodos(state, userId);
        const createdTodo: ExampleTodo = {
          id: hydrated.state.nextId,
          userId,
          text: data.text,
          createdAt: new Date().toISOString(),
        };

        return [
          createdTodo,
          {
            nextId: hydrated.state.nextId + 1,
            byUser: {
              ...hydrated.state.byUser,
              [userId]: [createdTodo, ...hydrated.todos],
            },
          },
        ] as const;
      });

    return ExampleTodoRepository.of({
      list,
      create,
    });
  }),
);
