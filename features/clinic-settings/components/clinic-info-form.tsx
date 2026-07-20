"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateClinicSettingsAction } from "@/features/clinic-settings/actions";
import type { ClinicSettingsView } from "@/features/clinic-settings/types";
import {
  clinicInfoFormSchema,
  type ClinicInfoFormValues,
} from "@/validators/clinic-settings";

type ClinicInfoFormProps = {
  settings: ClinicSettingsView;
  onSaved: (patch: Partial<ClinicSettingsView>) => void;
};

export function ClinicInfoForm({ settings, onSaved }: ClinicInfoFormProps) {
  const form = useForm<ClinicInfoFormValues>({
    resolver: zodResolver(clinicInfoFormSchema),
    defaultValues: {
      clinicName: settings.clinicName,
      phone: settings.phone,
      secondaryPhone: settings.secondaryPhone ?? "",
      email: settings.email,
      emergencyContact: settings.emergencyContact ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      clinicName: settings.clinicName,
      phone: settings.phone,
      secondaryPhone: settings.secondaryPhone ?? "",
      email: settings.email,
      emergencyContact: settings.emergencyContact ?? "",
    });
  }, [settings, form]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [form.formState.isDirty]);

  async function onSubmit(values: ClinicInfoFormValues) {
    const result = await updateClinicSettingsAction(values);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    onSaved(values);
    form.reset(values);
    toast.success("Clinic information saved");
  }

  return (
    <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Clinic Information
        </CardTitle>
        <CardDescription>
          Central contact details used in the Footer, booking confirmations, and
          related clinic surfaces.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FormField
            id="clinic-name"
            label="Clinic Name"
            error={form.formState.errors.clinicName?.message}
            required
          >
            <Input
              className="h-10 rounded-xl"
              {...form.register("clinicName")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="clinic-phone"
              label="Primary Phone"
              error={form.formState.errors.phone?.message}
              required
            >
              <Input className="h-10 rounded-xl" {...form.register("phone")} />
            </FormField>
            <FormField
              id="clinic-secondary-phone"
              label="Secondary Phone"
              error={form.formState.errors.secondaryPhone?.message}
            >
              <Input
                className="h-10 rounded-xl"
                placeholder="Optional"
                {...form.register("secondaryPhone")}
              />
            </FormField>
          </div>

          <FormField
            id="clinic-email"
            label="Email"
            error={form.formState.errors.email?.message}
            required
          >
            <Input
              type="email"
              className="h-10 rounded-xl"
              {...form.register("email")}
            />
          </FormField>

          <FormField
            id="clinic-emergency"
            label="Emergency Contact Number"
            error={form.formState.errors.emergencyContact?.message}
            description="Shown in the public Footer when set."
          >
            <Input
              className="h-10 rounded-xl"
              placeholder="Optional"
              {...form.register("emergencyContact")}
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting || !form.formState.isDirty
              }
            >
              {form.formState.isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
