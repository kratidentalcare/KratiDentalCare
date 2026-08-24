import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeMedicineName } from "@/features/medicines/lib/normalize-name";
import {
  createMedicineActionSchema,
  medicineListQuerySchema,
  searchMedicinesQuerySchema,
} from "@/validators/medicine";

describe("normalizeMedicineName", () => {
  it("treats spaced and unspaced dose units as the same name", () => {
    assert.equal(
      normalizeMedicineName("Amoxicillin 500 mg"),
      normalizeMedicineName("amoxicillin 500mg"),
    );
    assert.equal(normalizeMedicineName("Amoxicillin 500 mg"), "amoxicillin 500mg");
  });

  it("collapses extra whitespace without merging distinct strengths", () => {
    assert.equal(normalizeMedicineName("  Amoxicillin   500  mg "), "amoxicillin 500mg");
    assert.notEqual(
      normalizeMedicineName("Amoxicillin 500 mg"),
      normalizeMedicineName("Amoxicillin 250 mg"),
    );
  });
});

describe("medicine Zod schemas", () => {
  it("requires name, dosage, frequency, and duration", () => {
    const parsed = createMedicineActionSchema.safeParse({
      name: "Amoxicillin 500 mg",
      dosage: "",
      frequency: "1-0-1",
      duration: "5 Days",
    });
    assert.equal(parsed.success, false);
  });

  it("accepts optional generic name, instructions, and notes", () => {
    const parsed = createMedicineActionSchema.safeParse({
      name: "Amoxicillin 500 mg",
      genericName: "Amoxicillin",
      dosage: "1 Capsule",
      frequency: "1-0-1",
      duration: "5 Days",
      instructions: "After food",
      notes: "Common dental antibiotic",
    });
    assert.equal(parsed.success, true);
  });

  it("defaults list status to all and search query to empty", () => {
    const list = medicineListQuerySchema.parse({});
    assert.equal(list.status, "all");
    const search = searchMedicinesQuerySchema.parse({});
    assert.equal(search.query, "");
    assert.equal(search.limit, 10);
  });
});
