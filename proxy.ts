import { NextRequest, NextResponse } from "next/server";

import { enforceRateLimit } from "./app/lib/rate-limit";

function clientIdentifier(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/api/") || pathname === "/api/health") {
    return NextResponse.next();
  }

  let result;
  try {
    result = await enforceRateLimit({
      pathname,
      identifier: clientIdentifier(request),
    });
  } catch {
    return NextResponse.json(
      { error: "Request protection is temporarily unavailable." },
      { status: 503 },
    );
  }

  if (result.status === "unavailable") {
    return NextResponse.json(
      { error: "Request protection is temporarily unavailable." },
      { status: 503 },
    );
  }
  if (result.status === "limited") {
    return NextResponse.json(
      {
        error: "Too many requests — please wait and try again.",
        code: "rate_limited",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfterSeconds),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      },
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(result.reset));
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
