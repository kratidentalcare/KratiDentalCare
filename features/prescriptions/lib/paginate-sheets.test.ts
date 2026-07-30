import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calculateAgeYears } from "@/features/prescriptions/lib/age";
import {
  formatAgeSexLabel,
  generatePrescriptionNumber,
} from "@/features/prescriptions/lib/format";
import { buildMedicalHistoryBlocks } from "@/features/prescriptions/lib/medical-history";
import { paginatePrescriptionSheets } from "@/features/prescriptions/lib/paginate-sheets";
import { GENDERS } from "@/constants/patient";
import type { PrescriptionMedicalHistoryDto } from "@/features/prescriptions/types";

describe("calculateAgeYears", () => {
  it("returns whole years for a past birthday", () => {
    const dob = new Date("1990-01-15T00:00:00.000Z");
    const at = new Date("2020-01-15T00:00:00.000Z");
    assert.equal(calculateAgeYears(dob, at), 30);
  });

  it("returns null for missing date of birth", () => {
    assert.equal(calculateAgeYears(null), null);
  });

  it("decrements age before birthday in calendar year", () => {
    const dob = new Date("1990-06-15T00:00:00.000Z");
    const at = new Date("2020-01-15T00:00:00.000Z");
    assert.equal(calculateAgeYears(dob, at), 29);
  });
});

describe("formatAgeSexLabel", () => {
  it("formats age and gender short code", () => {
    assert.equal(formatAgeSexLabel(32, GENDERS.FEMALE), "32 / F");
  });

  it("uses placeholders when missing", () => {
    assert.equal(formatAgeSexLabel(null, null), "— / —");
  });
});

describe("generatePrescriptionNumber", () => {
  it("produces alphanumeric RX numbers", () => {
    const value = generatePrescriptionNumber(new Date("2026-07-18T00:00:00Z"));
    assert.match(value, /^RX20260718-[A-Z0-9]+$/);
  });
});

describe("buildMedicalHistoryBlocks", () => {
  it("returns empty for null or all-false history", () => {
    assert.deepEqual(buildMedicalHistoryBlocks(null), []);
    assert.deepEqual(
      buildMedicalHistoryBlocks({
        takingMedication: false,
        currentMedication: null,
        pregnant: false,
        dueDate: null,
        nursing: false,
        panMasala: false,
        tobacco: false,
        smoking: false,
        cigarettesPerDay: null,
        hasAllergy: false,
        allergyName: null,
      }),
      [],
    );
  });

  it("only emits meaningful Yes values", () => {
    const history: PrescriptionMedicalHistoryDto = {
      takingMedication: true,
      currentMedication: "Metformin 500 mg",
      pregnant: true,
      dueDate: "2026-08-15",
      nursing: true,
      panMasala: false,
      tobacco: true,
      smoking: true,
      cigarettesPerDay: 10,
      hasAllergy: true,
      allergyName: "Penicillin",
    };

    const blocks = buildMedicalHistoryBlocks(history);
    assert.equal(
      blocks.some((b) => b.kind === "kv"),
      true,
    );
    assert.equal(
      blocks.some((b) => b.kind === "pregnant"),
      true,
    );
    assert.equal(
      blocks.some((b) => b.kind === "nursing"),
      true,
    );
    assert.equal(
      blocks.some((b) => b.kind === "habits"),
      true,
    );
    assert.equal(
      blocks.some((b) => b.kind === "allergy"),
      true,
    );

    const habits = blocks.find((b) => b.kind === "habits");
    assert.ok(habits && habits.kind === "habits");
    assert.deepEqual(habits.items, [
      "Tobacco Chewing",
      "Smoking (10 Cigarettes/Day)",
    ]);
    assert.equal(habits.items.includes("Pan Masala Chewing"), false);
  });

  it("hides medication text when flag is false even if text exists", () => {
    const blocks = buildMedicalHistoryBlocks({
      takingMedication: false,
      currentMedication: "Should not print",
      pregnant: false,
      dueDate: "2026-08-15",
      nursing: false,
      panMasala: false,
      tobacco: false,
      smoking: false,
      cigarettesPerDay: 5,
      hasAllergy: false,
      allergyName: "Penicillin",
    });
    assert.deepEqual(blocks, []);
  });
});

describe("paginatePrescriptionSheets", () => {
  it("keeps a normal prescription on one A4 sheet", () => {
    const medications = Array.from({ length: 3 }, (_, index) => ({
      medicineName: `Medicine ${index + 1}`,
      dosage: "500 mg",
      frequency: "1-0-1",
      duration: "5 days",
      instructions: "After food",
    }));

    const sheets = paginatePrescriptionSheets({
      patientName: "Test Patient",
      ageSexLabel: "30 / M",
      dateLabel: "18 Jul 2026",
      mobileLabel: "+91 98765 43210",
      opdLabel: "RX123",
      medicalHistory: null,
      diagnosis: "Dental caries",
      chiefComplaint: "Pain while chewing",
      clinicalNotes: "Tenderness around the affected tooth",
      advice: "Warm saline rinse",
      followUpLabel: "Follow-up: 25 Jul 2026",
      medications,
      doctorName: "Dr Test",
      doctorQualification: "BDS",
      signatureLabel: "Doctor's Signature",
    });

    assert.equal(sheets.length, 1);
    assert.equal(sheets[0]?.showSignature, true);
    assert.deepEqual(sheets[0]?.medicalHistory, []);
  });

  it("places medical history before diagnosis and collapses empty history", () => {
    const sheets = paginatePrescriptionSheets({
      patientName: "Test Patient",
      ageSexLabel: "28 / F",
      dateLabel: "18 Jul 2026",
      mobileLabel: "+91 98765 43210",
      opdLabel: "RX123",
      medicalHistory: {
        takingMedication: true,
        currentMedication: "Metformin 500 mg",
        pregnant: true,
        dueDate: "2026-08-15",
        nursing: false,
        panMasala: false,
        tobacco: true,
        smoking: true,
        cigarettesPerDay: 5,
        hasAllergy: true,
        allergyName: "Penicillin",
      },
      diagnosis: "Dental caries",
      chiefComplaint: "",
      clinicalNotes: "",
      advice: "",
      followUpLabel: "",
      medications: [
        {
          medicineName: "Amoxicillin",
          dosage: "500 mg",
          frequency: "TDS",
          duration: "5 days",
          instructions: null,
        },
      ],
      doctorName: "Dr Test",
      doctorQualification: "BDS",
      signatureLabel: "Doctor's Signature",
    });

    assert.equal(sheets.length, 1);
    const sheet = sheets[0];
    assert.deepEqual(sheet?.medicalHistory, [
      { label: "Current Medication", value: "Metformin 500 mg" },
      { label: "Pregnant", value: "Yes (Due Date: 15 Aug 2026)" },
      {
        label: "Habits",
        value: "Tobacco Chewing, Smoking (5 Cigarettes/Day)",
      },
      { label: "Allergy", value: "Penicillin" },
    ]);
    assert.ok(sheet?.diagnosisLines[0]?.startsWith("Diagnosis:"));
  });

  it("keeps a compact 5-medicine Rx with light history on one sheet", () => {
    const medications = Array.from({ length: 5 }, (_, index) => ({
      medicineName: `Med ${index + 1}`,
      dosage: "1 tab",
      frequency: "BD",
      duration: "5 days",
      instructions: null,
    }));

    const sheets = paginatePrescriptionSheets({
      patientName: "Test Patient",
      ageSexLabel: "30 / M",
      dateLabel: "18 Jul 2026",
      mobileLabel: "+91 98765 43210",
      opdLabel: "RX123",
      medicalHistory: {
        takingMedication: false,
        currentMedication: null,
        pregnant: false,
        dueDate: null,
        nursing: false,
        panMasala: false,
        tobacco: true,
        smoking: false,
        cigarettesPerDay: null,
        hasAllergy: false,
        allergyName: null,
      },
      diagnosis: "",
      chiefComplaint: "",
      clinicalNotes: "",
      advice: "",
      followUpLabel: "",
      medications,
      doctorName: "Dr Test",
      doctorQualification: "BDS",
      signatureLabel: "Doctor's Signature",
    });

    assert.equal(sheets.length, 1);
    assert.equal(sheets[0]?.medications.length, 5);
    assert.deepEqual(sheets[0]?.medicalHistory, [
      { label: "Habits", value: "Tobacco Chewing" },
    ]);
  });

  it("fits a full history, all text sections and 6 medicines on one sheet", () => {
    const sheets = paginatePrescriptionSheets({
      patientName: "Test Patient",
      ageSexLabel: "28 / F",
      dateLabel: "30 Jul 2026",
      mobileLabel: "+91 98765 43210",
      opdLabel: "RX123",
      medicalHistory: {
        takingMedication: true,
        currentMedication: "Metformin 500mg",
        pregnant: true,
        dueDate: "2026-08-12",
        nursing: true,
        panMasala: false,
        tobacco: true,
        smoking: true,
        cigarettesPerDay: 5,
        hasAllergy: true,
        allergyName: "Penicillin",
      },
      diagnosis: "Irreversible pulpitis in tooth 46",
      chiefComplaint: "Pain while chewing on the lower right side",
      clinicalNotes: "Tenderness on percussion around the affected tooth",
      advice: "Warm saline rinse twice daily and avoid hard foods",
      followUpLabel: "Follow-up: 06 Aug 2026",
      medications: Array.from({ length: 6 }, (_, index) => ({
        medicineName: `Medicine ${index + 1}`,
        dosage: "500 mg",
        frequency: "1-0-1",
        duration: "5 days",
        instructions: "After food",
      })),
      doctorName: "Dr Test",
      doctorQualification: "BDS MDS",
      signatureLabel: "",
    });

    assert.equal(sheets.length, 1);
    assert.equal(sheets[0]?.medications.length, 6);
    assert.equal(sheets[0]?.followUpLabel, "Follow-up: 06 Aug 2026");
  });

  it("creates continuation pages for many medicines", () => {
    const medications = Array.from({ length: 20 }, (_, index) => ({
      medicineName: `Med ${index + 1}`,
      dosage: "1 tab",
      frequency: "BD",
      duration: "5 days",
      instructions: null,
    }));

    const sheets = paginatePrescriptionSheets({
      patientName: "Test Patient",
      ageSexLabel: "30 / M",
      dateLabel: "18 Jul 2026",
      mobileLabel: "+91 98765 43210",
      opdLabel: "RX123",
      medicalHistory: null,
      diagnosis: "Dental caries",
      chiefComplaint: "Pain",
      clinicalNotes: "",
      advice: "Warm saline rinse",
      followUpLabel: "Follow-up: 25 Jul 2026",
      medications,
      doctorName: "Dr Test",
      doctorQualification: "BDS",
      signatureLabel: "Doctor's Signature",
    });

    assert.ok(sheets.length > 1);
    assert.equal(sheets[0]?.isContinuation, false);
    assert.equal(sheets.at(-1)?.showSignature, true);
    assert.equal(
      sheets.reduce((sum, sheet) => sum + sheet.medications.length, 0),
      20,
    );
  });

  it("always returns at least one sheet", () => {
    const sheets = paginatePrescriptionSheets({
      patientName: "",
      ageSexLabel: "",
      dateLabel: "",
      mobileLabel: "",
      opdLabel: "",
      medicalHistory: null,
      diagnosis: "",
      chiefComplaint: "",
      clinicalNotes: "",
      advice: "",
      followUpLabel: "",
      medications: [],
      doctorName: "Dr Test",
      doctorQualification: null,
      signatureLabel: "Doctor's Signature",
    });
    assert.equal(sheets.length, 1);
  });
});
