import { PageContainer } from "@/components/layout";
import { APP_DESCRIPTION, APP_NAME } from "@/constants";

/**
 * Public homepage shell. Section components (Hero, About, Services, …)
 * plug in here later — keep this file free of business logic.
 */
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/*
        Future section order (do not implement yet):
        Navbar (layout header slot) → Hero → About → Services → Doctors
        → Testimonials → FAQ → Contact → Footer (layout footer slot)
      */}
      <PageContainer className="flex flex-1 flex-col justify-center public-section-y">
        <div className="flex max-w-2xl flex-col public-stack-gap">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {APP_NAME}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            {APP_DESCRIPTION}
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
