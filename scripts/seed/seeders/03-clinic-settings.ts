import type { Types } from "mongoose";

import { APP_NAME, CLINIC_SETTINGS_KEY } from "@/constants/app";
import { FOOTER_LINK_GROUPS } from "@/constants/clinic-settings";
import { DEFAULT_ADDRESS_COUNTRY } from "@/constants/patient";
import { ROUTES } from "@/constants/routes";
import {
  DEFAULT_APPOINTMENT_DURATION_MINUTES,
  DEFAULT_CLINIC_CLOSING_TIME,
  DEFAULT_CLINIC_OPENING_TIME,
  DEFAULT_CLINIC_TIMEZONE,
  DEFAULT_WORKING_DAYS,
} from "@/constants/scheduling";
import { ClinicSettings } from "@/models/clinic-settings";

import type { SeedContext } from "../lib/context";
import { logOk } from "../lib/log";
import { upsertOne } from "../lib/upsert";

const FOOTER_LINKS = [
  {
    label: "Home",
    url: ROUTES.PUBLIC.HOME,
    group: FOOTER_LINK_GROUPS.QUICK_LINKS,
    displayOrder: 0,
    isActive: true,
  },
  {
    label: "Services",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.QUICK_LINKS,
    displayOrder: 1,
    isActive: true,
  },
  {
    label: "Doctors",
    url: ROUTES.PUBLIC.DOCTORS,
    group: FOOTER_LINK_GROUPS.QUICK_LINKS,
    displayOrder: 2,
    isActive: true,
  },
  {
    label: "Contact",
    url: ROUTES.PUBLIC.CONTACT,
    group: FOOTER_LINK_GROUPS.QUICK_LINKS,
    displayOrder: 3,
    isActive: true,
  },
  {
    label: "Book Appointment",
    url: ROUTES.PUBLIC.BOOK,
    group: FOOTER_LINK_GROUPS.QUICK_LINKS,
    displayOrder: 4,
    isActive: true,
  },
  {
    label: "General Dentistry",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 0,
    isActive: true,
  },
  {
    label: "Cosmetic Dentistry",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 1,
    isActive: true,
  },
  {
    label: "Root Canal",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 2,
    isActive: true,
  },
  {
    label: "Dental Implants",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 3,
    isActive: true,
  },
  {
    label: "Teeth Whitening",
    url: ROUTES.PUBLIC.SERVICES,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 4,
    isActive: true,
  },
  {
    label: "Emergency Care",
    url: ROUTES.PUBLIC.CONTACT,
    group: FOOTER_LINK_GROUPS.SERVICES,
    displayOrder: 5,
    isActive: true,
  },
] as const;

export async function seedClinicSettings(ctx: SeedContext): Promise<void> {
  const { doc } = await upsertOne(
    ClinicSettings,
    { clinicKey: CLINIC_SETTINGS_KEY },
    {
      clinicKey: CLINIC_SETTINGS_KEY,
      clinicName: APP_NAME,
      address: {
        line1: "12, Hazratganj Crossing",
        line2: "Near Capoor's Hotel",
        city: "Lucknow",
        state: "Uttar Pradesh",
        postalCode: "226001",
        country: DEFAULT_ADDRESS_COUNTRY,
      },
      phone: "+91 522 400 2000",
      secondaryPhone: "+91 98765 43210",
      email: "care@kratidentalcare.com",
      emergencyContact: "+91 522 400 2099",
      googleMapsUrl: "https://maps.google.com/?q=Hazratganj+Lucknow",
      logoUrl: null,
      socialLinks: {
        facebook: "https://www.facebook.com/kratidentalcare",
        instagram: "https://www.instagram.com/kratidentalcare",
        linkedin: null,
        youtube: null,
      },
      footerLinks: [...FOOTER_LINKS],
      timezone: DEFAULT_CLINIC_TIMEZONE,
      workingDays: [...DEFAULT_WORKING_DAYS],
      openingTime: DEFAULT_CLINIC_OPENING_TIME,
      closingTime: DEFAULT_CLINIC_CLOSING_TIME,
      appointmentDurationMinutes: DEFAULT_APPOINTMENT_DURATION_MINUTES,
      breaks: [
        {
          startTime: "13:00",
          endTime: "14:00",
          label: "Lunch",
        },
      ],
      bookingRules: {
        minLeadTimeHours: 0,
        maxAdvanceDays: 60,
        cancellationCutoffHours: 2,
        allowSameDayBooking: true,
      },
      defaultDoctorId: ctx.doctor._id,
      updatedByUserId: ctx.admin._id,
      isActive: true,
    },
  );

  ctx.clinic = doc.toObject() as SeedContext["clinic"];
  ctx.clinic._id = doc._id as Types.ObjectId;

  logOk("Clinic Settings Seeded");
}
