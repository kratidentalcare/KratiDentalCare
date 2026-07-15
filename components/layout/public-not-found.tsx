import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

/**
 * Presentational 404 for public (and root unmatched) routes.
 */
export function PublicNotFound() {
  return (
    <PageContainer
      size="sm"
      className="flex flex-1 flex-col justify-center public-section-y"
    >
      <EmptyState
        icon={FileQuestionIcon}
        title="Page not found"
        description="The page you are looking for does not exist or may have been moved."
        action={
          <Link
            href={ROUTES.HOME}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Back to home
          </Link>
        }
      />
    </PageContainer>
  );
}
