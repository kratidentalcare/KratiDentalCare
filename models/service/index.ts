import "server-only";

import { getOrCreateModel } from "@/models/base";

import { SERVICE_MODEL_NAME, serviceSchema } from "./schema";
import type { ServiceDocument, ServiceModel } from "./types";

/**
 * Service (CMS) model — hot-reload safe via `getOrCreateModel`.
 * Distinct from domain `services/` business-logic modules.
 * Always `await connect()` from `@/lib/db` before querying.
 */
export const Service = getOrCreateModel<ServiceDocument>(
  SERVICE_MODEL_NAME,
  serviceSchema,
) as ServiceModel;

export type {
  LeanService,
  ServiceDocument,
  ServiceFields,
  ServiceModel,
} from "./types";
export { SERVICE_MODEL_NAME, serviceSchema } from "./schema";
