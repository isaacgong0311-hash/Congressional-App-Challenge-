import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const baseUrlFlag = args.indexOf("--base-url");
const baseUrl = args[baseUrlFlag + 1];

if (baseUrlFlag < 0 || !baseUrl || args.length !== 2) {
  console.error("Usage: npm run smoke -- --base-url https://your-public-deployment.example");
  process.exit(2);
}

let parsed: URL;
try {
  parsed = new URL(baseUrl);
} catch {
  console.error("The smoke test needs an absolute URL.");
  process.exit(2);
}

if (!(["https:", "http:"].includes(parsed.protocol))) {
  console.error("The smoke test needs an HTTP(S) URL.");
  process.exit(2);
}

const playwright = new URL("../node_modules/@playwright/test/cli.js", import.meta.url);
const child = spawn(process.execPath, [fileURLToPath(playwright), "test", "--config", "playwright.smoke.config.ts"], {
  stdio: "inherit",
  env: { ...process.env, LANTERN_SMOKE_BASE_URL: parsed.origin },
});

child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
