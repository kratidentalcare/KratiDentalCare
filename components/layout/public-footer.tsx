import { Footer } from "@/components/shared/footer";
import { getPublicFooterData } from "@/features/clinic-settings";

/**
 * Clinic-settings footer streamed behind Suspense.
 * Fallback is `<Footer />` (built-in defaults until data arrives).
 */
export async function PublicFooter() {
  const footerData = await getPublicFooterData();

  return (
    <Footer
      contact={footerData?.contact}
      social={footerData?.social}
      quickLinks={footerData?.quickLinks}
      serviceLinks={footerData?.serviceLinks}
      copyrightOwner={footerData?.copyrightOwner}
    />
  );
}
