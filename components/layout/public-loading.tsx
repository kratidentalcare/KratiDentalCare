import { LoadingState } from "@/components/shared";
import { PageContainer } from "@/components/layout/page-container";

/**
 * Route-level loading UI for the public website segment.
 */
export function PublicLoading() {
  return (
    <PageContainer className="flex flex-1 flex-col justify-center public-section-y">
      <LoadingState
        variant="skeleton"
        label="Loading page"
        rows={5}
        className="mx-auto max-w-2xl"
      />
    </PageContainer>
  );
}
