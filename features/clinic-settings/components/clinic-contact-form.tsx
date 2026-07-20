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
  clinicContactFormSchema,
  type ClinicContactFormValues,
} from "@/validators/clinic-settings";

type ClinicContactFormProps = {
  settings: ClinicSettingsView;
  onSaved: (patch: Partial<ClinicSettingsView>) => void;
};

export function ClinicContactForm({
  settings,
  onSaved,
}: ClinicContactFormProps) {
  const form = useForm<ClinicContactFormValues>({
    resolver: zodResolver(clinicContactFormSchema),
    defaultValues: {
      line1: settings.address.line1,
      line2: settings.address.line2 ?? "",
      city: settings.address.city,
      state: settings.address.state,
      postalCode: settings.address.postalCode,
      country: settings.address.country,
      googleMapsUrl: settings.googleMapsUrl ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      line1: settings.address.line1,
      line2: settings.address.line2 ?? "",
      city: settings.address.city,
      state: settings.address.state,
      postalCode: settings.address.postalCode,
      country: settings.address.country,
      googleMapsUrl: settings.googleMapsUrl ?? "",
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

  async function onSubmit(values: ClinicContactFormValues) {
    const result = await updateClinicSettingsAction({
      address: {
        line1: values.line1,
        line2: values.line2,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
      },
      googleMapsUrl: values.googleMapsUrl,
    });
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    onSaved({
      address: {
        line1: values.line1,
        line2: values.line2,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
      },
      googleMapsUrl: values.googleMapsUrl,
    });
    form.reset(values);
    toast.success("Contact & address saved");
  }

  return (
    <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Contact & Address
        </CardTitle>
        <CardDescription>
          Address shown in the public Footer. Changes apply without redeploying.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FormField
            id="address-line1"
            label="Full Clinic Address"
            error={form.formState.errors.line1?.message}
            required
          >
            <Input
              className="h-10 rounded-xl"
              placeholder="Street address"
              {...form.register("line1")}
            />
          </FormField>

          <FormField
            id="address-line2"
            label="Address Line 2"
            error={form.formState.errors.line2?.message}
          >
            <Input
              className="h-10 rounded-xl"
              placeholder="Suite, floor (optional)"
              {...form.register("line2")}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="address-city"
              label="City"
              error={form.formState.errors.city?.message}
              required
            >
              <Input className="h-10 rounded-xl" {...form.register("city")} />
            </FormField>
            <FormField
              id="address-state"
              label="State"
              error={form.formState.errors.state?.message}
              required
            >
              <Input className="h-10 rounded-xl" {...form.register("state")} />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="address-postal"
              label="Postal Code"
              error={form.formState.errors.postalCode?.message}
              required
            >
              <Input
                className="h-10 rounded-xl"
                {...form.register("postalCode")}
              />
            </FormField>
            <FormField
              id="address-country"
              label="Country"
              error={form.formState.errors.country?.message}
              required
              description="2-letter ISO code (e.g. IN)"
            >
              <Input
                className="h-10 rounded-xl uppercase"
                maxLength={2}
                {...form.register("country")}
              />
            </FormField>
          </div>

          <FormField
            id="google-maps-url"
            label="Google Maps URL"
            error={form.formState.errors.googleMapsUrl?.message}
            description="Optional https:// link used on the Footer address."
          >
            <Input
              className="h-10 rounded-xl"
              placeholder="https://maps.google.com/…"
              {...form.register("googleMapsUrl")}
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
