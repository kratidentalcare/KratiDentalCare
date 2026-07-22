/**
 * Convert a ClinicSettings Google Maps place/directions URL into an iframe embed URL.
 * Returns null when the URL cannot be safely embedded (caller shows a placeholder).
 */
export function toGoogleMapsEmbedUrl(mapsUrl: string | null | undefined): string | null {
  if (!mapsUrl?.trim()) {
    return null;
  }

  const raw = mapsUrl.trim();

  try {
    const url = new URL(raw);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    const host = url.hostname.replace(/^www\./, "");
    const isGoogleMaps =
      host === "google.com" ||
      host === "maps.google.com" ||
      host === "maps.app.goo.gl" ||
      host === "goo.gl";

    if (!isGoogleMaps && !host.endsWith(".google.com")) {
      return null;
    }

    // Already an embed URL.
    if (url.pathname.includes("/embed")) {
      return url.toString();
    }

    const query =
      url.searchParams.get("q") ||
      url.searchParams.get("query") ||
      extractPlaceFromPath(url.pathname);

    if (!query) {
      // Fallback: append output=embed to the original maps URL.
      url.searchParams.set("output", "embed");
      return url.toString();
    }

    const embed = new URL("https://maps.google.com/maps");
    embed.searchParams.set("q", query);
    embed.searchParams.set("z", "15");
    embed.searchParams.set("output", "embed");
    return embed.toString();
  } catch {
    return null;
  }
}

function extractPlaceFromPath(pathname: string): string | null {
  // /maps/place/Some+Place/...
  const match = pathname.match(/\/place\/([^/]+)/);
  if (!match?.[1]) {
    return null;
  }
  try {
    return decodeURIComponent(match[1].replace(/\+/g, " "));
  } catch {
    return match[1];
  }
}
