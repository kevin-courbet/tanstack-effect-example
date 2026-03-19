import { queryOptions } from "@tanstack/react-query";
import { callRpc } from "@/lib/rpc/call";
import { ExampleTodoRpc } from "@/server/features/example-todo/example-todo.contract";
import type { ExampleTodo } from "@/server/features/example-todo/example-todo.service";

export type { ExampleTodo };

export const getExampleTodosFn = async (): Promise<readonly ExampleTodo[]> =>
  callRpc(ExampleTodoRpc, (client) => client.exampleTodo.listTodos({}));

export const createExampleTodoFn = async (input: { text: string }): Promise<ExampleTodo> =>
  callRpc(ExampleTodoRpc, (client) => client.exampleTodo.createTodo(input));

export function exampleTodosQueryOptions() {
  return queryOptions({
    queryKey: ["exampleTodos", "list"],
    queryFn: async () => getExampleTodosFn(),
    staleTime: 1000 * 30,
  });
}
