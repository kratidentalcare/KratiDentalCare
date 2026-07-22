import type { FilterQuery, Model, UpdateQuery } from "mongoose";

/**
 * Idempotent upsert helper: find by stable key, update in place, or insert.
 * Uses document `save()` so schema setters and pre-validate hooks run.
 */
export async function upsertOne<T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  data: UpdateQuery<T> | Record<string, unknown>,
): Promise<{ doc: T; created: boolean }> {
  const existing = await model.findOne(filter);

  if (existing) {
    existing.set({
      ...data,
      deletedAt: null,
    });
    const saved = await existing.save();
    return { doc: saved as T, created: false };
  }

  const created = await model.create({
    ...data,
    deletedAt: null,
  });
  return { doc: created as T, created: true };
}
