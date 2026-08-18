import { PageContainer } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Slim placeholders while FAQ / CTA / directory stream behind Suspense.
 */

export function FaqSectionSkeleton({ className }: { className?: string }) {
  return (
    <section
      aria-busy="true"
      aria-label="Loading frequently asked questions"
      className={cn("bg-white font-montserrat", className)}
    >
      <PageContainer size="xl" className="public-section-y">
        <div className="mx-auto mb-8 flex max-w-xl flex-col items-center text-center sm:mb-10">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="mt-4 h-9 w-64 rounded-lg sm:h-10" />
          <Skeleton className="mt-3 h-4 w-full max-w-sm rounded-md" />
        </div>
        <div className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export function FinalCtaSkeleton({ className }: { className?: string }) {
  return (
    <section
      aria-busy="true"
      aria-label="Loading"
      className={cn(
        "bg-[linear-gradient(160deg,#12244a_0%,#1a3266_45%,#2957a4_100%)]",
        "font-montserrat",
        className,
      )}
    >
      <PageContainer size="xl" className="public-section-y">
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          <Skeleton className="h-10 w-72 rounded-lg bg-white/20 sm:h-12" />
          <Skeleton className="mt-4 h-4 w-full max-w-md rounded-md bg-white/15" />
          <Skeleton className="mt-8 h-12 w-44 rounded-full bg-white/20 sm:mt-10" />
        </div>
      </PageContainer>
    </section>
  );
}

export function DoctorsDirectorySkeleton({ className }: { className?: string }) {
  return (
    <section
      aria-busy="true"
      aria-label="Loading doctor profiles"
      className={cn("bg-brand-surface font-montserrat", className)}
    >
      <PageContainer size="xl" className="public-section-y">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-14">
          <Skeleton className="size-[12.5rem] rounded-full sm:size-[15.5rem] lg:size-[18rem]" />
          <div className="flex w-full max-w-xl flex-col items-center lg:items-start">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="mt-3 h-9 w-56 rounded-lg sm:h-10" />
            <Skeleton className="mt-5 h-8 w-40 rounded-full" />
            <Skeleton className="mt-4 h-4 w-full max-w-md rounded-md" />
            <Skeleton className="mt-2 h-4 w-2/3 rounded-md" />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

export function ContactDetailsSkeleton({ className }: { className?: string }) {
  return (
    <section
      aria-busy="true"
      aria-label="Loading contact details"
      className={cn("bg-white font-montserrat", className)}
    >
      <PageContainer size="xl" className="public-section-y">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full rounded-3xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-48 w-full rounded-3xl sm:mt-10" />
      </PageContainer>
    </section>
  );
}

export function ContactMapSkeleton({ className }: { className?: string }) {
  return (
    <section
      aria-busy="true"
      aria-label="Loading clinic map"
      className={cn("bg-brand-surface font-montserrat", className)}
    >
      <PageContainer size="xl" className="public-section-y">
        <div className="mx-auto mb-8 flex max-w-xl flex-col items-center sm:mb-10">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="mt-4 h-9 w-52 rounded-lg" />
        </div>
        <Skeleton className="aspect-[16/10] w-full rounded-3xl sm:aspect-[21/9]" />
      </PageContainer>
    </section>
  );
}

export function BookingWorkspaceSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading booking form"
      className={cn(
        "mx-auto grid max-w-5xl grid-cols-1 gap-5",
        "lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]",
        className,
      )}
    >
      <Skeleton className="min-h-80 rounded-3xl" />
      <Skeleton className="min-h-80 rounded-3xl" />
    </div>
  );
}
