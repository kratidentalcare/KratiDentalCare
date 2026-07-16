import { Doctors } from "@/components/website/doctors";
import { Faq } from "@/components/website/faq";
import { Hero } from "@/components/website/hero";
import { Services } from "@/components/website/services";
import { Testimonials } from "@/components/website/testimonials";
import { WhyChooseUs } from "@/components/website/why-choose-us";

/**
 * Public homepage shell. Section components (About, Services, …)
 * plug in below Hero later — keep this file free of business logic.
 */
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/*
        Section order:
        Navbar (layout) → Hero → Services → Why Choose Us → Doctors
        → Testimonials → FAQ → Contact → Footer (layout)
      */}
      <Hero />
      <WhyChooseUs />
      <Services />
      <Doctors />
      <Testimonials />
      <Faq />
    </div>
  );
}
