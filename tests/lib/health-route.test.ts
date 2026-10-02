import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "../../app/api/health/route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("health route", () => {
  it("reports product capabilities without exposing configuration keys", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    vi.stubEnv("ELEVENLABS_API_KEY", "");
    vi.stubEnv("PERPLEXITY_API_KEY", "");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "");
    vi.stubEnv("npm_package_version", "");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toEqual({
      status: "ok",
      version: "development",
      capabilities: {
        judgeDemo: true,
        liveDocumentReading: false,
        serverSpeech: false,
        localHelpSearch: false,
      },
    });
    expect(JSON.stringify(body)).not.toMatch(/keys|API_KEY|groq|elevenlabs|perplexity/i);
  });

  it("reports enabled product features and a bounded release version", async () => {
    vi.stubEnv("GROQ_API_KEY", "configured");
    vi.stubEnv("ELEVENLABS_API_KEY", "configured");
    vi.stubEnv("PERPLEXITY_API_KEY", "configured");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "abc123def456");

    const response = await GET();

    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      version: "abc123def456",
      capabilities: {
        judgeDemo: true,
        liveDocumentReading: true,
        serverSpeech: true,
        localHelpSearch: true,
      },
    });
  });
});
