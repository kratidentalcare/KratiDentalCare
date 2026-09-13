const DEFAULT_LOCAL_APP_URL = "http://localhost:3000";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

/**
 * Public origin used in outbound emails (logo, website, action links).
 * Prefers EMAIL_APP_URL so local NEXT_PUBLIC_APP_URL can stay on localhost.
 */
export function resolveEmailAppBaseUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const candidates = [env.EMAIL_APP_URL, env.NEXT_PUBLIC_APP_URL];
  for (const raw of candidates) {
    const base = raw?.trim();
    if (base) {
      return stripTrailingSlash(base);
    }
  }
  return DEFAULT_LOCAL_APP_URL;
}

export function toAbsoluteEmailUrl(pathOrUrl: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${stripTrailingSlash(baseUrl)}${path}`;
}
