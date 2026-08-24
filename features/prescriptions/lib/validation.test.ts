import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GENDERS } from "@/constants/patient";
import { sanitizeMedicalHistoryForSave } from "@/features/prescriptions/lib/medical-history";
import { prescriptionFormSchema } from "@/validators/prescription";

const baseValidPayload = {
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
};

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
    const parsed = prescriptionFormSchema.safeParse(baseValidPayload);
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.medications[0]?.medicineName, "Amoxicillin");
      assert.equal(parsed.data.followUpDate, "2026-07-25");
    }
  });

  it("accepts optional medicineId for catalog provenance", () => {
    const parsed = prescriptionFormSchema.safeParse({
      ...baseValidPayload,
      medications: [
        {
          ...baseValidPayload.medications[0],
          medicineId: "507f1f77bcf86cd799439011",
          genericName: "Amoxicillin",
        },
      ],
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(
        parsed.data.medications[0]?.medicineId,
        "507f1f77bcf86cd799439011",
      );
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

  it("accepts medical history with all flags false (legacy-compatible)", () => {
    const parsed = prescriptionFormSchema.safeParse({
      ...baseValidPayload,
      medicalHistory: {
        takingMedication: false,
        pregnant: false,
        nursing: false,
        panMasala: false,
        tobacco: false,
        smoking: false,
        hasAllergy: false,
      },
    });
    assert.equal(parsed.success, true);
  });

  it("requires current medication when takingMedication is Yes", () => {
    const parsed = prescriptionFormSchema.safeParse({
      ...baseValidPayload,
      medicalHistory: {
        takingMedication: true,
        currentMedication: "",
      },
    });
    assert.equal(parsed.success, false);
  });

  it("accepts current medication when takingMedication is Yes", () => {
    const parsed = prescriptionFormSchema.safeParse({
      ...baseValidPayload,
      medicalHistory: {
        takingMedication: true,
        currentMedication: "Metformin 500 mg",
      },
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(
        parsed.data.medicalHistory?.currentMedication,
        "Metformin 500 mg",
      );
    }
  });

  it("requires due date when pregnant is Yes", () => {
    const parsed = prescriptionFormSchema.safeParse({
      ...baseValidPayload,
      medicalHistory: {
        pregnant: true,
        dueDate: null,
      },
    });
    assert.equal(parsed.success, false);
  });

  it("requires cigarettes per day when smoking is Yes", () => {
    const parsed = prescriptionFormSchema.safeParse({
      ...baseValidPayload,
      medicalHistory: {
        smoking: true,
        cigarettesPerDay: null,
      },
    });
    assert.equal(parsed.success, false);
  });

  it("requires allergy name when hasAllergy is Yes", () => {
    const parsed = prescriptionFormSchema.safeParse({
      ...baseValidPayload,
      medicalHistory: {
        hasAllergy: true,
        allergyName: "",
      },
    });
    assert.equal(parsed.success, false);
  });

  it("accepts a fully populated meaningful medical history", () => {
    const parsed = prescriptionFormSchema.safeParse({
      ...baseValidPayload,
      medicalHistory: {
        takingMedication: true,
        currentMedication: "Metformin 500 mg",
        pregnant: true,
        dueDate: "2026-08-15",
        nursing: true,
        panMasala: false,
        tobacco: true,
        smoking: true,
        cigarettesPerDay: 5,
        hasAllergy: true,
        allergyName: "Penicillin",
      },
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.medicalHistory?.cigarettesPerDay, 5);
      assert.equal(parsed.data.medicalHistory?.dueDate, "2026-08-15");
    }
  });
});

describe("sanitizeMedicalHistoryForSave", () => {
  it("clears dependent fields when flags are No", () => {
    const saved = sanitizeMedicalHistoryForSave(
      {
        takingMedication: false,
        currentMedication: "Should clear",
        pregnant: false,
        dueDate: "2026-08-15",
        nursing: false,
        panMasala: false,
        tobacco: false,
        smoking: false,
        cigarettesPerDay: 10,
        hasAllergy: false,
        allergyName: "Penicillin",
      },
      GENDERS.FEMALE,
      () => new Date("2026-08-15T12:00:00.000Z"),
    );

    assert.equal(saved?.currentMedication, null);
    assert.equal(saved?.dueDate, null);
    assert.equal(saved?.cigarettesPerDay, null);
    assert.equal(saved?.allergyName, null);
  });

  it("clears pregnancy and nursing for non-female patients", () => {
    const saved = sanitizeMedicalHistoryForSave(
      {
        takingMedication: false,
        currentMedication: null,
        pregnant: true,
        dueDate: "2026-08-15",
        nursing: true,
        panMasala: false,
        tobacco: false,
        smoking: false,
        cigarettesPerDay: null,
        hasAllergy: false,
        allergyName: null,
      },
      GENDERS.MALE,
      () => new Date("2026-08-15T12:00:00.000Z"),
    );

    assert.equal(saved?.pregnant, false);
    assert.equal(saved?.nursing, false);
    assert.equal(saved?.dueDate, null);
  });
});
