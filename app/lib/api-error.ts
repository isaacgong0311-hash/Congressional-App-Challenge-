export type PublicApiError = {
  code: string;
  message: string;
  requestId?: string;
  retryable: boolean;
};

export function publicApiError(
  payload: unknown,
  fallback: string,
): PublicApiError {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = payload.error;
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return {
        code:
          "code" in error && typeof error.code === "string"
            ? error.code
            : "INTERNAL_ERROR",
        message: error.message,
        requestId:
          "requestId" in error && typeof error.requestId === "string"
            ? error.requestId
            : undefined,
        retryable: "retryable" in error && error.retryable === true,
      };
    }
    if (typeof error === "string") {
      return {
        code: "INTERNAL_ERROR",
        message: error,
        retryable: true,
      };
    }
  }

  return {
    code: "INTERNAL_ERROR",
    message: fallback,
    retryable: true,
  };
}
