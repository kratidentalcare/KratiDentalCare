"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AvailabilityForm } from "@/features/scheduling/components/availability-form";
import { HolidaysPanel } from "@/features/scheduling/components/holidays-panel";
import { LivePreview } from "@/features/scheduling/components/live-preview";
import { OverridesPanel } from "@/features/scheduling/components/overrides-panel";
import type {
  AvailabilityResult,
  ClinicAvailabilityFormValues,
  HolidayListItem,
  OverrideListItem,
} from "@/features/scheduling/types";

type SchedulingWorkspaceProps = {
  availability: ClinicAvailabilityFormValues;
  holidays: HolidayListItem[];
  overrides: OverrideListItem[];
  previewDate: string;
  previewResult: AvailabilityResult;
};

export function SchedulingWorkspace({
  availability,
  holidays,
  overrides,
  previewDate,
  previewResult,
}: SchedulingWorkspaceProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
      <Tabs defaultValue="availability" className="min-w-0 gap-4">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-[#E5E7EB] bg-transparent p-0"
        >
          <TabsTrigger
            value="availability"
            className="rounded-none px-3 py-2.5 data-active:shadow-none"
          >
            Availability
          </TabsTrigger>
          <TabsTrigger
            value="holidays"
            className="rounded-none px-3 py-2.5 data-active:shadow-none"
          >
            Holidays
          </TabsTrigger>
          <TabsTrigger
            value="blocks"
            className="rounded-none px-3 py-2.5 data-active:shadow-none"
          >
            Date Blocks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="mt-0">
          <AvailabilityForm initialValues={availability} />
        </TabsContent>
        <TabsContent value="holidays" className="mt-0">
          <HolidaysPanel initialHolidays={holidays} />
        </TabsContent>
        <TabsContent value="blocks" className="mt-0">
          <OverridesPanel initialOverrides={overrides} />
        </TabsContent>
      </Tabs>

      <div className="xl:sticky xl:top-4">
        <LivePreview
          initialDate={previewDate}
          initialResult={previewResult}
        />
      </div>
    </div>
  );
}
