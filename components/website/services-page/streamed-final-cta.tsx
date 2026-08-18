import { getPublicFooterData } from "@/features/clinic-settings";

import { ServicesFinalCta } from "./services-final-cta";

/**
 * Clinic-phone CTA streamed behind Suspense.
 * Shares `getPublicFooterData` (React cache) with the public footer.
 */
export async function StreamedFinalCta() {
  const footerData = await getPublicFooterData();

  return (
    <ServicesFinalCta
      phone={footerData?.contact.phone}
      phoneHref={footerData?.contact.phoneHref}
    />
  );
}
