import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  BLOOD_GROUP_VALUES,
  DEFAULT_ADDRESS_COUNTRY,
  EMERGENCY_CONTACT_RELATIONSHIP_VALUES,
  GENDER_VALUES,
} from "@/constants/patient";
import {
  PATIENT_STATUSES,
  PATIENT_STATUS_VALUES,
} from "@/constants/statuses";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { USER_MODEL_NAME } from "@/models/user";

const FULL_NAME_MAX = 120;
const PHONE_MAX = 20;
const EMAIL_MAX = 320;
const CONTACT_NAME_MAX = 120;
const ALLERGY_MAX = 120;
const CONDITION_MAX = 120;
const NOTES_MAX = 10_000;
const ADDRESS_LINE_MAX = 200;
const CITY_MAX = 100;
const STATE_MAX = 100;
const POSTAL_MAX = 20;
const COUNTRY_MAX = 2;
const MAX_ALLERGIES = 50;
const MAX_CONDITIONS = 50;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+]?[\d\s()-]+$/;

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
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
      maxlength: [COUNTRY_MAX, "address.country must be an ISO country code"],
      minlength: [COUNTRY_MAX, "address.country must be an ISO country code"],
      default: DEFAULT_ADDRESS_COUNTRY,
    },
  },
  { _id: false },
);

/**
 * Patient clinical / demographic schema.
 * Collection: `patients`
 */
export const patientSchema = createBaseSchema(
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
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      maxlength: [EMAIL_MAX, "email is too long"],
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          if (value == null) {
            return true;
          }
          return EMAIL_PATTERN.test(value);
        },
        message: "email must be a valid email address",
      },
    },
    gender: {
      type: String,
      default: null,
      enum: {
        values: [...GENDER_VALUES, null],
        message: "`{VALUE}` is not a supported gender",
      },
    },
    dateOfBirth: {
      type: Date,
      default: null,
      validate: {
        validator(value: Date | null) {
          if (value == null) {
            return true;
          }
          return value.getTime() <= Date.now();
        },
        message: "dateOfBirth cannot be in the future",
      },
    },
    bloodGroup: {
      type: String,
      default: null,
      enum: {
        values: [...BLOOD_GROUP_VALUES, null],
        message: "`{VALUE}` is not a supported blood group",
      },
    },
    address: {
      type: addressSubSchema,
      default: null,
    },
    emergencyContactName: {
      type: String,
      default: null,
      trim: true,
      maxlength: [CONTACT_NAME_MAX, "emergencyContactName is too long"],
      set: emptyToNull,
    },
    emergencyContactPhone: {
      type: String,
      default: null,
      trim: true,
      maxlength: [PHONE_MAX, "emergencyContactPhone is too long"],
      set: emptyToNull,
      validate: {
        validator(value: string | null) {
          if (value == null) {
            return true;
          }
          return value.length >= 7 && PHONE_PATTERN.test(value);
        },
        message: "emergencyContactPhone must be a valid phone number",
      },
    },
    relationship: {
      type: String,
      default: null,
      enum: {
        values: [...EMERGENCY_CONTACT_RELATIONSHIP_VALUES, null],
        message: "`{VALUE}` is not a supported relationship",
      },
    },
    allergies: {
      type: [String],
      default: [],
      validate: {
        validator(value: string[]) {
          return (
            Array.isArray(value) &&
            value.length <= MAX_ALLERGIES &&
            value.every(
              (item) =>
                typeof item === "string" &&
                item.trim().length > 0 &&
                item.trim().length <= ALLERGY_MAX,
            )
          );
        },
        message: `allergies must contain at most ${MAX_ALLERGIES} non-empty values`,
      },
    },
    chronicConditions: {
      type: [String],
      default: [],
      validate: {
        validator(value: string[]) {
          return (
            Array.isArray(value) &&
            value.length <= MAX_CONDITIONS &&
            value.every(
              (item) =>
                typeof item === "string" &&
                item.trim().length > 0 &&
                item.trim().length <= CONDITION_MAX,
            )
          );
        },
        message: `chronicConditions must contain at most ${MAX_CONDITIONS} non-empty values`,
      },
    },
    medicalNotes: {
      type: String,
      default: null,
      trim: true,
      maxlength: [NOTES_MAX, "medicalNotes is too long"],
      set: emptyToNull,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [...PATIENT_STATUS_VALUES],
        message: "`{VALUE}` is not a supported patient status",
      },
      default: PATIENT_STATUSES.ACTIVE,
      index: true,
    },
  } satisfies SchemaDefinition,
  {
    softDelete: true,
    isActive: true,
    collection: "patients",
  },
);

patientSchema.pre("validate", function ensureEmergencyContactConsistency(next) {
  const name = this.get("emergencyContactName") as string | null;
  const phone = this.get("emergencyContactPhone") as string | null;

  if ((name && !phone) || (!name && phone)) {
    this.invalidate(
      "emergencyContactPhone",
      "emergencyContactName and emergencyContactPhone must be provided together",
    );
  }

  next();
});

patientSchema.index(
  { userId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { userId: { $type: "objectId" } },
  },
);

patientSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { email: { $type: "string" } },
  },
);

patientSchema.index({ phone: 1 });
patientSchema.index({ fullName: 1, phone: 1 });
patientSchema.index({ status: 1, isActive: 1 });
patientSchema.index({ allergies: 1 });
