import "server-only";

import { Types } from "mongoose";

import { APP_NAME, CLINIC_SETTINGS_KEY } from "@/constants/app";
import { DEFAULT_ADDRESS_COUNTRY } from "@/constants/patient";
import {
  DEFAULT_APPOINTMENT_DURATION_MINUTES,
  DEFAULT_CLINIC_CLOSING_TIME,
  DEFAULT_CLINIC_OPENING_TIME,
  DEFAULT_CLINIC_TIMEZONE,
  DEFAULT_WORKING_DAYS,
} from "@/constants/scheduling";
import { connect } from "@/lib/db";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import {
  ClinicSettings,
  type LeanClinicSettings,
} from "@/models/clinic-settings";
import {
  createClinicSettingsSchema,
  updateClinicAvailabilitySchema,
  type UpdateClinicAvailabilityInput,
} from "@/validators/clinic-settings";

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
  email: "clinic@kratidentalcare.com",
  logoUrl: null as string | null,
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
  updatedByUserId: null as string | null,
};

/**
 * Load the primary clinic settings singleton, creating defaults if missing.
 */
export async function getOrCreateClinicSettings(
  updatedByUserId?: string,
): Promise<LeanClinicSettings> {
  await connect();

  const existing = await ClinicSettings.findOne({
    clinicKey: CLINIC_SETTINGS_KEY,
  }).lean<LeanClinicSettings>();

  if (existing) {
    return existing;
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
    return created.toObject() as LeanClinicSettings;
  } catch (error) {
    // Concurrent first-write race — re-read the winner.
    const raced = await ClinicSettings.findOne({
      clinicKey: CLINIC_SETTINGS_KEY,
    }).lean<LeanClinicSettings>();
    if (raced) {
      return raced;
    }
    throw error;
  }
}

export async function getClinicSettingsOrThrow(): Promise<LeanClinicSettings> {
  await connect();
  const settings = await ClinicSettings.findOne({
    clinicKey: CLINIC_SETTINGS_KEY,
  }).lean<LeanClinicSettings>();

  if (!settings) {
    throw new NotFoundError("Clinic settings not found");
  }

  return settings;
}

/**
 * Update scheduling fields on the singleton after merge + Zod validation.
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
        isActive: merged.isActive,
        updatedByUserId: new Types.ObjectId(updatedByUserId),
      },
    },
    { new: true },
  ).lean<LeanClinicSettings>();

  if (!updated) {
    throw new ConflictError("Unable to update clinic settings");
  }

  return updated;
}
