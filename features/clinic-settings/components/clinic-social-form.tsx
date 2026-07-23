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
import {
  SOCIAL_LINK_KEYS,
  SOCIAL_LINK_LABELS,
} from "@/constants/clinic-settings";
import { updateClinicSettingsAction } from "@/features/clinic-settings/actions";
import type { ClinicSettingsView } from "@/features/clinic-settings/types";
import {
  clinicSocialFormSchema,
  type ClinicSocialFormValues,
} from "@/validators/clinic-settings";

type ClinicSocialFormProps = {
  settings: ClinicSettingsView;
  onSaved: (patch: Partial<ClinicSettingsView>) => void;
};

export function ClinicSocialForm({
  settings,
  onSaved,
}: ClinicSocialFormProps) {
  const form = useForm<ClinicSocialFormValues>({
    resolver: zodResolver(clinicSocialFormSchema),
    defaultValues: {
      facebook: settings.socialLinks.facebook ?? "",
      instagram: settings.socialLinks.instagram ?? "",
      twitter: settings.socialLinks.twitter ?? "",
      youtube: settings.socialLinks.youtube ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      facebook: settings.socialLinks.facebook ?? "",
      instagram: settings.socialLinks.instagram ?? "",
      twitter: settings.socialLinks.twitter ?? "",
      youtube: settings.socialLinks.youtube ?? "",
    });
  }, [settings.socialLinks, form]);

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

  async function onSubmit(values: ClinicSocialFormValues) {
    const socialLinks = {
      facebook: values.facebook ?? null,
      instagram: values.instagram ?? null,
      twitter: values.twitter ?? null,
      youtube: values.youtube ?? null,
    };
    const result = await updateClinicSettingsAction({ socialLinks });
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    onSaved({ socialLinks });
    form.reset(socialLinks);
    toast.success("Social links saved");
  }

  return (
    <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Social Links</CardTitle>
        <CardDescription>
          Only platforms with a valid https:// URL appear as icons in the
          Footer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          {SOCIAL_LINK_KEYS.map((key) => (
            <FormField
              key={key}
              id={`social-${key}`}
              label={SOCIAL_LINK_LABELS[key]}
              error={form.formState.errors[key]?.message}
            >
              <Input
                className="h-10 rounded-xl"
                placeholder="https://…"
                {...form.register(key)}
              />
            </FormField>
          ))}

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
