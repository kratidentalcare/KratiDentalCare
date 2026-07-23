import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import { DEFAULT_ADDRESS_COUNTRY } from "@/constants/patient";
import {
  APPOINTMENT_DURATION_MINUTES,
  DEFAULT_APPOINTMENT_DURATION_MINUTES,
  DEFAULT_CLINIC_CLOSING_TIME,
  DEFAULT_CLINIC_OPENING_TIME,
  DEFAULT_CLINIC_TIMEZONE,
  DEFAULT_WORKING_DAYS,
  TIME_OF_DAY_PATTERN,
  WEEKDAY_VALUES,
} from "@/constants/scheduling";
import { CLINIC_SETTINGS_KEY } from "@/constants/app";
import { createBaseSchema } from "@/models/base/create-schema";
import {
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base/validators";
import { DOCTOR_MODEL_NAME } from "@/models/doctor";
import { USER_MODEL_NAME } from "@/models/user/constants";

export const CLINIC_SETTINGS_MODEL_NAME = "ClinicSettings";

const CLINIC_NAME_MAX = 160;
const PHONE_MAX = 20;
const EMAIL_MAX = 320;
const LOGO_URL_MAX = 2048;
const URL_MAX = 2048;
const TIMEZONE_MAX = 64;
const BREAK_LABEL_MAX = 80;
const ADDRESS_LINE_MAX = 200;
const CITY_MAX = 100;
const STATE_MAX = 100;
const POSTAL_MAX = 20;
const COUNTRY_MAX = 2;
const MAX_BREAKS = 12;
const FOOTER_LINK_LABEL_MAX = 80;
const MAX_FOOTER_LINKS = 40;

const FOOTER_LINK_GROUPS = ["quickLinks", "services"] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]+$/;

function isSafeHttpsUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeFooterUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return !/^\/(javascript|data):/i.test(value);
  }
  return isSafeHttpsUrl(value);
}

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

const addressSubSchema = new Schema(
  {
    line1: {
      type: String,
      required: [true, "address.line1 is required"],
      trim: true,
      maxlength: [ADDRESS_LINE_MAX, "address.line1 is too long"],
    },
    line2: {
      type: String,
      default: null,
      trim: true,
      maxlength: [ADDRESS_LINE_MAX, "address.line2 is too long"],
      set: emptyToNull,
    },
    city: {
      type: String,
      required: [true, "address.city is required"],
      trim: true,
      maxlength: [CITY_MAX, "address.city is too long"],
    },
    state: {
      type: String,
      required: [true, "address.state is required"],
      trim: true,
      maxlength: [STATE_MAX, "address.state is too long"],
    },
    postalCode: {
      type: String,
      required: [true, "address.postalCode is required"],
      trim: true,
      maxlength: [POSTAL_MAX, "address.postalCode is too long"],
    },
    country: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: [COUNTRY_MAX, "address.country is too long"],
      default: DEFAULT_ADDRESS_COUNTRY,
    },
  },
  { _id: false },
);

const breakWindowSchema = new Schema(
  {
    startTime: {
      type: String,
      required: [true, "breaks.startTime is required"],
      trim: true,
      validate: {
        validator(value: string) {
          return TIME_OF_DAY_PATTERN.test(value);
        },
        message: "breaks.startTime must be HH:mm (24h)",
      },
    },
    endTime: {
      type: String,
      required: [true, "breaks.endTime is required"],
      trim: true,
      validate: {
        validator(value: string) {
          return TIME_OF_DAY_PATTERN.test(value);
        },
        message: "breaks.endTime must be HH:mm (24h)",
      },
    },
    label: {
      type: String,
      default: null,
      trim: true,
      maxlength: [BREAK_LABEL_MAX, "breaks.label is too long"],
      set: emptyToNull,
    },
  },
  { _id: false },
);

const bookingRulesSchema = new Schema(
  {
    minLeadTimeHours: {
      type: Number,
      required: true,
      min: [0, "minLeadTimeHours cannot be negative"],
      max: [168, "minLeadTimeHours is too large"],
      default: 0,
    },
    maxAdvanceDays: {
      type: Number,
      required: true,
      min: [1, "maxAdvanceDays must be at least 1"],
      max: [365, "maxAdvanceDays is too large"],
      default: 60,
    },
    cancellationCutoffHours: {
      type: Number,
      required: true,
      min: [0, "cancellationCutoffHours cannot be negative"],
      max: [168, "cancellationCutoffHours is too large"],
      default: 2,
    },
    allowSameDayBooking: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { _id: false },
);

const socialLinksSchema = new Schema(
  {
    facebook: {
      type: String,
      default: null,
      trim: true,
      maxlength: [URL_MAX, "socialLinks.facebook is too long"],
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          return value == null || isSafeHttpsUrl(value);
        },
        message: "socialLinks.facebook must be a valid https URL",
      },
    },
    instagram: {
      type: String,
      default: null,
      trim: true,
      maxlength: [URL_MAX, "socialLinks.instagram is too long"],
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          return value == null || isSafeHttpsUrl(value);
        },
        message: "socialLinks.instagram must be a valid https URL",
      },
    },
    twitter: {
      type: String,
      default: null,
      trim: true,
      maxlength: [URL_MAX, "socialLinks.twitter is too long"],
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          return value == null || isSafeHttpsUrl(value);
        },
        message: "socialLinks.twitter must be a valid https URL",
      },
    },
    youtube: {
      type: String,
      default: null,
      trim: true,
      maxlength: [URL_MAX, "socialLinks.youtube is too long"],
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          return value == null || isSafeHttpsUrl(value);
        },
        message: "socialLinks.youtube must be a valid https URL",
      },
    },
  },
  { _id: false },
);

const footerLinkSchema = new Schema(
  {
    label: {
      type: String,
      required: [true, "footerLinks.label is required"],
      trim: true,
      maxlength: [FOOTER_LINK_LABEL_MAX, "footerLinks.label is too long"],
    },
    url: {
      type: String,
      required: [true, "footerLinks.url is required"],
      trim: true,
      maxlength: [URL_MAX, "footerLinks.url is too long"],
      validate: {
        validator(value: string) {
          return isSafeFooterUrl(value);
        },
        message:
          "footerLinks.url must be an internal path (/…) or https URL",
      },
    },
    group: {
      type: String,
      required: [true, "footerLinks.group is required"],
      enum: {
        values: [...FOOTER_LINK_GROUPS],
        message: "`{VALUE}` is not a supported footer link group",
      },
    },
    displayOrder: {
      type: Number,
      required: true,
      min: [0, "footerLinks.displayOrder cannot be negative"],
      max: [9999, "footerLinks.displayOrder is too large"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { _id: false },
);

/**
 * Operational clinic settings schema.
 * Collection: `clinic_settings`
 */
export const clinicSettingsSchema = createBaseSchema(
  {
    clinicKey: {
      type: String,
      required: [true, "clinicKey is required"],
      trim: true,
      lowercase: true,
      maxlength: [64, "clinicKey is too long"],
      default: CLINIC_SETTINGS_KEY,
    },
    clinicName: {
      type: String,
      required: [true, "clinicName is required"],
      trim: true,
      maxlength: [CLINIC_NAME_MAX, "clinicName is too long"],
    },
    address: {
      type: addressSubSchema,
      required: [true, "address is required"],
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
      trim: true,
      maxlength: [PHONE_MAX, "phone is too long"],
      validate: {
        validator(value: string) {
          return value.length >= 7 && PHONE_PATTERN.test(value);
        },
        message: "phone must be a valid phone number",
      },
    },
    secondaryPhone: {
      type: String,
      default: null,
      trim: true,
      maxlength: [PHONE_MAX, "secondaryPhone is too long"],
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          if (value == null) return true;
          return value.length >= 7 && PHONE_PATTERN.test(value);
        },
        message: "secondaryPhone must be a valid phone number",
      },
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      maxlength: [EMAIL_MAX, "email is too long"],
      validate: {
        validator(value: string) {
          return EMAIL_PATTERN.test(value);
        },
        message: "email must be a valid email address",
      },
    },
    emergencyContact: {
      type: String,
      default: null,
      trim: true,
      maxlength: [PHONE_MAX, "emergencyContact is too long"],
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          if (value == null) return true;
          return value.length >= 7 && PHONE_PATTERN.test(value);
        },
        message: "emergencyContact must be a valid phone number",
      },
    },
    googleMapsUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: [URL_MAX, "googleMapsUrl is too long"],
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          return value == null || isSafeHttpsUrl(value);
        },
        message: "googleMapsUrl must be a valid https URL",
      },
    },
    logoUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: [LOGO_URL_MAX, "logoUrl is too long"],
      set: emptyToNull,
    },
    socialLinks: {
      type: socialLinksSchema,
      required: true,
      default: () => ({}),
    },
    footerLinks: {
      type: [footerLinkSchema],
      required: true,
      default: [],
      validate: {
        validator(value: unknown[]) {
          return Array.isArray(value) && value.length <= MAX_FOOTER_LINKS;
        },
        message: `footerLinks cannot exceed ${MAX_FOOTER_LINKS}`,
      },
    },
    timezone: {
      type: String,
      required: [true, "timezone is required"],
      trim: true,
      maxlength: [TIMEZONE_MAX, "timezone is too long"],
      default: DEFAULT_CLINIC_TIMEZONE,
    },
    workingDays: {
      type: [String],
      required: true,
      enum: {
        values: [...WEEKDAY_VALUES],
        message: "`{VALUE}` is not a supported weekday",
      },
      default: [...DEFAULT_WORKING_DAYS],
      validate: {
        validator(value: string[]) {
          return (
            Array.isArray(value) &&
            value.length >= 1 &&
            value.length <= 7 &&
            new Set(value).size === value.length
          );
        },
        message: "workingDays must contain 1–7 unique weekdays",
      },
    },
    openingTime: {
      type: String,
      required: [true, "openingTime is required"],
      trim: true,
      default: DEFAULT_CLINIC_OPENING_TIME,
      validate: {
        validator(value: string) {
          return TIME_OF_DAY_PATTERN.test(value);
        },
        message: "openingTime must be HH:mm (24h)",
      },
    },
    closingTime: {
      type: String,
      required: [true, "closingTime is required"],
      trim: true,
      default: DEFAULT_CLINIC_CLOSING_TIME,
      validate: {
        validator(value: string) {
          return TIME_OF_DAY_PATTERN.test(value);
        },
        message: "closingTime must be HH:mm (24h)",
      },
    },
    appointmentDurationMinutes: {
      type: Number,
      required: true,
      enum: {
        values: [...APPOINTMENT_DURATION_MINUTES],
        message: "`{VALUE}` is not a supported appointment duration",
      },
      default: DEFAULT_APPOINTMENT_DURATION_MINUTES,
    },
    breaks: {
      type: [breakWindowSchema],
      required: true,
      default: [],
      validate: {
        validator(value: unknown[]) {
          return Array.isArray(value) && value.length <= MAX_BREAKS;
        },
        message: `breaks cannot exceed ${MAX_BREAKS}`,
      },
    },
    bookingRules: {
      type: bookingRulesSchema,
      required: true,
      default: () => ({}),
    },
    defaultDoctorId: {
      type: Schema.Types.ObjectId,
      ref: DOCTOR_MODEL_NAME,
      default: null,
      validate: {
        validator(value: unknown) {
          if (value == null) {
            return true;
          }
          return objectIdPathValidator(value);
        },
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    updatedByUserId: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      default: null,
      validate: {
        validator(value: unknown) {
          if (value == null) {
            return true;
          }
          return objectIdPathValidator(value);
        },
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: true,
    collection: "clinic_settings",
  },
);

clinicSettingsSchema.pre("validate", function validateScheduleWindows() {
  const openingTime = this.get("openingTime") as string | undefined;
  const closingTime = this.get("closingTime") as string | undefined;
  const timezone = this.get("timezone") as string | undefined;
  const breaks = this.get("breaks") as
    | Array<{ startTime: string; endTime: string }>
    | undefined;

  if (timezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch {
      this.invalidate("timezone", "timezone must be a valid IANA identifier");
    }
  }

  if (
    openingTime &&
    closingTime &&
    TIME_OF_DAY_PATTERN.test(openingTime) &&
    TIME_OF_DAY_PATTERN.test(closingTime)
  ) {
    const openMins = timeToMinutes(openingTime);
    const closeMins = timeToMinutes(closingTime);
    if (closeMins <= openMins) {
      this.invalidate("closingTime", "closingTime must be after openingTime");
    }

    if (Array.isArray(breaks)) {
      const normalized = breaks.map((item, index) => ({
        index,
        start: timeToMinutes(item.startTime),
        end: timeToMinutes(item.endTime),
      }));

      for (const item of normalized) {
        if (item.end <= item.start) {
          this.invalidate(
            `breaks.${item.index}.endTime`,
            "break endTime must be after startTime",
          );
          continue;
        }
        if (item.start < openMins || item.end > closeMins) {
          this.invalidate(
            `breaks.${item.index}.startTime`,
            "breaks must fall within opening and closing times",
          );
        }
      }

      for (let i = 0; i < normalized.length; i += 1) {
        for (let j = i + 1; j < normalized.length; j += 1) {
          if (
            rangesOverlap(
              normalized[i].start,
              normalized[i].end,
              normalized[j].start,
              normalized[j].end,
            )
          ) {
            this.invalidate(
              `breaks.${j}.startTime`,
              "breaks must not overlap",
            );
          }
        }
      }
    }
  }

});

clinicSettingsSchema.index(
  { clinicKey: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

clinicSettingsSchema.index({ updatedByUserId: 1, updatedAt: -1 });
