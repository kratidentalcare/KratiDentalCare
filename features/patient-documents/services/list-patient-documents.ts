import "server-only";

import { Types } from "mongoose";

import { findPatientByIdOrThrow } from "@/features/patients/repositories/patient-repository";
import { connect } from "@/lib/db";
import { User, type LeanUser } from "@/models/user";
import { buildPaginationMeta } from "@/types/pagination";
import type { PatientDocumentListQuery } from "@/validators/patient-document";

import { mapPatientDocumentToListItem } from "../lib/map-document";
import { listPatientDocumentRecords } from "../repositories/document-repository";
import type { PatientDocumentListResult } from "../types";

export async function listPatientDocuments(
  query: PatientDocumentListQuery,
): Promise<PatientDocumentListResult> {
  await connect();
  await findPatientByIdOrThrow(query.patientId);

  const { items, total } = await listPatientDocumentRecords({
    patientId: query.patientId,
    type: query.type,
    search: query.search,
    page: query.page,
    limit: query.limit,
  });

  const uploaderIds = [
    ...new Set(items.map((item) => String(item.uploadedBy))),
  ].filter((id) => Types.ObjectId.isValid(id));

  const uploaders =
    uploaderIds.length > 0
      ? await User.find({
          _id: { $in: uploaderIds.map((id) => new Types.ObjectId(id)) },
        })
          .select("firstName lastName email")
          .lean<LeanUser[]>()
      : [];

  const uploaderById = new Map(
    uploaders.map((user) => [String(user._id), user] as const),
  );

  const pagination = buildPaginationMeta(query.page, query.limit, total);
  const totalPages = Math.max(1, pagination.totalPages);

  return {
    items: items.map((item) =>
      mapPatientDocumentToListItem(
        item,
        uploaderById.get(String(item.uploadedBy)) ?? null,
      ),
    ),
    pagination: {
      ...pagination,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    },
  };
}
