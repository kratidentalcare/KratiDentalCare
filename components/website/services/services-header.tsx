import { cn } from "@/lib/utils";

export type ServicesHeaderProps = {
  className?: string;
};

/**
 * Centered section intro — white typography for the navy services canvas.
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
          "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-red uppercase",
          "sm:text-xs sm:tracking-[0.2em]"
        )}
      >
        Our Services
      </p>

      <h2
        id="services-heading"
        className={cn(
          "mt-4 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-white",
          "sm:mt-5 sm:text-4xl lg:text-5xl"
        )}
      >
        Care for every smile
      </h2>

      <div className="mt-5 h-1 w-12 rounded-full bg-brand-red" aria-hidden />
    </header>
  );
}
