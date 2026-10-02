import { z } from "zod";

export const ApiErrorCodeSchema = z.enum([
  "INVALID_REQUEST",
  "UNSUPPORTED_MEDIA",
  "PAYLOAD_TOO_LARGE",
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_TIMEOUT",
  "PROVIDER_REJECTED",
  "INVALID_PROVIDER_RESPONSE",
  "INTERNAL_ERROR",
]);

export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const noStoreHeaders = { "Cache-Control": "no-store" } as const;

export function requestIdFrom(headers: Headers) {
  const value = headers.get("x-request-id")?.trim() ?? "";
  return /^[a-zA-Z0-9-]{1,120}$/.test(value)
    ? value
    : crypto.randomUUID();
}

export function apiError(input: {
  code: ApiErrorCode;
  message: string;
  requestId: string;
  retryable: boolean;
  status: number;
}) {
  return Response.json(
    {
      error: {
        code: input.code,
        message: input.message,
        requestId: input.requestId,
        retryable: input.retryable,
      },
    },
    { status: input.status, headers: noStoreHeaders },
  );
}

export function apiJson<T>(value: T, status = 200) {
  return Response.json(value, { status, headers: noStoreHeaders });
}

export async function readBoundedJson<T>(
  request: Request,
  schema: z.ZodType<T>,
  maxBytes: number,
): Promise<
  | { ok: true; data: T }
  | {
      ok: false;
      reason: "invalid_json" | "payload_too_large" | "invalid_body";
    }
> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    return { ok: false, reason: "payload_too_large" };
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  const parsed = schema.safeParse(value);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, reason: "invalid_body" };
}
