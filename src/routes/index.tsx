import { createFileRoute } from "@tanstack/react-router";
import { ExampleTodoPage } from "@/features/example-todo/ui/example-todo-page";
import { exampleTodosQueryOptions } from "@/features/example-todo/api";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(exampleTodosQueryOptions()),
  component: ExampleTodoRoute,
});

function ExampleTodoRoute() {
  return <ExampleTodoPage />;
}
