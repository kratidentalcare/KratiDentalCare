import { ExternalLink, MapPinned } from "lucide-react";

import { PageContainer } from "@/components/layout";
import type { PublicContactInfo } from "@/features/contact/types";
import { cn } from "@/lib/utils";

import { CONTACT_PAGE } from "./contact-page-data";

export type ContactMapSectionProps = {
  contact: PublicContactInfo | null;
  className?: string;
};

/**
 * Google Maps embed from Clinic Settings URL, with graceful fallback.
 */
export function ContactMapSection({
  contact,
  className,
}: ContactMapSectionProps) {
  const embedUrl = contact?.mapsEmbedUrl ?? null;
  const mapsUrl = contact?.googleMapsUrl ?? null;
  const address = contact?.address ?? null;

  return (
    <section
      id="clinic-map"
      aria-labelledby="clinic-map-heading"
      className={cn(
        "relative overflow-hidden font-montserrat",
        "bg-brand-surface",
        className
      )}
    >
      <PageContainer size="xl" className="relative public-section-y">
        <header className="mx-auto mb-8 flex max-w-2xl flex-col items-center text-center sm:mb-10">
          <p
            className={cn(
              "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-teal uppercase",
              "sm:text-xs sm:tracking-[0.2em]"
            )}
          >
            {CONTACT_PAGE.mapEyebrow}
          </p>
          <h2
            id="clinic-map-heading"
            className={cn(
              "mt-4 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
              "sm:mt-5 sm:text-4xl"
            )}
          >
            {CONTACT_PAGE.mapHeading}
          </h2>
          <div className="mt-4 h-1 w-12 rounded-full bg-brand-blue" aria-hidden />
          {address ? (
            <p className="mt-5 text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
              {address}
            </p>
          ) : null}
        </header>

        <div
          className={cn(
            "overflow-hidden rounded-3xl border border-brand-blue/10 bg-white",
            "shadow-[0_12px_40px_color-mix(in_srgb,var(--brand-blue)_8%,transparent)]"
          )}
        >
          {embedUrl ? (
            <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
              <iframe
                title={`Map showing ${contact?.clinicName ?? "clinic"} location`}
                src={embedUrl}
                className="absolute inset-0 size-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          ) : (
            <div
              className={cn(
                "flex min-h-[16rem] flex-col items-center justify-center gap-4 px-6 py-14 text-center",
                "sm:min-h-[20rem]"
              )}
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-brand-blue/10">
                <MapPinned
                  className="size-7 text-brand-blue"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </span>
              <p className="max-w-md text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
                {CONTACT_PAGE.mapPlaceholder}
              </p>
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-brand-blue/30",
                    "bg-white px-5 py-2.5 text-sm font-semibold text-brand-blue",
                    "transition-colors hover:border-brand-blue/50 hover:bg-brand-blue/[0.04]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
                  )}
                >
                  Open in Google Maps
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              ) : null}
            </div>
          )}
        </div>

        {embedUrl && mapsUrl ? (
          <div className="mt-5 flex justify-center">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 text-sm font-semibold text-brand-blue",
                "transition-colors hover:text-brand-hover",
                "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
              )}
            >
              Open in Google Maps
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        ) : null}
      </PageContainer>
    </section>
  );
}
