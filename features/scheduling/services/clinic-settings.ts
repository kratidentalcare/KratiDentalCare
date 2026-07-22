import "server-only";

import { Types } from "mongoose";
import { cache } from "react";

import { APP_NAME, CLINIC_SETTINGS_KEY } from "@/constants/app";
import { FOOTER_LINK_GROUPS } from "@/constants/clinic-settings";
import { DEFAULT_ADDRESS_COUNTRY } from "@/constants/patient";
import { ROUTES } from "@/constants/routes";
import {
  DEFAULT_APPOINTMENT_DURATION_MINUTES,
  DEFAULT_CLINIC_CLOSING_TIME,
  DEFAULT_CLINIC_OPENING_TIME,
  DEFAULT_CLINIC_TIMEZONE,
  DEFAULT_WORKING_DAYS,
} from "@/constants/scheduling";
import { DOCTOR_STATUSES } from "@/constants/statuses";
import { connect } from "@/lib/db";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  ClinicSettings,
  type LeanClinicSettings,
} from "@/models/clinic-settings";
import { Doctor } from "@/models/doctor";
import {
  createClinicSettingsSchema,
  updateClinicAvailabilitySchema,
  updateClinicSettingsSchema,
  type UpdateClinicAvailabilityInput,
  type UpdateClinicSettingsInput,
} from "@/validators/clinic-settings";

const DEFAULT_FOOTER_LINKS = [
  {
    label: "Home",
    url: ROUTES.PUBLIC.HOME,
    group: FOOTER_LINK_GROUPS.QUICK_LINKS,
    displayOrder: 0,
    isActive: true,
  },
  {
    label: "Services",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.QUICK_LINKS,
    displayOrder: 1,
    isActive: true,
  },
  {
    label: "Doctors",
    url: ROUTES.PUBLIC.DOCTORS,
    group: FOOTER_LINK_GROUPS.QUICK_LINKS,
    displayOrder: 2,
    isActive: true,
  },
  {
    label: "Contact",
    url: ROUTES.PUBLIC.CONTACT,
    group: FOOTER_LINK_GROUPS.QUICK_LINKS,
    displayOrder: 3,
    isActive: true,
  },
  {
    label: "Book and Smile",
    url: ROUTES.PUBLIC.BOOK,
    group: FOOTER_LINK_GROUPS.QUICK_LINKS,
    displayOrder: 4,
    isActive: true,
  },
  {
    label: "General Dentistry",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 0,
    isActive: true,
  },
  {
    label: "Cosmetic Dentistry",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 1,
    isActive: true,
  },
  {
    label: "Root Canal",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 2,
    isActive: true,
  },
  {
    label: "Dental Implants",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 3,
    isActive: true,
  },
  {
    label: "Teeth Whitening",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 4,
    isActive: true,
  },
  {
    label: "Emergency Care",
    url: ROUTES.PUBLIC.CONTACT,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 5,
    isActive: true,
  },
] as const;

const DEFAULT_SETTINGS_SEED = {
  clinicKey: CLINIC_SETTINGS_KEY,
  clinicName: APP_NAME,
  address: {
    line1: "Clinic Address",
    line2: null as string | null,
    city: "City",
    state: "State",
    postalCode: "000000",
    country: DEFAULT_ADDRESS_COUNTRY,
  },
  phone: "+910000000000",
  secondaryPhone: null as string | null,
  email: "clinic@kratidentalcare.com",
  emergencyContact: null as string | null,
  googleMapsUrl: null as string | null,
  logoUrl: null as string | null,
  socialLinks: {
    facebook: null as string | null,
    instagram: null as string | null,
    linkedin: null as string | null,
    youtube: null as string | null,
  },
  footerLinks: [...DEFAULT_FOOTER_LINKS],
  timezone: DEFAULT_CLINIC_TIMEZONE,
  workingDays: [...DEFAULT_WORKING_DAYS],
  openingTime: DEFAULT_CLINIC_OPENING_TIME,
  closingTime: DEFAULT_CLINIC_CLOSING_TIME,
  appointmentDurationMinutes: DEFAULT_APPOINTMENT_DURATION_MINUTES,
  breaks: [
    {
      startTime: "13:00",
      endTime: "14:00",
      label: "Lunch",
    },
  ],
  bookingRules: {
    minLeadTimeHours: 0,
    maxAdvanceDays: 60,
    cancellationCutoffHours: 2,
    allowSameDayBooking: true,
  },
  defaultDoctorId: null as string | null,
  updatedByUserId: null as string | null,
};

async function assertBookableDoctor(doctorId: string | null): Promise<void> {
  if (doctorId == null) {
    return;
  }

  const doctor = await Doctor.findOne({
    _id: new Types.ObjectId(doctorId),
    deletedAt: null,
    isActive: true,
    status: DOCTOR_STATUSES.ACTIVE,
    isAvailable: true,
  })
    .select({ _id: 1 })
    .lean();

  if (!doctor) {
    throw new ValidationError(
      "Default doctor must be an active doctor who can receive appointments",
      [
        {
          field: "defaultDoctorId",
          message:
            "Doctor not found, inactive, or unavailable for appointments",
        },
      ],
    );
  }
}

/**
 * Normalize lean settings so older documents missing new fields still work.
 */
export function normalizeClinicSettings(
  settings: LeanClinicSettings,
): LeanClinicSettings {
  return {
    ...settings,
    secondaryPhone: settings.secondaryPhone ?? null,
    emergencyContact: settings.emergencyContact ?? null,
    googleMapsUrl: settings.googleMapsUrl ?? null,
    socialLinks: {
      facebook: settings.socialLinks?.facebook ?? null,
      instagram: settings.socialLinks?.instagram ?? null,
      linkedin: settings.socialLinks?.linkedin ?? null,
      youtube: settings.socialLinks?.youtube ?? null,
    },
    footerLinks: Array.isArray(settings.footerLinks)
      ? settings.footerLinks
      : [],
  };
}

/**
 * Load the primary clinic settings singleton, creating defaults if missing.
 * React `cache` dedupes within a single request (layout + pages).
 */
export const getOrCreateClinicSettings = cache(
  async (updatedByUserId?: string): Promise<LeanClinicSettings> => {
  await connect();

  const existing = await ClinicSettings.findOne({
    clinicKey: CLINIC_SETTINGS_KEY,
  }).lean<LeanClinicSettings>();

  if (existing) {
    const normalized = normalizeClinicSettings(existing);

    // Soft migrate: seed default footer links for documents created before Phase 19.
    if (!Array.isArray(existing.footerLinks) || existing.footerLinks.length === 0) {
      await ClinicSettings.updateOne(
        { clinicKey: CLINIC_SETTINGS_KEY, deletedAt: null },
        {
          $set: {
            footerLinks: [...DEFAULT_FOOTER_LINKS],
            secondaryPhone: existing.secondaryPhone ?? null,
            emergencyContact: existing.emergencyContact ?? null,
            googleMapsUrl: existing.googleMapsUrl ?? null,
            socialLinks: {
              facebook: existing.socialLinks?.facebook ?? null,
              instagram: existing.socialLinks?.instagram ?? null,
              linkedin: existing.socialLinks?.linkedin ?? null,
              youtube: existing.socialLinks?.youtube ?? null,
            },
          },
        },
      );
      return normalizeClinicSettings({
        ...normalized,
        footerLinks: [...DEFAULT_FOOTER_LINKS],
      });
    }

    return normalized;
  }

  const parsed = createClinicSettingsSchema.safeParse({
    ...DEFAULT_SETTINGS_SEED,
    updatedByUserId: updatedByUserId ?? null,
  });

  if (!parsed.success) {
    throw new ValidationError("Invalid default clinic settings seed");
  }

  try {
    const created = await ClinicSettings.create({
      ...parsed.data,
      updatedByUserId: updatedByUserId
        ? new Types.ObjectId(updatedByUserId)
        : null,
    });
    return normalizeClinicSettings(created.toObject() as LeanClinicSettings);
  } catch (error) {
    // Concurrent first-write race — re-read the winner.
    const raced = await ClinicSettings.findOne({
      clinicKey: CLINIC_SETTINGS_KEY,
    }).lean<LeanClinicSettings>();
    if (raced) {
      return normalizeClinicSettings(raced);
    }
    throw error;
  }
  },
);

export async function getClinicSettingsOrThrow(): Promise<LeanClinicSettings> {
  await connect();
  const settings = await ClinicSettings.findOne({
    clinicKey: CLINIC_SETTINGS_KEY,
  }).lean<LeanClinicSettings>();

  if (!settings) {
    throw new NotFoundError("Clinic settings not found");
  }

  return normalizeClinicSettings(settings);
}

/**
 * Update scheduling fields on the singleton after merge + Zod validation.
 * Does not modify existing appointments — only future availability uses new rules.
 */
export async function updateClinicAvailability(
  input: UpdateClinicAvailabilityInput,
  updatedByUserId: string,
): Promise<LeanClinicSettings> {
  await connect();

  const current = await getOrCreateClinicSettings(updatedByUserId);

  const merged = {
    timezone: input.timezone ?? current.timezone,
    workingDays: input.workingDays ?? current.workingDays,
    openingTime: input.openingTime ?? current.openingTime,
    closingTime: input.closingTime ?? current.closingTime,
    appointmentDurationMinutes:
      input.appointmentDurationMinutes ?? current.appointmentDurationMinutes,
    breaks:
      input.breaks ??
      current.breaks.map((item) => ({
        startTime: item.startTime,
        endTime: item.endTime,
        label: item.label,
      })),
    bookingRules: {
      ...current.bookingRules,
      ...(input.bookingRules ?? {}),
    },
    defaultDoctorId:
      input.defaultDoctorId !== undefined
        ? input.defaultDoctorId
        : current.defaultDoctorId
          ? String(current.defaultDoctorId)
          : null,
    isActive: input.isActive ?? current.isActive,
  };

  const parsed = updateClinicAvailabilitySchema.safeParse(merged);
  if (!parsed.success) {
    throw new ValidationError(
      "Invalid clinic availability settings",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  // Re-validate the complete schedule window (hours + breaks together).
  const fullCheck = updateClinicAvailabilitySchema.safeParse({
    timezone: merged.timezone,
    workingDays: merged.workingDays,
    openingTime: merged.openingTime,
    closingTime: merged.closingTime,
    appointmentDurationMinutes: merged.appointmentDurationMinutes,
    breaks: merged.breaks,
    bookingRules: merged.bookingRules,
  });

  if (!fullCheck.success) {
    throw new ValidationError(
      "Invalid clinic availability settings",
      fullCheck.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  if (input.defaultDoctorId !== undefined) {
    await assertBookableDoctor(
      merged.defaultDoctorId ? String(merged.defaultDoctorId) : null,
    );
  }

  const updated = await ClinicSettings.findOneAndUpdate(
    { clinicKey: CLINIC_SETTINGS_KEY, deletedAt: null },
    {
      $set: {
        timezone: merged.timezone,
        workingDays: merged.workingDays,
        openingTime: merged.openingTime,
        closingTime: merged.closingTime,
        appointmentDurationMinutes: merged.appointmentDurationMinutes,
        breaks: merged.breaks,
        bookingRules: merged.bookingRules,
        defaultDoctorId: merged.defaultDoctorId
          ? new Types.ObjectId(String(merged.defaultDoctorId))
          : null,
        isActive: merged.isActive,
        updatedByUserId: new Types.ObjectId(updatedByUserId),
      },
    },
    { new: true },
  ).lean<LeanClinicSettings>();

  if (!updated) {
    throw new ConflictError("Unable to update clinic settings");
  }

  return normalizeClinicSettings(updated);
}

/**
 * Update identity, contact, footer, and default doctor fields.
 * Scheduling hours remain managed via `updateClinicAvailability`.
 */
export async function updateClinicSettings(
  input: UpdateClinicSettingsInput,
  updatedByUserId: string,
): Promise<LeanClinicSettings> {
  await connect();

  const current = await getOrCreateClinicSettings(updatedByUserId);

  const mergedSocial = {
    facebook:
      input.socialLinks?.facebook !== undefined
        ? (input.socialLinks.facebook ?? null)
        : (current.socialLinks.facebook ?? null),
    instagram:
      input.socialLinks?.instagram !== undefined
        ? (input.socialLinks.instagram ?? null)
        : (current.socialLinks.instagram ?? null),
    linkedin:
      input.socialLinks?.linkedin !== undefined
        ? (input.socialLinks.linkedin ?? null)
        : (current.socialLinks.linkedin ?? null),
    youtube:
      input.socialLinks?.youtube !== undefined
        ? (input.socialLinks.youtube ?? null)
        : (current.socialLinks.youtube ?? null),
  };

  const merged = {
    clinicName: input.clinicName ?? current.clinicName,
    address: {
      line1: input.address?.line1 ?? current.address.line1,
      line2:
        input.address?.line2 !== undefined
          ? (input.address.line2 ?? null)
          : current.address.line2,
      city: input.address?.city ?? current.address.city,
      state: input.address?.state ?? current.address.state,
      postalCode: input.address?.postalCode ?? current.address.postalCode,
      country: input.address?.country ?? current.address.country,
    },
    phone: input.phone ?? current.phone,
    secondaryPhone:
      input.secondaryPhone !== undefined
        ? input.secondaryPhone
        : current.secondaryPhone,
    email: input.email ?? current.email,
    emergencyContact:
      input.emergencyContact !== undefined
        ? input.emergencyContact
        : current.emergencyContact,
    googleMapsUrl:
      input.googleMapsUrl !== undefined
        ? input.googleMapsUrl
        : current.googleMapsUrl,
    logoUrl:
      input.logoUrl !== undefined ? input.logoUrl : current.logoUrl,
    socialLinks: mergedSocial,
    footerLinks:
      input.footerLinks ??
      current.footerLinks.map((link) => ({
        label: link.label,
        url: link.url,
        group: link.group,
        displayOrder: link.displayOrder,
        isActive: link.isActive,
      })),
    defaultDoctorId:
      input.defaultDoctorId !== undefined
        ? input.defaultDoctorId
        : current.defaultDoctorId
          ? String(current.defaultDoctorId)
          : null,
    isActive: input.isActive ?? current.isActive,
  };

  const parsed = updateClinicSettingsSchema.safeParse({
    clinicName: merged.clinicName,
    address: merged.address,
    phone: merged.phone,
    secondaryPhone: merged.secondaryPhone,
    email: merged.email,
    emergencyContact: merged.emergencyContact,
    googleMapsUrl: merged.googleMapsUrl,
    logoUrl: merged.logoUrl,
    socialLinks: merged.socialLinks,
    footerLinks: merged.footerLinks,
    defaultDoctorId: merged.defaultDoctorId,
    isActive: merged.isActive,
  });

  if (!parsed.success) {
    throw new ValidationError(
      "Invalid clinic settings",
      parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "root",
        message: issue.message,
      })),
    );
  }

  if (input.defaultDoctorId !== undefined) {
    await assertBookableDoctor(
      merged.defaultDoctorId ? String(merged.defaultDoctorId) : null,
    );
  }

  const updated = await ClinicSettings.findOneAndUpdate(
    { clinicKey: CLINIC_SETTINGS_KEY, deletedAt: null },
    {
      $set: {
        clinicName: merged.clinicName,
        address: merged.address,
        phone: merged.phone,
        secondaryPhone: merged.secondaryPhone,
        email: merged.email,
        emergencyContact: merged.emergencyContact,
        googleMapsUrl: merged.googleMapsUrl,
        logoUrl: merged.logoUrl,
        socialLinks: merged.socialLinks,
        footerLinks: merged.footerLinks,
        defaultDoctorId: merged.defaultDoctorId
          ? new Types.ObjectId(String(merged.defaultDoctorId))
          : null,
        isActive: merged.isActive,
        updatedByUserId: new Types.ObjectId(updatedByUserId),
      },
    },
    { new: true },
  ).lean<LeanClinicSettings>();

  if (!updated) {
    throw new ConflictError("Unable to update clinic settings");
  }

  return normalizeClinicSettings(updated);
}
