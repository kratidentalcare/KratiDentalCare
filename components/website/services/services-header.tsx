import { cn } from "@/lib/utils";

export type ServicesHeaderProps = {
  className?: string;
};

/**
 * Centered section intro — white typography for the brand-blue canvas.
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
          "text-[0.6875rem] font-medium tracking-[0.18em] text-white/85 uppercase",
          "sm:text-xs sm:tracking-[0.2em]"
        )}
      >
        <span
          className="size-1.5 shrink-0 rounded-full bg-white"
          aria-hidden
        />
        Our Services
      </p>

      <h2
        id="services-heading"
        className={cn(
          "mt-4 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-white",
          "sm:mt-5 sm:text-4xl lg:text-5xl"
        )}
      >
        Complete Dental Care for{" "}
        <span className="text-white">Every Smile</span>
      </h2>
    </header>
  );
}
