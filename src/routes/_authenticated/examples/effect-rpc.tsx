import { createFileRoute } from "@tanstack/react-router";
import type { UserId } from "@/features/auth/api";
import { ExampleTodoPage } from "@/features/example-todo/ui/example-todo-page";
import { exampleTodosQueryOptions } from "@/features/example-todo/api";
import { createSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/examples/effect-rpc")({
  head: () =>
    createSeoHead({
      title: "Effect RPC Example",
      canonicalPath: "/examples/effect-rpc",
    }),
  loader: ({ context }) => {
    const userId = context.user.id as UserId;
    return context.queryClient.ensureQueryData(exampleTodosQueryOptions(userId));
  },
  component: ExampleTodoRoute,
});

function ExampleTodoRoute() {
  const { user } = Route.useRouteContext();
  return <ExampleTodoPage userId={user.id as UserId} />;
}
