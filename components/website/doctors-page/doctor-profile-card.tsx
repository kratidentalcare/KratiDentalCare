import Image from "next/image";
import { User } from "lucide-react";

import type { PublicDoctorProfile } from "@/features/doctors";
import { cn } from "@/lib/utils";

import { DOCTOR_PROFILE_PLACEHOLDERS } from "./doctors-page-data";

export type DoctorProfileCardProps = {
  doctor: PublicDoctorProfile;
  /** Accessible heading id for the doctor name. */
  headingId?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Profile summary — photo, name, qualification, experience, specializations.
 */
export function DoctorProfileCard({
  doctor,
  headingId,
  priority = false,
  className,
}: DoctorProfileCardProps) {
  const qualification =
    doctor.qualification?.trim() || DOCTOR_PROFILE_PLACEHOLDERS.qualification;
  const experienceLabel =
    doctor.yearsOfExperience != null
      ? `${doctor.yearsOfExperience}+ Years Experience`
      : DOCTOR_PROFILE_PLACEHOLDERS.experience;
  const specialties =
    doctor.specialties.length > 0
      ? doctor.specialties
      : [DOCTOR_PROFILE_PLACEHOLDERS.specialization];
  const photoSrc = doctor.profilePhoto ?? "/images/hero/drgaurav.png";

  return (
    <div
      className={cn(
        "grid grid-cols-1 items-center gap-8",
        "lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-14 xl:gap-x-16",
        className
      )}
    >
      <div className="relative mx-auto flex flex-col items-center lg:mx-0">
        <div className="relative size-[12.5rem] sm:size-[15.5rem] lg:size-[18rem]">
          <div
            className={cn(
              "pointer-events-none absolute inset-0 -m-3 rounded-full sm:-m-4",
              "border-2 border-brand-blue/15"
            )}
            aria-hidden
          />
          <div
            className={cn(
              "relative size-full overflow-hidden rounded-full",
              "border-[6px] border-white bg-slate-100 shadow-xl sm:border-8"
            )}
          >
            <Image
              src={photoSrc}
              alt={doctor.imageAlt}
              fill
              sizes="(max-width: 640px) 200px, (max-width: 1024px) 248px, 288px"
              className="object-cover object-[center_15%]"
              priority={priority}
            />
          </div>

          <div
            role="status"
            aria-label={experienceLabel}
            className={cn(
              "absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 translate-y-1/2",
              "items-center gap-2.5 rounded-2xl bg-brand-card px-3.5 py-2.5 shadow-lg",
              "ring-1 ring-brand-blue/10",
              "lg:left-auto lg:right-0 lg:translate-x-3 lg:translate-y-0"
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                "bg-brand-blue/10"
              )}
            >
              <User
                className="size-4 text-brand-blue"
                strokeWidth={1.75}
                aria-hidden
              />
            </span>
            <span className="pr-0.5 text-left text-[0.8125rem] leading-tight font-semibold text-brand-dark whitespace-nowrap">
              {experienceLabel}
            </span>
          </div>
        </div>
        <div className="h-8 w-full lg:h-0" aria-hidden />
      </div>

      <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
        <p
          className={cn(
            "text-[0.625rem] font-bold tracking-[0.14em] text-brand-blue uppercase",
            "sm:text-[0.6875rem] sm:tracking-[0.16em]"
          )}
        >
          {qualification}
        </p>

        <h2
          id={headingId}
          className={cn(
            "mt-1.5 font-serif text-[1.625rem] font-medium tracking-tight text-brand-dark",
            "sm:mt-2 sm:text-3xl lg:text-4xl"
          )}
        >
          {doctor.fullName}
        </h2>

        <div
          className="mx-auto mt-2 h-0.5 w-8 rounded-full bg-brand-blue/35 lg:mx-0"
          aria-hidden
        />

        <ul
          className={cn(
            "mt-5 flex max-w-md flex-wrap items-center justify-center gap-2",
            "lg:max-w-none lg:justify-start"
          )}
          aria-label={`${doctor.fullName} specializations`}
        >
          {specialties.map((spec, i) => (
            <li key={`${doctor.slug}-spec-${spec}`}>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border border-brand-blue/10",
                  "bg-white px-3 py-1.5 text-xs font-medium shadow-sm",
                  i % 2 === 1 ? "text-brand-teal" : "text-brand-blue"
                )}
              >
                {spec}
              </span>
            </li>
          ))}
        </ul>

        {doctor.languages.length > 0 ? (
          <p className="mt-4 text-sm text-brand-muted">
            Speaks {doctor.languages.join(" · ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
