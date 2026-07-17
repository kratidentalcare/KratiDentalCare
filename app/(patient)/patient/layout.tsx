import type { Metadata } from "next";

import { ROUTES } from "@/constants/routes";
import { requirePatientPage } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Patient portal",
};

/**
 * Patient portal shell — Clerk session + active Mongo patient role required.
 */
export default async function PatientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requirePatientPage({
    returnPath: ROUTES.PATIENT.ROOT,
    touchLastLogin: true,
  });

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <p className="text-sm font-medium text-slate-900">Patient portal</p>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
