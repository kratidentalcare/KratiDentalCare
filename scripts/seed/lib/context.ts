import type { Types } from "mongoose";

import type { LeanClinicSettings } from "@/models/clinic-settings";
import type { LeanDoctor } from "@/models/doctor";
import type { LeanPatient } from "@/models/patient";
import type { LeanUser } from "@/models/user";

export type SeedContext = {
  admin: LeanUser & { _id: Types.ObjectId };
  doctorUser: LeanUser & { _id: Types.ObjectId };
  doctor: LeanDoctor & { _id: Types.ObjectId };
  clinic: LeanClinicSettings & { _id: Types.ObjectId };
  patients: Array<LeanPatient & { _id: Types.ObjectId }>;
  completedAppointmentIds: Types.ObjectId[];
};

export function createEmptySeedContext(): SeedContext {
  return {
    admin: null as unknown as SeedContext["admin"],
    doctorUser: null as unknown as SeedContext["doctorUser"],
    doctor: null as unknown as SeedContext["doctor"],
    clinic: null as unknown as SeedContext["clinic"],
    patients: [],
    completedAppointmentIds: [],
  };
}
