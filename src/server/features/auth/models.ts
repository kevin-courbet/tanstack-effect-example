import { Schema } from "effect";

export const UserId = Schema.String.pipe(Schema.nonEmptyString(), Schema.brand("UserId"));
export type UserId = Schema.Schema.Type<typeof UserId>;
