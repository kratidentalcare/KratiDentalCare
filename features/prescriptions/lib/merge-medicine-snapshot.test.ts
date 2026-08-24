import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mergeMedicineSnapshot } from "@/features/prescriptions/lib/merge-medicine-snapshot";

const formRow = {
  medicineId: "507f1f77bcf86cd799439011",
  medicineName: "Amoxicillin 500 mg",
  genericName: "Amoxicillin",
  dosage: "250 mg",
  frequency: "1-1-1",
  duration: "7 Days",
  instructions: "Before food",
};

describe("mergeMedicineSnapshot", () => {
  it("keeps doctor-edited clinical fields when a catalog id is valid", () => {
    const snapshot = mergeMedicineSnapshot(formRow, {
      id: "507f1f77bcf86cd799439011",
      genericName: "Amoxicillin trihydrate",
    });

    assert.equal(String(snapshot.medicineId), "507f1f77bcf86cd799439011");
    assert.equal(snapshot.name, "Amoxicillin 500 mg");
    assert.equal(snapshot.dosage, "250 mg");
    assert.equal(snapshot.frequency, "1-1-1");
    assert.equal(snapshot.duration, "7 Days");
    assert.equal(snapshot.instructions, "Before food");
    assert.equal(snapshot.genericName, "Amoxicillin");
  });

  it("stores custom medicines without a catalog id", () => {
    const snapshot = mergeMedicineSnapshot(
      {
        ...formRow,
        medicineId: null,
        medicineName: "Custom gel",
        genericName: null,
      },
      null,
    );

    assert.equal(snapshot.medicineId, null);
    assert.equal(snapshot.name, "Custom gel");
    assert.equal(snapshot.genericName, null);
  });

  it("drops a missing catalog id and still saves the form snapshot", () => {
    const snapshot = mergeMedicineSnapshot(formRow, null);

    assert.equal(snapshot.medicineId, null);
    assert.equal(snapshot.name, "Amoxicillin 500 mg");
    assert.equal(snapshot.dosage, "250 mg");
  });
});
