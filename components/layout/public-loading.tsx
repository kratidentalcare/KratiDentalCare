import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Route-level loading UI for the public website segment.
 * Matches PublicPageHero height so client navigations keep the page chrome.
 */
export function PublicLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading page"
      className={cn(
        "relative isolate overflow-hidden bg-brand-dark font-montserrat",
        "h-[calc(100svh-4.75rem)] min-h-[22rem]",
        "sm:h-[calc(100svh-5.25rem)] sm:min-h-[26rem]",
        "lg:h-[calc(100svh-6rem)] lg:min-h-[28rem]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-gradient-to-r from-brand-dark via-brand-dark/80 to-brand-navy/40",
        )}
        aria-hidden
      />
      <PageContainer
        size="xl"
        className={cn(
          "relative z-10 flex h-full flex-col justify-center",
          "public-section-y md:py-10 lg:py-12",
        )}
      >
        <div className="flex max-w-xl flex-col items-start">
          <Skeleton className="h-3 w-24 rounded-full bg-white/15" />
          <Skeleton className="mt-5 h-3 w-20 rounded-full bg-white/20 sm:mt-6" />
          <Skeleton className="mt-3 h-10 w-64 rounded-lg bg-white/20 sm:mt-4 sm:h-12 lg:h-14" />
          <Skeleton className="mt-2 h-10 w-52 rounded-lg bg-white/15 sm:h-12 lg:h-14" />
          <Skeleton className="mt-4 h-4 w-full max-w-md rounded-md bg-white/12 sm:mt-5" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-sm rounded-md bg-white/10" />
          <Skeleton className="mt-7 h-12 w-44 rounded-full bg-white/20 sm:mt-8" />
        </div>
        <span className="sr-only">Loading page</span>
      </PageContainer>
    </section>
  );
}
