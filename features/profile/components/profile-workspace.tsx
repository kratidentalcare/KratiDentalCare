"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileEditForm } from "@/features/profile/components/profile-edit-form";
import { ProfileOverview } from "@/features/profile/components/profile-overview";
import { ProfileSecurityCard } from "@/features/profile/components/profile-security-card";
import type { AdminProfileView } from "@/features/profile/types";

type ProfileWorkspaceProps = {
  initialProfile: AdminProfileView;
};

/**
 * Admin profile workspace — overview, edit, and Clerk security.
 */
export function ProfileWorkspace({ initialProfile }: ProfileWorkspaceProps) {
  const [profile, setProfile] = useState(initialProfile);

  return (
    <Tabs defaultValue="overview" className="w-full gap-6">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
        <TabsTrigger
          value="overview"
          className="rounded-full border border-transparent px-3 py-2 data-[state=active]:border-[#E5E7EB] data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="edit"
          className="rounded-full border border-transparent px-3 py-2 data-[state=active]:border-[#E5E7EB] data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Edit Profile
        </TabsTrigger>
        <TabsTrigger
          value="security"
          className="rounded-full border border-transparent px-3 py-2 data-[state=active]:border-[#E5E7EB] data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        <ProfileOverview profile={profile} />
      </TabsContent>

      <TabsContent value="edit" className="mt-0">
        <ProfileEditForm profile={profile} onUpdated={setProfile} />
      </TabsContent>

      <TabsContent value="security" className="mt-0">
        <ProfileSecurityCard />
      </TabsContent>
    </Tabs>
  );
}
