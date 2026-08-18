"use client";

import { useRef, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DefaultDoctorSettings } from "@/features/scheduling/components/default-doctor-settings";
import type { DoctorOption } from "@/features/appointments/services/list-doctors";
import { ClinicContactForm } from "@/features/clinic-settings/components/clinic-contact-form";
import { ClinicInfoForm } from "@/features/clinic-settings/components/clinic-info-form";
import { ClinicSocialForm } from "@/features/clinic-settings/components/clinic-social-form";
import { FooterLinksManager } from "@/features/clinic-settings/components/footer-links-manager";
import { SchedulingSummary } from "@/features/clinic-settings/components/scheduling-summary";
import type { ClinicSettingsView } from "@/features/clinic-settings/types";
import { cn } from "@/lib/utils";

type ClinicSettingsWorkspaceProps = {
  initialSettings: ClinicSettingsView;
  doctors: DoctorOption[];
};

const SETTINGS_TABS = [
  { value: "clinic", label: "Clinic Info" },
  { value: "contact", label: "Contact & Address" },
  { value: "footer", label: "Footer & Social" },
  { value: "scheduling", label: "Scheduling" },
  { value: "doctor", label: "Default Doctor" },
] as const;

const tabTriggerClassName = cn(
  "h-10 flex-none shrink-0 rounded-full border border-transparent px-3.5 text-[0.8125rem]",
  "sm:h-auto sm:py-2 sm:text-sm",
  "data-active:border-[#E5E7EB] data-active:bg-white data-active:text-brand-dark data-active:shadow-sm",
);

export function ClinicSettingsWorkspace({
  initialSettings,
  doctors,
}: ClinicSettingsWorkspaceProps) {
  const [settings, setSettings] = useState(initialSettings);
  const tabListRef = useRef<HTMLDivElement>(null);

  function patchSettings(patch: Partial<ClinicSettingsView>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function scrollActiveTabIntoView() {
    requestAnimationFrame(() => {
      tabListRef.current
        ?.querySelector<HTMLElement>("[data-active]")
        ?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
    });
  }

  return (
    <Tabs
      defaultValue="clinic"
      className="w-full gap-4 sm:gap-6"
      onValueChange={scrollActiveTabIntoView}
    >
      <div ref={tabListRef} className="relative max-sm:-mx-3">
        <TabsList
          className={cn(
            "flex h-auto w-full flex-nowrap justify-start gap-1.5 bg-transparent p-0",
            "overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "max-sm:px-3 max-sm:pb-0.5 sm:flex-wrap",
          )}
        >
          {SETTINGS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={tabTriggerClassName}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-surface to-transparent sm:hidden"
          aria-hidden
        />
      </div>

      <TabsContent value="clinic" className="mt-0 min-w-0">
        <ClinicInfoForm settings={settings} onSaved={patchSettings} />
      </TabsContent>

      <TabsContent value="contact" className="mt-0 min-w-0">
        <ClinicContactForm settings={settings} onSaved={patchSettings} />
      </TabsContent>

      <TabsContent value="footer" className="mt-0 flex min-w-0 flex-col gap-4 sm:gap-6">
        <ClinicSocialForm settings={settings} onSaved={patchSettings} />
        <FooterLinksManager settings={settings} onSaved={patchSettings} />
      </TabsContent>

      <TabsContent value="scheduling" className="mt-0 min-w-0">
        <SchedulingSummary settings={settings} />
      </TabsContent>

      <TabsContent value="doctor" className="mt-0 min-w-0">
        <DefaultDoctorSettings
          doctors={doctors}
          currentDoctorId={settings.defaultDoctorId}
        />
      </TabsContent>
    </Tabs>
  );
}
