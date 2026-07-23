import type { Metadata } from "next";

import {
  LegalDocumentView,
  PRIVACY_POLICY,
} from "@/components/website/legal-page";
import { APP_NAME } from "@/constants";
import { ROUTES } from "@/constants/routes";
import { createPublicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Privacy Policy",
  description: `Privacy Policy for ${APP_NAME} — how we collect, use, and protect your personal information.`,
  path: ROUTES.PUBLIC.PRIVACY,
});

/**
 * Public Privacy Policy page.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <LegalDocumentView
        document={PRIVACY_POLICY}
        related={{
          label: "Terms & Conditions",
          href: ROUTES.PUBLIC.TERMS,
        }}
      />
    </div>
  );
}
