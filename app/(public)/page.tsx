import { Doctors } from "@/components/website/doctors";
import { Faq } from "@/components/website/faq";
import { Hero } from "@/components/website/hero";
import { Services } from "@/components/website/services";
import { Testimonials } from "@/components/website/testimonials";
import { WhyChooseUs } from "@/components/website/why-choose-us";
import { listActiveFaqs } from "@/features/faqs/services/list-active-faqs";

/**
 * Public homepage shell. Section components (About, Services, …)
 * plug in below Hero later — keep this file free of business logic.
 */
export default async function HomePage() {
  const faqs = await listActiveFaqs();

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
      <Faq items={faqs ?? []} />
    </div>
  );
}
