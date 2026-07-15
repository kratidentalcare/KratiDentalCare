"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

type AppProvidersProps = {
  children: ReactNode;
};

/**
 * Root client provider composition.
 * ClerkProvider must wrap the app body tree (not `<html>`).
 * TooltipProvider + Toaster enable shared design-system affordances app-wide.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ClerkProvider>
      <TooltipProvider>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </TooltipProvider>
    </ClerkProvider>
  );
}
