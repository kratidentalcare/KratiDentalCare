import {
  Award,
  BookOpen,
  Calendar,
  Clock3,
  GraduationCap,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import type { PublicDoctorProfile } from "@/features/doctors";
import { formatClinicWorkingHours } from "@/features/clinic-settings/lib/format-clinic";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import { DoctorProfileCard } from "./doctor-profile-card";
import {
  DoctorDetailList,
  DoctorDetailSection,
} from "./doctor-detail-section";
import { DOCTOR_PROFILE_PLACEHOLDERS } from "./doctors-page-data";

export type DoctorProfileProps = {
  doctor: PublicDoctorProfile;
  /** Clinic-wide hours used when the doctor schedule is incomplete. */
  clinicHoursLabel?: string | null;
  priority?: boolean;
  className?: string;
};

/**
 * Full public doctor profile — card + biography / education / etc.
 * Layout is identical for every doctor so adding more requires no redesign.
 */
export function DoctorProfile({
  doctor,
  clinicHoursLabel,
  priority = false,
  className,
}: DoctorProfileProps) {
  const timingsLabel = formatClinicWorkingHours({
    workingDays: doctor.workingDays,
    openingTime: doctor.startTime,
    closingTime: doctor.endTime,
  });
  const showTimings =
    timingsLabel !== "Closed" || Boolean(clinicHoursLabel);

  return (
    <article
      id={`doctor-${doctor.slug}`}
      aria-labelledby={`doctor-name-${doctor.slug}`}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-brand-blue/10",
        "bg-white shadow-[0_12px_40px_color-mix(in_srgb,var(--brand-blue)_8%,transparent)]",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-20 -right-16 size-56 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_10%,transparent)_0%,transparent_70%)]",
          "blur-2xl"
        )}
        aria-hidden
      />

      <div className="relative space-y-10 p-6 sm:space-y-12 sm:p-8 lg:p-10">
        <DoctorProfileCard
          doctor={doctor}
          headingId={`doctor-name-${doctor.slug}`}
          priority={priority}
        />

        <div className="h-px w-full bg-brand-blue/10" aria-hidden />

        <div
          className={cn(
            "grid grid-cols-1 gap-10",
            "lg:grid-cols-2 lg:gap-x-12 lg:gap-y-10"
          )}
        >
          <DoctorDetailSection title="Biography" icon={BookOpen}>
            <p className="text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
              {doctor.bio?.trim() || DOCTOR_PROFILE_PLACEHOLDERS.bio}
            </p>
          </DoctorDetailSection>

          <DoctorDetailSection title="Education" icon={GraduationCap}>
            <DoctorDetailList
              items={doctor.education}
              emptyMessage={DOCTOR_PROFILE_PLACEHOLDERS.education}
            />
          </DoctorDetailSection>

          <DoctorDetailSection title="Certifications" icon={Award}>
            <DoctorDetailList
              items={doctor.certifications}
              emptyMessage={DOCTOR_PROFILE_PLACEHOLDERS.certifications}
            />
          </DoctorDetailSection>

          <DoctorDetailSection title="Expertise" icon={Sparkles}>
            {doctor.expertise.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {doctor.expertise.map((item) => (
                  <li key={`${doctor.slug}-exp-${item}`}>
                    <span
                      className={cn(
                        "inline-flex rounded-full border border-brand-teal/20",
                        "bg-brand-teal/8 px-3 py-1.5 text-xs font-medium text-brand-teal"
                      )}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-brand-muted">
                {DOCTOR_PROFILE_PLACEHOLDERS.expertise}
              </p>
            )}
          </DoctorDetailSection>
        </div>

        <DoctorDetailSection title="Clinic Timings" icon={Clock3}>
          {showTimings ? (
            <div className="space-y-2 text-sm leading-relaxed text-brand-dark sm:text-[0.9375rem]">
              {timingsLabel !== "Closed" ? (
                <p>
                  <span className="font-medium text-brand-dark">
                    Consultation hours:{" "}
                  </span>
                  <span className="text-brand-muted">{timingsLabel}</span>
                </p>
              ) : null}
              {clinicHoursLabel ? (
                <p>
                  <span className="font-medium text-brand-dark">
                    Clinic hours:{" "}
                  </span>
                  <span className="text-brand-muted">{clinicHoursLabel}</span>
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-brand-muted">
              {DOCTOR_PROFILE_PLACEHOLDERS.timings}
            </p>
          )}
        </DoctorDetailSection>

        <div
          className={cn(
            "flex w-full flex-col gap-3",
            "sm:flex-row sm:items-center sm:gap-3.5"
          )}
        >
          <Link
            href={ROUTES.PUBLIC.BOOK}
            className={cn(
              "group/btn inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5",
              "bg-brand-blue text-sm font-semibold text-white",
              "shadow-[0_8px_22px_color-mix(in_srgb,var(--brand-blue)_28%,transparent)]",
              "transition-all duration-300 ease-out",
              "hover:bg-brand-hover hover:shadow-[0_12px_28px_color-mix(in_srgb,var(--brand-blue)_34%,transparent)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
              "active:scale-[0.98]",
              "sm:h-12 sm:w-auto sm:px-6"
            )}
            aria-label={`Book an appointment with ${doctor.fullName}`}
          >
            <Calendar className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Book and Smile
          </Link>

          <Link
            href={ROUTES.PUBLIC.CONTACT}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-5",
              "border border-brand-blue/30 bg-white text-sm font-semibold text-brand-blue",
              "transition-all duration-300 ease-out",
              "hover:border-brand-blue/50 hover:bg-brand-blue/[0.04] hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
              "active:scale-[0.98]",
              "sm:h-12 sm:w-auto sm:px-6"
            )}
            aria-label="Contact the clinic"
          >
            <MessageCircle className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            Contact Clinic
          </Link>
        </div>
      </div>
    </article>
  );
}
