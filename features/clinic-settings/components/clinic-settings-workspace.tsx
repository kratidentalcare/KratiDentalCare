"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DefaultDoctorSettings } from "@/features/scheduling/components/default-doctor-settings";
import type { DoctorOption } from "@/features/appointments/services/list-doctors";
import { ClinicContactForm } from "@/features/clinic-settings/components/clinic-contact-form";
import { ClinicInfoForm } from "@/features/clinic-settings/components/clinic-info-form";
import { ClinicSocialForm } from "@/features/clinic-settings/components/clinic-social-form";
import { FooterLinksManager } from "@/features/clinic-settings/components/footer-links-manager";
import { SchedulingSummary } from "@/features/clinic-settings/components/scheduling-summary";
import type { ClinicSettingsView } from "@/features/clinic-settings/types";

type ClinicSettingsWorkspaceProps = {
  initialSettings: ClinicSettingsView;
  doctors: DoctorOption[];
};

export function ClinicSettingsWorkspace({
  initialSettings,
  doctors,
}: ClinicSettingsWorkspaceProps) {
  const [settings, setSettings] = useState(initialSettings);

  function patchSettings(patch: Partial<ClinicSettingsView>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  return (
    <Tabs defaultValue="clinic" className="w-full gap-6">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
        <TabsTrigger
          value="clinic"
          className="rounded-full border border-transparent px-3 py-2 data-[state=active]:border-[#E5E7EB] data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Clinic Info
        </TabsTrigger>
        <TabsTrigger
          value="contact"
          className="rounded-full border border-transparent px-3 py-2 data-[state=active]:border-[#E5E7EB] data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Contact & Address
        </TabsTrigger>
        <TabsTrigger
          value="footer"
          className="rounded-full border border-transparent px-3 py-2 data-[state=active]:border-[#E5E7EB] data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Footer & Social
        </TabsTrigger>
        <TabsTrigger
          value="scheduling"
          className="rounded-full border border-transparent px-3 py-2 data-[state=active]:border-[#E5E7EB] data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Scheduling
        </TabsTrigger>
        <TabsTrigger
          value="doctor"
          className="rounded-full border border-transparent px-3 py-2 data-[state=active]:border-[#E5E7EB] data-[state=active]:bg-white data-[state=active]:shadow-sm"
        >
          Default Doctor
        </TabsTrigger>
      </TabsList>

      <TabsContent value="clinic" className="mt-0">
        <ClinicInfoForm settings={settings} onSaved={patchSettings} />
      </TabsContent>

      <TabsContent value="contact" className="mt-0">
        <ClinicContactForm settings={settings} onSaved={patchSettings} />
      </TabsContent>

      <TabsContent value="footer" className="mt-0 flex flex-col gap-6">
        <ClinicSocialForm settings={settings} onSaved={patchSettings} />
        <FooterLinksManager settings={settings} onSaved={patchSettings} />
      </TabsContent>

      <TabsContent value="scheduling" className="mt-0">
        <SchedulingSummary settings={settings} />
      </TabsContent>

      <TabsContent value="doctor" className="mt-0">
        <DefaultDoctorSettings
          doctors={doctors}
          currentDoctorId={settings.defaultDoctorId}
        />
      </TabsContent>
    </Tabs>
  );
}
