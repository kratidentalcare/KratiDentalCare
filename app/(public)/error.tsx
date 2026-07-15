"use client";

import { PublicError } from "@/components/layout/public-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PublicError error={error} reset={reset} />;
}
