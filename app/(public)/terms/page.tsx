import type { Metadata } from "next";

import {
  LegalDocumentView,
  TERMS_AND_CONDITIONS,
} from "@/components/website/legal-page";
import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { createPublicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Terms & Conditions",
  description: `Terms & Conditions for using the ${APP_NAME} website and online booking services.`,
  path: ROUTES.PUBLIC.TERMS,
});

/**
 * Public Terms & Conditions page.
 */
export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <LegalDocumentView
        document={TERMS_AND_CONDITIONS}
        related={{
          label: "Privacy Policy",
          href: ROUTES.PUBLIC.PRIVACY,
        }}
      />
    </div>
  );
}
