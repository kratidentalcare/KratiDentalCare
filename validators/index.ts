/**
 * Shared Zod primitives and enum schemas.
 * Feature-specific schemas live alongside features in later phases.
 */

export {
  appointmentStatusSchema,
  contentStatusSchema,
  deletedAtSchema,
  doctorStatusSchema,
  emailSchema,
  isActiveSchema,
  isoDateStringSchema,
  nonEmptyStringSchema,
  nullableObjectIdSchema,
  objectIdArraySchema,
  objectIdSchema,
  patientStatusSchema,
  phoneSchema,
  prescriptionStatusSchema,
  slotStatusSchema,
  userRoleSchema,
} from "./common";

export {
  paginationQuerySchema,
  type PaginationQuery,
} from "./pagination";

export {
  clerkIdSchema,
  createUserSchema,
  profileImageSchema,
  updateUserSchema,
  userModelRoleValues,
  userNameSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "./user";

export {
  consultationDurationSchema,
  createDoctorSchema,
  doctorSlugSchema,
  specialtiesSchema,
  specialtySchema,
  timeOfDaySchema,
  updateDoctorSchema,
  weekdaySchema,
  workingDaysSchema,
  profilePhotoSchema,
  type CreateDoctorInput,
  type UpdateDoctorInput,
} from "./doctor";

export {
  allergySchema,
  bloodGroupSchema,
  chronicConditionSchema,
  createPatientSchema,
  emergencyContactRelationshipSchema,
  genderSchema,
  patientAddressSchema,
  updatePatientSchema,
  type CreatePatientInput,
  type PatientAddressInput,
  type UpdatePatientInput,
} from "./patient";

export {
  createHolidaySchema,
  holidayDateSchema,
  updateHolidaySchema,
  type CreateHolidayInput,
  type UpdateHolidayInput,
} from "./holiday";

export {
  createSlotSchema,
  slotNotesSchema,
  slotWindowSchema,
  updateSlotSchema,
  type CreateSlotInput,
  type UpdateSlotInput,
} from "./slot";

export {
  appointmentDoctorSnapshotSchema,
  appointmentPatientSnapshotSchema,
  appointmentTimeWindowSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
  type AppointmentDoctorSnapshotInput,
  type AppointmentPatientSnapshotInput,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
} from "./appointment";

export {
  createPrescriptionSchema,
  prescriptionDoctorSnapshotSchema,
  prescriptionMedicationSchema,
  prescriptionNumberSchema,
  prescriptionPatientSnapshotSchema,
  updatePrescriptionSchema,
  type CreatePrescriptionInput,
  type PrescriptionMedicationInput,
  type UpdatePrescriptionInput,
} from "./prescription";

export {
  createServiceSchema,
  serviceSlugSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "./service";
