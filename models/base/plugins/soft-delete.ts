import type { Aggregate, HydratedDocument, Query, Schema } from "mongoose";

import { DB_FIELDS } from "@/constants/db";

const DELETED_AT_PATH = DB_FIELDS.DELETED_AT;

type QueryWithSoftDeleteHelpers = Query<unknown, unknown> & {
  withDeleted(): QueryWithSoftDeleteHelpers;
  onlyDeleted(): QueryWithSoftDeleteHelpers;
};

function shouldBypassSoftDeleteFilter(query: Query<unknown, unknown>): boolean {
  const options = query.getOptions() as { withDeleted?: boolean };
  return options.withDeleted === true;
}

/**
 * Soft-delete plugin:
 * - Ensures `deletedAt` path exists
 * - Adds `softDelete` / `restore` / `isDeleted` document methods
 * - Adds `withDeleted` / `onlyDeleted` query helpers
 * - Default find/count/update/delete queries exclude soft-deleted rows
 * - Aggregations get a leading `$match` unless opted out
 *
 * Services may still apply additional `isActive` filters where required.
 */
export function softDeletePlugin(schema: Schema): void {
  if (!schema.path(DELETED_AT_PATH)) {
    schema.add({
      [DELETED_AT_PATH]: {
        type: Date,
        default: null,
        index: true,
      },
    });
  }

  schema.methods.isDeleted = function isDeleted(
    this: HydratedDocument<{ deletedAt: Date | null }>,
  ): boolean {
    return this.deletedAt != null;
  };

  schema.methods.softDelete = async function softDelete(
    this: HydratedDocument<{ deletedAt: Date | null }>,
  ) {
    if (this.deletedAt == null) {
      this.deletedAt = new Date();
      await this.save();
    }
    return this;
  };

  schema.methods.restore = async function restore(
    this: HydratedDocument<{ deletedAt: Date | null }>,
  ) {
    if (this.deletedAt != null) {
      this.deletedAt = null;
      await this.save();
    }
    return this;
  };

  const query = schema.query as QueryWithSoftDeleteHelpers &
    Record<string, unknown>;

  query.withDeleted = function withDeleted(this: QueryWithSoftDeleteHelpers) {
    this.setOptions({ withDeleted: true });
    return this;
  };

  query.onlyDeleted = function onlyDeleted(this: QueryWithSoftDeleteHelpers) {
    this.setOptions({ withDeleted: true });
    this.where({ [DELETED_AT_PATH]: { $ne: null } });
    return this;
  };

  const applyNotDeletedFilter = function (
    this: Query<unknown, unknown>,
  ): void {
    if (shouldBypassSoftDeleteFilter(this)) {
      return;
    }

    const conditions = this.getQuery() as Record<string, unknown>;
    if (DELETED_AT_PATH in conditions) {
      return;
    }

    this.where({ [DELETED_AT_PATH]: null });
  };

  const queryMiddlewareHooks = [
    "countDocuments",
    "find",
    "findOne",
    "findOneAndDelete",
    "findOneAndReplace",
    "findOneAndUpdate",
    "replaceOne",
    "updateOne",
    "updateMany",
    "deleteOne",
    "deleteMany",
  ] as const;

  for (const hook of queryMiddlewareHooks) {
    schema.pre(hook, applyNotDeletedFilter);
  }

  schema.pre("aggregate", function (this: Aggregate<unknown[]>) {
    const options = this.options as { withDeleted?: boolean } | undefined;
    if (options?.withDeleted) {
      return;
    }

    const pipeline = this.pipeline();
    const hasDeletedMatch = pipeline.some((stage) => {
      if (!stage || typeof stage !== "object" || !("$match" in stage)) {
        return false;
      }
      const match = stage.$match as Record<string, unknown>;
      return DELETED_AT_PATH in match;
    });

    if (!hasDeletedMatch) {
      pipeline.unshift({ $match: { [DELETED_AT_PATH]: null } });
    }
  });
}
