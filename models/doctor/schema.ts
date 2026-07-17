import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  CONSULTATION_DURATION_MINUTES,
  DEFAULT_CONSULTATION_DURATION_MINUTES,
  TIME_OF_DAY_PATTERN,
  WEEKDAY_VALUES,
} from "@/constants/doctor";
import {
  DOCTOR_STATUSES,
  DOCTOR_STATUS_VALUES,
} from "@/constants/statuses";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { USER_MODEL_NAME } from "@/models/user/constants";

const FULL_NAME_MAX = 120;
const SLUG_MAX = 120;
const SPECIALTY_MAX = 80;
const QUALIFICATION_MAX = 200;
const REGISTRATION_MAX = 64;
const BIO_MAX = 5000;
const LANGUAGE_MAX = 40;
const PHOTO_URL_MAX = 2048;
const MAX_SPECIALTIES = 20;
const MAX_LANGUAGES = 20;
const MAX_WORKING_DAYS = 7;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Doctor professional profile schema.
 * Collection: `doctors`
 */
export const doctorSchema = createBaseSchema(
  {
    userId: {
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
    fullName: {
      type: String,
      required: [true, "fullName is required"],
      trim: true,
      maxlength: [FULL_NAME_MAX, "fullName is too long"],
    },
    slug: {
      type: String,
      required: [true, "slug is required"],
      trim: true,
      lowercase: true,
      maxlength: [SLUG_MAX, "slug is too long"],
      unique: true,
      validate: {
        validator(value: string) {
          return SLUG_PATTERN.test(value);
        },
        message: "slug must be lowercase kebab-case",
      },
    },
    specialties: {
      type: [String],
      required: [true, "specialties are required"],
      validate: {
        validator(value: string[]) {
          return (
            Array.isArray(value) &&
            value.length >= 1 &&
            value.length <= MAX_SPECIALTIES &&
            value.every(
              (item) =>
                typeof item === "string" &&
                item.trim().length > 0 &&
                item.trim().length <= SPECIALTY_MAX,
            )
          );
        },
        message: `specialties must contain 1–${MAX_SPECIALTIES} non-empty values`,
      },
    },
    qualification: {
      type: String,
      default: null,
      trim: true,
      maxlength: [QUALIFICATION_MAX, "qualification is too long"],
      set: emptyToNull,
    },
    registrationNumber: {
      type: String,
      default: null,
      trim: true,
      maxlength: [REGISTRATION_MAX, "registrationNumber is too long"],
      set: emptyToNull,
    },
    yearsOfExperience: {
      type: Number,
      default: null,
      min: [0, "yearsOfExperience cannot be negative"],
      max: [80, "yearsOfExperience is unrealistically high"],
      validate: {
        validator(value: number | null) {
          if (value == null) {
            return true;
          }
          return Number.isInteger(value);
        },
        message: "yearsOfExperience must be an integer",
      },
    },
    consultationFee: {
      type: Number,
      default: null,
      min: [0, "consultationFee cannot be negative"],
    },
    bio: {
      type: String,
      default: null,
      trim: true,
      maxlength: [BIO_MAX, "bio is too long"],
      set: emptyToNull,
    },
    languages: {
      type: [String],
      default: [],
      validate: {
        validator(value: string[]) {
          return (
            Array.isArray(value) &&
            value.length <= MAX_LANGUAGES &&
            value.every(
              (item) =>
                typeof item === "string" &&
                item.trim().length > 0 &&
                item.trim().length <= LANGUAGE_MAX,
            )
          );
        },
        message: `languages must contain at most ${MAX_LANGUAGES} non-empty values`,
      },
    },
    workingDays: {
      type: [
        {
          type: String,
          enum: {
            values: [...WEEKDAY_VALUES],
            message: "`{VALUE}` is not a valid weekday",
          },
        },
      ],
      default: [
        WEEKDAY_VALUES[0],
        WEEKDAY_VALUES[1],
        WEEKDAY_VALUES[2],
        WEEKDAY_VALUES[3],
        WEEKDAY_VALUES[4],
      ],
      validate: {
        validator(value: string[]) {
          if (!Array.isArray(value) || value.length === 0) {
            return false;
          }
          if (value.length > MAX_WORKING_DAYS) {
            return false;
          }
          return new Set(value).size === value.length;
        },
        message: "workingDays must be a non-empty unique set of weekdays",
      },
    },
    consultationDuration: {
      type: Number,
      required: true,
      default: DEFAULT_CONSULTATION_DURATION_MINUTES,
      enum: {
        values: [...CONSULTATION_DURATION_MINUTES],
        message: "`{VALUE}` is not an allowed consultation duration",
      },
    },
    startTime: {
      type: String,
      required: true,
      default: "09:00",
      trim: true,
      validate: {
        validator(value: string) {
          return TIME_OF_DAY_PATTERN.test(value);
        },
        message: "startTime must be HH:mm (24h)",
      },
    },
    endTime: {
      type: String,
      required: true,
      default: "17:00",
      trim: true,
      validate: {
        validator(value: string) {
          return TIME_OF_DAY_PATTERN.test(value);
        },
        message: "endTime must be HH:mm (24h)",
      },
    },
    profilePhoto: {
      type: String,
      default: null,
      trim: true,
      maxlength: [PHOTO_URL_MAX, "profilePhoto URL is too long"],
      set: emptyToNull,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [...DOCTOR_STATUS_VALUES],
        message: "`{VALUE}` is not a supported doctor status",
      },
      default: DOCTOR_STATUSES.ACTIVE,
      index: true,
    },
    displayOrder: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "displayOrder cannot be negative"],
    },
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: true,
    collection: "doctors",
  },
);

doctorSchema.pre("validate", function ensureEndAfterStart() {
  const start = this.get("startTime") as string | undefined;
  const end = this.get("endTime") as string | undefined;

  if (
    typeof start === "string" &&
    typeof end === "string" &&
    TIME_OF_DAY_PATTERN.test(start) &&
    TIME_OF_DAY_PATTERN.test(end) &&
    timeToMinutes(end) <= timeToMinutes(start)
  ) {
    this.invalidate("endTime", "endTime must be after startTime");
  }
});

// Sparse unique: multiple doctors may exist without a portal user yet.
doctorSchema.index(
  { userId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { userId: { $type: "objectId" } },
  },
);

doctorSchema.index(
  { registrationNumber: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      registrationNumber: { $type: "string" },
    },
  },
);

doctorSchema.index({
  status: 1,
  isAvailable: 1,
  isActive: 1,
  displayOrder: 1,
});

doctorSchema.index({ specialties: 1, isActive: 1 });
