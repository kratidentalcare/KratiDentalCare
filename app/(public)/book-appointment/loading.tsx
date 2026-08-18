import { PageContainer } from "@/components/layout";
import { BookingWorkspaceSkeleton } from "@/components/website/public-section-skeletons";

export default function BookAppointmentLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading booking form"
      className="bg-brand-surface font-montserrat"
    >
      <PageContainer size="xl" className="public-section-y">
        <BookingWorkspaceSkeleton />
      </PageContainer>
    </section>
  );
}
