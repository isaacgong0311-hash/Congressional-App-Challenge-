import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function check(environment: string, key: string) {
  return spawnSync(process.execPath, ["scripts/check-production-env.mjs"], {
    env: { ...process.env, VERCEL_ENV: environment, GROQ_API_KEY: key },
    encoding: "utf8",
  });
}

describe("production configuration gate", () => {
  it.each(["", "   "])("blocks production with missing or blank key %j", (key) => {
    expect(check("production", key).status).toBe(1);
  });
  it("accepts a configured key without logging its value", () => {
    const result = check("production", "test-secret-do-not-log");
    expect(result.status).toBe(0);
    expect(result.stdout + result.stderr).not.toContain("test-secret-do-not-log");
  });
  it("allows provider-free local and preview builds", () => {
    expect(check("", "").status).toBe(0);
    expect(check("preview", "").status).toBe(0);
  });
});
