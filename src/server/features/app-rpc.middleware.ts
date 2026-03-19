import { type Headers as RpcHeaders } from "@effect/platform/Headers";
import { Tag as RpcMiddlewareTag } from "@effect/rpc/RpcMiddleware";
import { Context, Effect, Layer, Schema } from "effect";
import type { UserId } from "@/server/features/auth/models";

export type AppRpcRequestContext = {
  readonly requestId: string;
  readonly userId: UserId;
  readonly headers: RpcHeaders;
};

export class AuthenticatedRequestContext extends Context.Tag(
  "@/server/features/AuthenticatedRequestContext",
)<AuthenticatedRequestContext, AppRpcRequestContext>() {}

export class RpcUnauthorizedError extends Schema.TaggedError<RpcUnauthorizedError>()(
  "RpcUnauthorizedError",
  { message: Schema.String },
) {}

export class AppRpcAuthMiddleware extends RpcMiddlewareTag<AppRpcAuthMiddleware>()(
  "@/server/features/AppRpcAuthMiddleware",
  {
    provides: AuthenticatedRequestContext,
    failure: RpcUnauthorizedError,
    wrap: true,
  },
) {}

const DEMO_USER_ID = "demo-user-001" as UserId;

export const AppRpcAuthMiddlewareLive = Layer.succeed(
  AppRpcAuthMiddleware,
  AppRpcAuthMiddleware.of(({ headers, next }) => {
    const requestId = crypto.randomUUID();

    return next.pipe(
      Effect.provideService(AuthenticatedRequestContext, {
        requestId,
        userId: DEMO_USER_ID,
        headers,
      }),
    );
  }),
);
