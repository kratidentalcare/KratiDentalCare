"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form-field";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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
  updateAdminProfileAction,
  uploadAdminProfileImageAction,
} from "@/features/profile/actions";
import type { AdminProfileView } from "@/features/profile/types";
import {
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_MIME_TYPES,
  updateAdminProfileSchema,
  type UpdateAdminProfileInput,
} from "@/validators/profile";

type ProfileEditFormProps = {
  profile: AdminProfileView;
  onUpdated: (profile: AdminProfileView) => void;
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

/**
 * Editable profile fields + photo upload.
 * Email remains read-only (Clerk-owned identity).
 */
export function ProfileEditForm({ profile, onUpdated }: ProfileEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  const form = useForm<UpdateAdminProfileInput>({
    resolver: zodResolver(updateAdminProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber ?? "",
    });
  }, [profile, form]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function onSubmit(values: UpdateAdminProfileInput) {
    const result = await updateAdminProfileAction(values);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    onUpdated(result.data);
    form.reset({
      fullName: result.data.fullName,
      phoneNumber: result.data.phoneNumber ?? "",
    });
    toast.success("Profile updated");
  }

  function onPickImage() {
    fileInputRef.current?.click();
  }

  function onImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!(PROFILE_IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) {
      toast.error("Use a JPEG, PNG, or WebP image");
      return;
    }

    if (file.size <= 0 || file.size > PROFILE_IMAGE_MAX_BYTES) {
      toast.error("Image must be 2 MB or smaller");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return objectUrl;
    });

    startUpload(async () => {
      const formData = new FormData();
      formData.set("profileImage", file);
      const result = await uploadAdminProfileImageAction(formData);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      onUpdated(result.data);
      toast.success("Profile photo updated");
    });
  }

  const imageSrc = previewUrl ?? profile.profileImage;
  const isSaving = form.formState.isSubmitting;

  return (
    <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Edit Profile</CardTitle>
        <CardDescription>
          Update your display name, phone number, and profile photo. Email is
          managed by Clerk and cannot be changed here.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-20 text-lg sm:size-24">
            {imageSrc ? (
              <AvatarImage src={imageSrc} alt={profile.fullName} />
            ) : null}
            <AvatarFallback className="bg-brand-blue/10 text-lg font-semibold text-brand-blue">
              {initialsFromProfile(profile)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={onPickImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
              ) : (
                <CameraIcon className="size-4" aria-hidden />
              )}
              {isUploading ? "Uploading…" : "Change photo"}
            </Button>
            <p className="text-xs text-brand-muted">
              JPEG, PNG, or WebP · max 2 MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={PROFILE_IMAGE_MIME_TYPES.join(",")}
              className="sr-only"
              onChange={onImageSelected}
            />
          </div>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FormField
            id="profile-full-name"
            label="Full Name"
            error={form.formState.errors.fullName?.message}
            required
          >
            <Input
              className="h-10 rounded-xl"
              autoComplete="name"
              {...form.register("fullName")}
            />
          </FormField>

          <FormField
            id="profile-email"
            label="Email"
            description="Managed by Clerk authentication"
          >
            <Input
              className="h-10 rounded-xl bg-[#F8FBFD]"
              value={profile.email}
              readOnly
              disabled
            />
          </FormField>

          <FormField
            id="profile-phone"
            label="Phone Number"
            error={form.formState.errors.phoneNumber?.message}
          >
            <Input
              className="h-10 rounded-xl"
              type="tel"
              autoComplete="tel"
              placeholder="Optional"
              {...form.register("phoneNumber")}
            />
          </FormField>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              className="rounded-xl"
              disabled={isSaving || !form.formState.isDirty}
            >
              {isSaving ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
