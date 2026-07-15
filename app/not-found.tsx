import { PublicNotFound, PublicShell } from "@/components/layout";

/**
 * App-wide unmatched route UI. Visitors hitting unknown URLs get the public
 * shell + 404 (route-group `not-found` alone does not cover global misses).
 */
export default function RootNotFound() {
  return (
    <PublicShell>
      <PublicNotFound />
    </PublicShell>
  );
}
