import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useId, useState } from "react";
import type { UserId } from "@/features/auth/api";
import {
  createExampleTodoFn,
  exampleTodosQueryOptions,
} from "@/features/example-todo/api";

type ExampleTodoPageProps = {
  readonly userId: UserId;
};

function getMutationErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string") {
      return message;
    }
  }

  return "Something went wrong while creating the todo.";
}

export function ExampleTodoPage({ userId }: ExampleTodoPageProps) {
  const router = useRouter();
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const { data: todos } = useSuspenseQuery(exampleTodosQueryOptions(userId));

  const createTodo = useMutation({
    mutationFn: createExampleTodoFn,
    onSuccess: async () => {
      setDraft("");
      await router.invalidate();
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="space-y-3">
          <p className="font-medium text-cyan-300 text-sm uppercase tracking-[0.2em]">
            Bare-bones example
          </p>
          <div className="space-y-2">
            <h1 className="font-semibold text-3xl">TanStack Start + Effect RPC demo</h1>
            <p className="max-w-2xl text-slate-300">
              One loader-backed list query, one mutation, feature-local query options, and an
              Effect service behind the RPC boundary. The in-memory repository resets on restart so
              the example stays isolated.
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              createTodo.mutate({ text: draft });
            }}
          >
            <label className="sr-only" htmlFor={inputId}>
              Add a todo
            </label>
            <input
              className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-cyan-400"
              id={inputId}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add one more thing to the demo"
              value={draft}
            />
            <button
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              disabled={createTodo.isPending}
              type="submit"
            >
              {createTodo.isPending ? "Adding..." : "Create todo"}
            </button>
          </form>

          {createTodo.error ? (
            <p className="mt-3 text-rose-300 text-sm">{getMutationErrorMessage(createTodo.error)}</p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-medium text-lg">Todos returned by the query</h2>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 text-xs">
              {todos.length} item{todos.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-3">
            {todos.map((todo) => (
              <article
                className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-4"
                key={todo.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm leading-6">{todo.text}</p>
                  <span className="shrink-0 text-slate-500 text-xs">#{todo.id}</span>
                </div>
                <p className="mt-2 text-slate-500 text-xs">
                  {new Date(todo.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
