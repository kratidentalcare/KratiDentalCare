import "server-only";

import type { ClientSession } from "mongoose";
import { Types as MongooseTypes } from "mongoose";

import { BOOKING_HOLD_STATUSES } from "@/features/appointments/lib/lifecycle";
import { phoneIdentityKeys } from "@/features/patients/lib/phone";
import { Appointment, type LeanAppointment } from "@/models/appointment";

export { buildActivePatientHold } from "@/features/appointments/lib/occupancy";

export type BlockingAppointmentLookup = {
  patientId: string;
  email?: string | null;
  phone?: string | null;
};

/**
 * Finds an open visit that should block a new public booking.
 * Matches the resolved patient chart and snapshot identity (email / phone).
 */
export async function findBlockingAppointmentForPatient(
  input: BlockingAppointmentLookup,
  session?: ClientSession,
): Promise<LeanAppointment | null> {
  const patientId = new MongooseTypes.ObjectId(input.patientId);
  const or: Record<string, unknown>[] = [{ patientId }];

  const email = input.email?.trim().toLowerCase();
  if (email) {
    or.push({ "patientSnapshot.email": email });
  }

  if (input.phone) {
    const keys = phoneIdentityKeys(input.phone);
    if (keys.length > 0) {
      or.push({ "patientSnapshot.phone": { $in: keys } });
    }
  }

  const query = Appointment.findOne({
    deletedAt: null,
    status: { $in: [...BOOKING_HOLD_STATUSES] },
    $or: or,
  }).sort({ startsAt: 1 });

  if (session) {
    query.session(session);
  }

  return query.lean<LeanAppointment>();
}
