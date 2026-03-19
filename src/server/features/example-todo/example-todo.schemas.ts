import { Schema } from "effect";
import { UserId } from "@/server/features/auth/models";

export const ExampleTodoSchema = Schema.Struct({
  id: Schema.Number,
  userId: UserId,
  text: Schema.String,
  createdAt: Schema.String,
});

export const CreateExampleTodoPayloadSchema = Schema.Struct({
  text: Schema.String,
});

export class ExampleTodoValidationError extends Schema.TaggedError<ExampleTodoValidationError>()(
  "ExampleTodoValidationError",
  {
    message: Schema.String,
  },
) {}
