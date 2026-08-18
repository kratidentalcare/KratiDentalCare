import { getPublicContactPageData } from "@/features/contact";

import { ContactInfoCards } from "./contact-info-cards";
import { ContactMapSection } from "./contact-map-section";
import { ContactWorkingHours } from "./contact-working-hours";

/**
 * Contact identity + hours from ClinicSettings, streamed behind Suspense.
 */
export async function StreamedContactDetails() {
  const pageData = await getPublicContactPageData();

  return (
    <>
      <ContactInfoCards contact={pageData?.contact ?? null} />
      <ContactWorkingHours schedule={pageData?.schedule ?? null} />
    </>
  );
}

/**
 * Maps embed from ClinicSettings, streamed behind Suspense.
 */
export async function StreamedContactMap() {
  const pageData = await getPublicContactPageData();
  return <ContactMapSection contact={pageData?.contact ?? null} />;
}
