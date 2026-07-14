import "server-only";

/**
 * Soft-delete surface area for domain models.
 * Prefer importing plugin + filters from `@/models/base` barrel.
 */

export { softDeletePlugin } from "./plugins/soft-delete";

export {
  activeFilter,
  activeNotDeletedFilter,
  notDeletedFilter,
  onlyDeletedFilter,
  withActiveNotDeletedFilter,
  withNotDeletedFilter,
} from "./query-filters";
