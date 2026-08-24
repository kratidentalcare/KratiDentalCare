import type { Model, Types } from "mongoose";

import type { MedicineStatus } from "@/constants/statuses";
import type {
  LeanSoftDeleteDocument,
  SoftDeleteDocument,
  SoftDeleteQueryHelpers,
} from "@/models/base";

/**
 * Medicine library catalog row (admin-managed defaults for prescriptions).
 */
export type MedicineFields = {
  name: string;
  genericName: string | null;
  normalizedName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  notes: string | null;
  status: MedicineStatus;
  createdByUserId: Types.ObjectId;
  updatedByUserId: Types.ObjectId;
};

export type MedicineDocument = SoftDeleteDocument & MedicineFields;

export type LeanMedicine = LeanSoftDeleteDocument & MedicineFields;

export type MedicineModel = Model<MedicineDocument, SoftDeleteQueryHelpers>;
