import "server-only";

import { Schema, type SchemaDefinition } from "mongoose";

import { PATIENT_DOCUMENT_TYPE_VALUES } from "@/constants/patient-documents";
import {
  createBaseSchema,
  OBJECT_ID_VALIDATOR_MESSAGE,
  objectIdPathValidator,
} from "@/models/base";
import { PATIENT_MODEL_NAME } from "@/models/patient";
import { USER_MODEL_NAME } from "@/models/user/constants";

import { PATIENT_DOCUMENT_MODEL_NAME } from "./constants";

const NAME_MAX = 200;
const DESCRIPTION_MAX = 2000;
const URL_MAX = 2048;
const PUBLIC_ID_MAX = 512;
const RESOURCE_TYPE_MAX = 32;
const MIME_MAX = 128;
const ORIGINAL_NAME_MAX = 255;

function emptyToNull(value: string | null): string | null {
  return value === "" ? null : value;
}

/**
 * Patient medical document metadata. Collection: `patient_documents`.
 * File bytes are stored in Cloudinary — only URLs / public IDs live here.
 */
export const patientDocumentSchema = createBaseSchema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: PATIENT_MODEL_NAME,
      required: [true, "patientId is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: [true, "uploadedBy is required"],
      validate: {
        validator: objectIdPathValidator,
        message: OBJECT_ID_VALIDATOR_MESSAGE,
      },
    },
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: [NAME_MAX, "name is too long"],
    },
    type: {
      type: String,
      required: [true, "type is required"],
      enum: {
        values: [...PATIENT_DOCUMENT_TYPE_VALUES],
        message: "`{VALUE}` is not a supported document type",
      },
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: [DESCRIPTION_MAX, "description is too long"],
      set: emptyToNull,
    },
    fileUrl: {
      type: String,
      required: [true, "fileUrl is required"],
      trim: true,
      maxlength: [URL_MAX, "fileUrl is too long"],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, "cloudinaryPublicId is required"],
      trim: true,
      maxlength: [PUBLIC_ID_MAX, "cloudinaryPublicId is too long"],
    },
    resourceType: {
      type: String,
      required: [true, "resourceType is required"],
      trim: true,
      maxlength: [RESOURCE_TYPE_MAX, "resourceType is too long"],
    },
    mimeType: {
      type: String,
      required: [true, "mimeType is required"],
      trim: true,
      maxlength: [MIME_MAX, "mimeType is too long"],
    },
    fileSize: {
      type: Number,
      required: [true, "fileSize is required"],
      min: [1, "fileSize must be positive"],
    },
    originalFileName: {
      type: String,
      default: null,
      trim: true,
      maxlength: [ORIGINAL_NAME_MAX, "originalFileName is too long"],
      set: emptyToNull,
    },
  } as SchemaDefinition,
  {
    softDelete: true,
    isActive: false,
    collection: "patient_documents",
  },
);

patientDocumentSchema.index({ patientId: 1, createdAt: -1 });
patientDocumentSchema.index({ cloudinaryPublicId: 1 });

export { PATIENT_DOCUMENT_MODEL_NAME };
