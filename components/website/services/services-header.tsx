import { cn } from "@/lib/utils";

export type ServicesHeaderProps = {
  className?: string;
};

/**
 * Centered section intro — eyebrow, serif headline, supporting copy.
 */
export function ServicesHeader({ className }: ServicesHeaderProps) {
  return (
    <header
      className={cn(
        "mx-auto flex max-w-2xl flex-col items-center text-center",
        className
      )}
    >
      <p
        className={cn(
          "inline-flex items-center gap-2",
          "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-teal uppercase",
          "sm:text-xs sm:tracking-[0.2em]"
        )}
      >
        <span
          className="size-1.5 shrink-0 rounded-full bg-brand-teal"
          aria-hidden
        />
        Our Services
      </p>

      <h2
        id="services-heading"
        className={cn(
          "mt-4 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
          "sm:mt-5 sm:text-4xl lg:text-5xl"
        )}
      >
        Complete Dental Care for{" "}
        <span className="text-brand-blue">Every Smile</span>
      </h2>

      <p
        className={cn(
          "mt-4 max-w-2xl text-base leading-relaxed text-brand-muted",
          "sm:mt-5 sm:text-lg"
        )}
      >
        From preventive visits to advanced treatments, every service is
        delivered with clinical precision and a welcoming touch.
      </p>
    </header>
  );
}
