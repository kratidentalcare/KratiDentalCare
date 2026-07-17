import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { prescriptionFormSchema } from "@/validators/prescription";

describe("prescriptionFormSchema", () => {
  it("requires diagnosis and at least one medicine", () => {
    const parsed = prescriptionFormSchema.safeParse({
      appointmentId: "507f1f77bcf86cd799439011",
      diagnosis: "",
      medications: [],
    });
    assert.equal(parsed.success, false);
  });

  it("accepts a valid issued prescription payload", () => {
    const parsed = prescriptionFormSchema.safeParse({
      appointmentId: "507f1f77bcf86cd799439011",
      chiefComplaint: "Tooth pain",
      diagnosis: "Irreversible pulpitis",
      clinicalNotes: "Tenderness on percussion",
      advice: "Avoid hard foods",
      followUpDate: "2026-07-25",
      medications: [
        {
          medicineName: "Amoxicillin",
          dosage: "500mg",
          frequency: "TDS",
          duration: "5 days",
          instructions: "After food",
        },
      ],
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.medications[0]?.medicineName, "Amoxicillin");
      assert.equal(parsed.data.followUpDate, "2026-07-25");
    }
  });

  it("rejects incomplete medicine rows", () => {
    const parsed = prescriptionFormSchema.safeParse({
      appointmentId: "507f1f77bcf86cd799439011",
      diagnosis: "Gingivitis",
      medications: [
        {
          medicineName: "Chlorhexidine",
          dosage: "",
          frequency: "BD",
          duration: "7 days",
        },
      ],
    });
    assert.equal(parsed.success, false);
  });
});
