"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatProfileDate,
  formatProfileDateTime,
} from "@/features/profile/lib/format";
import type { AdminProfileView } from "@/features/profile/types";

type ProfileOverviewProps = {
  profile: AdminProfileView;
};

function initialsFromProfile(profile: AdminProfileView): string {
  const first = profile.firstName?.trim().charAt(0);
  const last = profile.lastName?.trim().charAt(0);
  if (first && last) {
    return `${first}${last}`.toUpperCase();
  }
  if (first) {
    return first.toUpperCase();
  }
  return profile.email.charAt(0).toUpperCase() || "A";
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-medium tracking-wide text-brand-muted uppercase">
        {label}
      </dt>
      <dd className="truncate text-sm font-medium text-brand-dark">{value}</dd>
    </div>
  );
}

/**
 * Read-only profile summary card.
 */
export function ProfileOverview({ profile }: ProfileOverviewProps) {
  return (
    <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader className="gap-4 sm:flex-row sm:items-center">
        <Avatar className="size-20 text-lg sm:size-24">
          {profile.profileImage ? (
            <AvatarImage src={profile.profileImage} alt={profile.fullName} />
          ) : null}
          <AvatarFallback className="bg-brand-blue/10 text-lg font-semibold text-brand-blue sm:text-xl">
            {initialsFromProfile(profile)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 space-y-2">
          <CardTitle className="truncate text-xl font-semibold text-brand-dark sm:text-2xl">
            {profile.fullName}
          </CardTitle>
          <CardDescription className="truncate text-sm text-brand-muted">
            {profile.email}
          </CardDescription>
          <span className="inline-flex rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-blue">
            {profile.roleLabel}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <MetaRow label="Phone Number" value={profile.phoneNumber ?? "—"} />
          <MetaRow label="Role" value={profile.roleLabel} />
          <MetaRow label="Joined" value={formatProfileDate(profile.joinedAt)} />
          <MetaRow
            label="Last Login"
            value={formatProfileDateTime(profile.lastLoginAt)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}
