import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calculateAgeYears } from "@/features/prescriptions/lib/age";
import {
  formatAgeSexLabel,
  generatePrescriptionNumber,
} from "@/features/prescriptions/lib/format";
import { paginatePrescriptionSheets } from "@/features/prescriptions/lib/paginate-sheets";
import { GENDERS } from "@/constants/patient";

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
      opdLabel: "RX123",
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
      opdLabel: "RX123",
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
      opdLabel: "",
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
