// Явные поля без parameter properties и enum (erasableSyntaxOnly).

export class ApiError extends Error {
  readonly kind = "api" as const;
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string> | undefined;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export class NetworkError extends Error {
  readonly kind = "network" as const;

  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ResponseShapeError extends Error {
  readonly kind = "malformed" as const;
  readonly status: number | undefined;

  constructor(reason: string, status?: number) {
    super(reason);
    this.name = "ResponseShapeError";
    this.status = status;
  }
}

export type ClientError = ApiError | NetworkError | ResponseShapeError;

export function isApiError(error: unknown, code?: string): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}
