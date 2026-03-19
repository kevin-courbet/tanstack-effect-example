export const RPC_CSRF_HEADER_NAME = "x-requested-with";
export const RPC_CSRF_HEADER_VALUE = "XMLHttpRequest";

export const RPC_CSRF_HEADER = {
  [RPC_CSRF_HEADER_NAME]: RPC_CSRF_HEADER_VALUE,
} as const;

export const hasRpcCsrfHeader = (request: Request): boolean =>
  request.headers.get(RPC_CSRF_HEADER_NAME) === RPC_CSRF_HEADER_VALUE;
