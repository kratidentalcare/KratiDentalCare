/**
 * Must be loaded with `tsx --import` before any `@/models` or `@/lib/db` imports.
 * Redirects Next.js `server-only` / `client-only` guards to a no-op shim.
 */
import Module from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const shimPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "shims",
  "empty.js",
);

const moduleWithResolve = Module as typeof Module & {
  _resolveFilename: (
    request: string,
    parent: NodeModule | undefined,
    isMain: boolean,
    options?: unknown,
  ) => string;
};

const originalResolve = moduleWithResolve._resolveFilename;

moduleWithResolve._resolveFilename = function resolveWithShim(
  request: string,
  parent: NodeModule | undefined,
  isMain: boolean,
  options?: unknown,
): string {
  if (request === "server-only" || request === "client-only") {
    return shimPath;
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
