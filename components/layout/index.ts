/**
 * Shared layout shells and public-site chrome.
 * Navbar / Footer live as slot content — not hard-coded here.
 *
 * Client-only: `./public-error` — import directly from that file so Server
 * Components can consume this barrel without crossing the client boundary.
 */

export {
  PageContainer,
  type PageContainerProps,
  type PageContainerSize,
} from "./page-container";
export { PublicShell, type PublicShellProps } from "./public-shell";
export { PublicLoading } from "./public-loading";
export { PublicNotFound } from "./public-not-found";
