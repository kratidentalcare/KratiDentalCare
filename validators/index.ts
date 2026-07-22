/**
 * Shared Zod primitives and enum schemas.
 * Feature-specific schemas live alongside features in later phases.
 */

export {
  appointmentStatusSchema,
  contentStatusSchema,
  deletedAtSchema,
  doctorStatusSchema,
  contactMessageStatusSchema,
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
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_MIME_TYPES,
  profileImageFileSchema,
  updateAdminProfileSchema,
  type UpdateAdminProfileInput,
} from "./profile";

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
  createHolidayActionSchema,
  createHolidaySchema,
  holidayDateSchema,
  updateHolidayActionSchema,
  updateHolidaySchema,
  type CreateHolidayActionInput,
  type CreateHolidayInput,
  type UpdateHolidayActionInput,
  type UpdateHolidayInput,
} from "./holiday";

export {
  appointmentDurationMinutesSchema,
  clinicAddressSchema,
  clinicBookingRulesSchema,
  clinicBreakWindowSchema,
  clinicContactFormSchema,
  clinicFooterLinkFormSchema,
  clinicFooterLinkSchema,
  clinicInfoFormSchema,
  clinicSocialFormSchema,
  clinicSocialLinksSchema,
  createClinicSettingsSchema,
  footerLinkGroupSchema,
  footerUrlSchema,
  optionalHttpsUrlSchema,
  optionalPhoneSchema,
  timeOfDaySchema as clinicTimeOfDaySchema,
  timezoneSchema,
  updateClinicAvailabilitySchema,
  updateClinicSettingsSchema,
  type ClinicBookingRulesInput,
  type ClinicBreakWindowInput,
  type ClinicContactFormValues,
  type ClinicFooterLinkFormValues,
  type ClinicInfoFormValues,
  type ClinicSocialFormValues,
  type CreateClinicSettingsInput,
  type UpdateClinicAvailabilityInput,
  type UpdateClinicSettingsInput,
} from "./clinic-settings";

export {
  civilDateSchema as scheduleOverrideCivilDateSchema,
  createScheduleOverrideActionSchema,
  createScheduleOverrideSchema,
  scheduleOverrideDateSchema,
  updateScheduleOverrideSchema,
  type CreateScheduleOverrideActionInput,
  type CreateScheduleOverrideInput,
  type UpdateScheduleOverrideInput,
} from "./schedule-override";

export {
  civilDateSchema,
  generateAvailableSlotsQuerySchema,
  type GenerateAvailableSlotsQuery,
} from "./availability";

export {
  createSlotSchema,
  slotNotesSchema,
  slotWindowSchema,
  updateSlotSchema,
  type CreateSlotInput,
  type UpdateSlotInput,
} from "./slot";

export {
  appointmentActionSchema,
  approveAppointmentSchema,
  bookingAvailabilityQuerySchema,
  cancelAppointmentSchema,
  completeAppointmentSchema,
  appointmentListQuerySchema,
  publicBookingSchema,
  rescheduleAppointmentSchema,
  type AppointmentActionInput,
  type AppointmentListQuery,
  type BookingAvailabilityQuery,
  type PublicBookingInput,
} from "./appointment-booking";

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

export {
  createTestimonialSchema,
  testimonialRatingSchema,
  updateTestimonialSchema,
  type CreateTestimonialInput,
  type UpdateTestimonialInput,
} from "./testimonial";

export {
  createFaqActionSchema,
  createFaqSchema,
  faqCategorySchema,
  updateFaqActionSchema,
  updateFaqSchema,
  type CreateFaqActionInput,
  type CreateFaqInput,
  type UpdateFaqActionInput,
  type UpdateFaqInput,
} from "./faq";

export {
  contactMessageFormSchema,
  contactMessageListQuerySchema,
  createContactMessageSchema,
  deleteContactMessageSchema,
  updateContactMessageStatusSchema,
  type ContactMessageFormValues,
  type ContactMessageListQuery,
  type CreateContactMessageInput,
  type DeleteContactMessageInput,
  type UpdateContactMessageStatusInput,
} from "./contact-message";

export {
  createNotificationSchema,
  knownNotificationEventSchema,
  listNotificationsQuerySchema,
  markNotificationReadSchema,
  notificationTypeSchema,
  type CreateNotificationInput,
  type ListNotificationsQuery,
  type MarkNotificationReadInput,
} from "./notification";
