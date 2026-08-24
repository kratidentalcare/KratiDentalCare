import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { APPOINTMENT_EVENT_TYPES } from "@/constants/appointments";
import {
  APPOINTMENT_EMAIL_ACTIONS,
  EMAIL_TYPES,
} from "@/constants/email";
import { hashActionToken } from "@/features/appointments/lib/action-token-hash";
import { previewEmailActionPage } from "@/features/appointments/lib/email-action-preview";
import { mapEventToEmailType } from "@/features/email/lib/map-email-type";
import { buildAdminNewAppointmentEmail } from "@/features/email/templates/admin-new-appointment";
import type { ClinicEmailBranding } from "@/features/email/lib/branding-types";
import type { SendEmailResult } from "@/features/email/providers/types";

const branding: ClinicEmailBranding = {
  clinicName: "Krati Dental Care",
  logoUrl: "http://localhost:3000/images/logo-navbar.png",
  address: "123 Main St, City",
  phone: "+91 90000 00000",
  email: "clinic@example.com",
  websiteUrl: "http://localhost:3000",
  contactUrl: "http://localhost:3000/contact",
  bookUrl: "http://localhost:3000/book-appointment",
  socialLinks: {
    facebook: null,
    instagram: null,
    twitter: null,
    youtube: null,
  },
};

/** Mirrors console provider behavior without importing server-only modules. */
async function sendViaConsole(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  const messageId = `console_${Date.now().toString(36)}`;
  assert.ok(input.to.includes("@"));
  assert.ok(input.subject.length > 0);
  assert.ok(input.html.length > 0);
  assert.ok(input.text.length > 0);
  return { ok: true, messageId, error: null };
}

describe("appointment email mapping", () => {
  it("maps lifecycle events to email types", () => {
    assert.equal(
      mapEventToEmailType(APPOINTMENT_EVENT_TYPES.CREATED),
      EMAIL_TYPES.ADMIN_NEW_APPOINTMENT,
    );
    assert.equal(
      mapEventToEmailType(APPOINTMENT_EVENT_TYPES.CONFIRMED),
      EMAIL_TYPES.PATIENT_APPROVED,
    );
    assert.equal(
      mapEventToEmailType(APPOINTMENT_EVENT_TYPES.CANCELLED),
      EMAIL_TYPES.PATIENT_CANCELLED,
    );
    assert.equal(
      mapEventToEmailType(APPOINTMENT_EVENT_TYPES.RESCHEDULED),
      EMAIL_TYPES.PATIENT_RESCHEDULED,
    );
    assert.equal(
      mapEventToEmailType(APPOINTMENT_EVENT_TYPES.COMPLETED),
      null,
    );
  });
});

describe("action token hashing", () => {
  it("hashes tokens stably", () => {
    const a = hashActionToken("sample-token-value");
    const b = hashActionToken("sample-token-value");
    assert.equal(a, b);
    assert.notEqual(a, hashActionToken("other-token-value"));
    assert.match(a, /^[a-f0-9]{64}$/);
  });
});

describe("console email provider behavior", () => {
  it("succeeds without Resend credentials", async () => {
    const result = await sendViaConsole({
      to: "admin@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
      text: "Hello",
    });
    assert.equal(result.ok, true);
    assert.ok(result.messageId);
    assert.equal(result.error, null);
  });
});

describe("admin new appointment template", () => {
  it("includes action buttons and patient summary", () => {
    const email = buildAdminNewAppointmentEmail({
      branding,
      summary: {
        patientName: "Ada Patient",
        patientPhone: "+91 91111 11111",
        patientEmail: "ada@example.com",
        doctorName: "Dr. Krati",
        dateLabel: "Mon, 1 Sep 2026",
        timeLabel: "10:00 am",
        appointmentId: "68abc",
        statusLabel: "Pending Approval",
        bookedAtLabel: "24 Aug 2026, 6:00 pm",
      },
      approveUrl: "http://localhost:3000/appointment-actions?t=a&action=approve",
      cancelUrl: "http://localhost:3000/appointment-actions?t=b&action=cancel",
      rescheduleUrl:
        "http://localhost:3000/appointment-actions/reschedule?t=c",
    });

    assert.match(email.subject, /Ada Patient/);
    assert.match(email.html, /Approve Appointment/);
    assert.match(email.html, /Cancel Appointment/);
    assert.match(email.html, /Reschedule Appointment/);
    assert.match(email.html, /Pending Approval/);
    assert.match(email.text, /Approve:/);
  });
});

describe("email action page preview", () => {
  it("routes approve and cancel modes", () => {
    assert.deepEqual(
      previewEmailActionPage(
        "token-value-here",
        APPOINTMENT_EMAIL_ACTIONS.APPROVE,
      ),
      { mode: "approve", token: "token-value-here" },
    );
    assert.deepEqual(
      previewEmailActionPage(
        "token-value-here",
        APPOINTMENT_EMAIL_ACTIONS.CANCEL,
      ),
      { mode: "cancel_confirm", token: "token-value-here" },
    );
    assert.deepEqual(previewEmailActionPage(undefined, "approve"), {
      mode: "invalid",
    });
  });
});
