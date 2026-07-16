import { PageContainer } from "@/components/layout";
import { cn } from "@/lib/utils";

import { WhyChooseUsContent } from "./why-choose-us-content";
import { WhyChooseUsImage } from "./why-choose-us-image";

export type WhyChooseUsProps = {
  className?: string;
};

/**
 * Homepage “Why Choose Us” — image + value props, vertically centered on desktop.
 */
export function WhyChooseUs({ className }: WhyChooseUsProps) {
  return (
    <section
      id="why-choose-us"
      aria-labelledby="why-choose-us-heading"
      className={cn(
        "relative overflow-hidden bg-brand-surface font-montserrat",
        className
      )}
    >
      <PageContainer size="xl" className="relative public-section-y">
        <div
          className={cn(
            "grid grid-cols-1 items-center gap-12",
            "md:gap-14",
            "lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-16 xl:gap-20"
          )}
        >
          <WhyChooseUsImage className="pb-4 lg:pb-0" />
          <WhyChooseUsContent />
        </div>
      </PageContainer>
    </section>
  );
}
