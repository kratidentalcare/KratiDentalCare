import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Load `.env.local` then `.env` into `process.env` without overriding
 * variables already set in the shell. tsx does not load Next.js env files.
 */
export function loadEnvFiles(cwd: string = process.cwd()): void {
  for (const fileName of [".env.local", ".env"] as const) {
    const filePath = path.join(cwd, fileName);
    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const eq = line.indexOf("=");
      if (eq <= 0) {
        continue;
      }

      const key = line.slice(0, eq).trim();
      if (!key || key in process.env) {
        continue;
      }

      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  }
}
