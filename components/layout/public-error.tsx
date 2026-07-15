"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/shared";
import { PageContainer } from "@/components/layout/page-container";
import { logger } from "@/lib/logger";

export type PublicErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Client error boundary UI for the public website segment.
 */
export function PublicError({ error, reset }: PublicErrorProps) {
  useEffect(() => {
    logger.error("Public route error boundary", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <PageContainer
      size="sm"
      className="flex flex-1 flex-col items-center justify-center public-section-y"
    >
      <div
        role="alert"
        className="flex w-full flex-col items-center gap-6 text-center"
      >
        <ErrorMessage
          title="Something went wrong"
          message="We could not load this page. Please try again. If the problem continues, contact the clinic."
          className="w-full text-left"
        />

        <Button type="button" onClick={reset} size="lg">
          Try again
        </Button>

        {error.digest ? (
          <p className="text-xs text-muted-foreground">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}
      </div>
    </PageContainer>
  );
}
