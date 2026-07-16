import { Hero } from "@/components/website/hero";
import { Services } from "@/components/website/services";

/**
 * Public homepage shell. Section components (About, Services, …)
 * plug in below Hero later — keep this file free of business logic.
 */
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/*
        Section order:
        Navbar (layout) → Hero → Services → Doctors
        → Testimonials → FAQ → Contact → Footer (layout)
      */}
      <Hero />
      <Services />
    </div>
  );
}
