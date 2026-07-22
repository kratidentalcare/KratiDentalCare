import { ExternalLink, MapPinned } from "lucide-react";

import { cn } from "@/lib/utils";

export type FooterMapProps = {
  embedUrl?: string | null;
  mapsUrl?: string | null;
  clinicName?: string | null;
  className?: string;
};

/**
 * Compact footer map preview — sits under social icons in the brand column.
 */
export function FooterMap({
  embedUrl = null,
  mapsUrl = null,
  clinicName = null,
  className,
}: FooterMapProps) {
  return (
    <div className={cn("w-full max-w-xs", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-[#0A84C6]/10 bg-white",
          "shadow-[0_4px_16px_color-mix(in_srgb,#0A84C6_8%,transparent)]"
        )}
      >
        {embedUrl ? (
          <div className="relative h-36 w-full sm:h-40">
            <iframe
              title={`Map showing ${clinicName ?? "clinic"} location`}
              src={embedUrl}
              className="absolute inset-0 size-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex h-36 flex-col items-center justify-center gap-2 px-4 text-center sm:h-40">
            <MapPinned
              className="size-5 text-[#0A84C6]"
              strokeWidth={1.75}
              aria-hidden
            />
            <p className="text-xs leading-snug text-[#6B7280]">
              Map link not configured yet.
            </p>
          </div>
        )}
      </div>

      {mapsUrl ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A84C6]",
            "transition-colors hover:text-[#0870A8]",
            "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84C6]/40 focus-visible:ring-offset-2"
          )}
        >
          Open in Google Maps
          <ExternalLink className="size-3" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}
