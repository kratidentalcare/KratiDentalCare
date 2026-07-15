import { ClerkProvider } from "@clerk/nextjs";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * Root client/server provider composition.
 * ClerkProvider must wrap the app body tree (not `<html>`).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
