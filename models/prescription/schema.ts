import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import {
  PRESCRIPTION_STATUSES,
  PRESCRIPTION_STATUS_VALUES,
} from "@/constants/statuses";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { APPOINTMENT_MODEL_NAME } from "@/models/appointment";
import { DOCTOR_MODEL_NAME } from "@/models/doctor";
import { PATIENT_MODEL_NAME } from "@/models/patient";
import { USER_MODEL_NAME } from "@/models/user";

export const PRESCRIPTION_MODEL_NAME = "Prescription";

const DIAGNOSIS_MAX = 1000;
const ADVICE_MAX = 5000;
const VOID_REASON_MAX = 1000;
const MED_NAME_MAX = 200;
const MED_FIELD_MAX = 200;
const PDF_URL_MAX = 2048;
const PDF_PUBLIC_ID_MAX = 512;
const RX_NUMBER_MAX = 40;
const SNAPSHOT_NAME_MAX = 120;
const SNAPSHOT_PHONE_MAX = 20;
const QUALIFICATION_MAX = 200;
const MAX_MEDICATIONS = 50;

const PHONE_PATTERN = /^[+]?[\d\s()-]+$/;
const RX_NUMBER_PATTERN = /^[A-Z0-9][A-Z0-9-_]*$/i;

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
}

const medicationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "medication.name is required"],
      trim: true,
      maxlength: [MED_NAME_MAX, "medication.name is too long"],
    },
    dosage: {
      type: String,
      required: [true, "medication.dosage is required"],
      trim: true,
      maxlength: [MED_FIELD_MAX, "medication.dosage is too long"],
    },
    frequency: {
      type: String,
      required: [true, "medication.frequency is required"],
      trim: true,
      maxlength: [MED_FIELD_MAX, "medication.frequency is too long"],
    },
    duration: {
      type: String,
      required: [true, "medication.duration is required"],
      trim: true,
      maxlength: [MED_FIELD_MAX, "medication.duration is too long"],
    },
    route: {
      type: String,
      default: null,
      trim: true,
      maxlength: [MED_FIELD_MAX, "medication.route is too long"],
      set: emptyToNull,
    },
    instructions: {
      type: String,
      default: null,
      trim: true,
      maxlength: [MED_FIELD_MAX, "medication.instructions are too long"],
      set: emptyToNull,
    },
    quantity: {
      type: String,
      default: null,
      trim: true,
      maxlength: [MED_FIELD_MAX, "medication.quantity is too long"],
      set: emptyToNull,
    },
  },
  { _id: false },
);

const patientSnapshotSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "patientSnapshot.fullName is required"],
      trim: true,
      maxlength: [SNAPSHOT_NAME_MAX, "patientSnapshot.fullName is too long"],
    },
    phone: {
      type: String,
      required: [true, "patientSnapshot.phone is required"],
      trim: true,
      maxlength: [SNAPSHOT_PHONE_MAX, "patientSnapshot.phone is too long"],
      validate: {
        validator(value: string) {
          return value.length >= 7 && PHONE_PATTERN.test(value);
        },
        message: "patientSnapshot.phone must be a valid phone number",
      },
    },
    ageYears: {
      type: Number,
      default: null,
      min: [0, "patientSnapshot.ageYears cannot be negative"],
      max: [150, "patientSnapshot.ageYears is unrealistically high"],
      validate: {
        validator(value: number | null) {
          if (value == null) {
            return true;
          }
          return Number.isInteger(value);
        },
        message: "patientSnapshot.ageYears must be an integer",
      },
    },
  },
  { _id: false },
);

const doctorSnapshotSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "doctorSnapshot.fullName is required"],
      trim: true,
      maxlength: [SNAPSHOT_NAME_MAX, "doctorSnapshot.fullName is too long"],
    },
    qualification: {
      type: String,
      default: null,
      trim: true,
      maxlength: [QUALIFICATION_MAX, "doctorSnapshot.qualification is too long"],
      set: emptyToNull,
    },
  },
  { _id: false },
);

/**
 * Prescription schema.
 * Collection: `prescriptions`
 */
export const prescriptionSchema = createBaseSchema(
  {
    prescriptionNumber: {
      type: String,
      required: [true, "prescriptionNumber is required"],
      trim: true,
      uppercase: true,
      maxlength: [RX_NUMBER_MAX, "prescriptionNumber is too long"],
      validate: {
        validator(value: string) {
          return RX_NUMBER_PATTERN.test(value);
        },
        message: "prescriptionNumber must be alphanumeric",
      },
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: PATIENT_MODEL_NAME,
      required: [true, "patientId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: DOCTOR_MODEL_NAME,
      required: [true, "doctorId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: APPOINTMENT_MODEL_NAME,
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
    status: {
      type: String,
      required: true,
      enum: {
        values: [...PRESCRIPTION_STATUS_VALUES],
        message: "`{VALUE}` is not a supported prescription status",
      },
      default: PRESCRIPTION_STATUSES.DRAFT,
    },
    diagnosis: {
      type: String,
      default: null,
      trim: true,
      maxlength: [DIAGNOSIS_MAX, "diagnosis is too long"],
      set: emptyToNull,
    },
    advice: {
      type: String,
      default: null,
      trim: true,
      maxlength: [ADVICE_MAX, "advice is too long"],
      set: emptyToNull,
    },
    medications: {
      type: [medicationSchema],
      default: [],
      validate: {
        validator(value: unknown[]) {
          return Array.isArray(value) && value.length <= MAX_MEDICATIONS;
        },
        message: `medications cannot exceed ${MAX_MEDICATIONS} items`,
      },
    },
    issuedAt: {
      type: Date,
      default: null,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    pdfUrl: {
      type: String,
      default: null,
      trim: true,
      maxlength: [PDF_URL_MAX, "pdfUrl is too long"],
      set: emptyToNull,
    },
    pdfPublicId: {
      type: String,
      default: null,
      trim: true,
      maxlength: [PDF_PUBLIC_ID_MAX, "pdfPublicId is too long"],
      set: emptyToNull,
    },
    patientSnapshot: {
      type: patientSnapshotSchema,
      required: [true, "patientSnapshot is required"],
    },
    doctorSnapshot: {
      type: doctorSnapshotSchema,
      required: [true, "doctorSnapshot is required"],
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: [true, "createdByUserId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    voidReason: {
      type: String,
      default: null,
      trim: true,
      maxlength: [VOID_REASON_MAX, "voidReason is too long"],
      set: emptyToNull,
    },
    voidedAt: {
      type: Date,
      default: null,
    },
    voidedByUserId: {
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
    supersedesPrescriptionId: {
      type: Schema.Types.ObjectId,
      ref: PRESCRIPTION_MODEL_NAME,
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
  } satisfies SchemaDefinition,
  {
    softDelete: true,
    isActive: false,
    collection: "prescriptions",
  },
);

prescriptionSchema.pre("validate", function validatePrescriptionInvariants(next) {
  const status = this.get("status") as string | undefined;
  const diagnosis = this.get("diagnosis") as string | null | undefined;
  const medications = this.get("medications") as unknown[] | undefined;
  const issuedAt = this.get("issuedAt") as Date | null | undefined;
  const validUntil = this.get("validUntil") as Date | null | undefined;
  const voidReason = this.get("voidReason") as string | null | undefined;
  const voidedAt = this.get("voidedAt") as Date | null | undefined;
  const voidedByUserId = this.get("voidedByUserId") as unknown;
  const patientSnapshot = this.get("patientSnapshot") as
    | { ageYears?: number | null }
    | undefined;

  const isPatientVisible =
    status === PRESCRIPTION_STATUSES.ISSUED ||
    status === PRESCRIPTION_STATUSES.AMENDED;

  if (isPatientVisible) {
    if (diagnosis == null || diagnosis.trim() === "") {
      this.invalidate(
        "diagnosis",
        "diagnosis is required when ISSUED or AMENDED",
      );
    }
    if (!Array.isArray(medications) || medications.length < 1) {
      this.invalidate(
        "medications",
        "at least one medication is required when ISSUED or AMENDED",
      );
    }
    if (issuedAt == null) {
      this.invalidate(
        "issuedAt",
        "issuedAt is required when ISSUED or AMENDED",
      );
    }
    if (patientSnapshot?.ageYears == null) {
      this.invalidate(
        "patientSnapshot.ageYears",
        "patientSnapshot.ageYears is required when ISSUED or AMENDED",
      );
    }
  }

  if (
    issuedAt instanceof Date &&
    validUntil instanceof Date &&
    !Number.isNaN(issuedAt.getTime()) &&
    !Number.isNaN(validUntil.getTime()) &&
    validUntil.getTime() < issuedAt.getTime()
  ) {
    this.invalidate("validUntil", "validUntil cannot be before issuedAt");
  }

  if (status === PRESCRIPTION_STATUSES.VOID) {
    if (voidReason == null || voidReason.trim() === "") {
      this.invalidate("voidReason", "voidReason is required when VOID");
    }
    if (voidedAt == null) {
      this.invalidate("voidedAt", "voidedAt is required when VOID");
    }
    if (voidedByUserId == null) {
      this.invalidate("voidedByUserId", "voidedByUserId is required when VOID");
    }
  }

  if (
    status !== PRESCRIPTION_STATUSES.VOID &&
    (voidedAt != null ||
      voidedByUserId != null ||
      (voidReason != null && voidReason !== ""))
  ) {
    this.invalidate(
      "voidReason",
      "void fields are only valid when status is VOID",
    );
  }

  if (
    status === PRESCRIPTION_STATUSES.AMENDED &&
    this.get("supersedesPrescriptionId") == null
  ) {
    this.invalidate(
      "supersedesPrescriptionId",
      "supersedesPrescriptionId is required when AMENDED",
    );
  }

  next();
});

prescriptionSchema.index(
  { prescriptionNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  },
);

prescriptionSchema.index({ patientId: 1, issuedAt: -1 });
prescriptionSchema.index({ doctorId: 1, issuedAt: -1 });
prescriptionSchema.index(
  { appointmentId: 1 },
  {
    sparse: true,
    partialFilterExpression: { appointmentId: { $type: "objectId" } },
  },
);
prescriptionSchema.index({ status: 1, updatedAt: -1 });
prescriptionSchema.index({ createdByUserId: 1, createdAt: -1 });
prescriptionSchema.index({ supersedesPrescriptionId: 1 });
