"use client";

import { useClerk } from "@clerk/nextjs";
import { KeyRoundIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Password / security — opens Clerk Account Management (no custom auth).
 */
export function ProfileSecurityCard() {
  const { openUserProfile } = useClerk();

  return (
    <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ShieldCheckIcon className="size-4 text-brand-blue" aria-hidden />
          Security
        </CardTitle>
        <CardDescription>
          Passwords, sessions, and connected accounts are managed securely by
          Clerk. Use Manage Account to change your password or review security
          settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => {
            openUserProfile();
          }}
        >
          <KeyRoundIcon className="size-4" aria-hidden />
          Manage Account
        </Button>
      </CardContent>
    </Card>
  );
}
