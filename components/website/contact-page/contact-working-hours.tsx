import { Clock3 } from "lucide-react";

import { PageContainer } from "@/components/layout";
import type { PublicClinicSchedule } from "@/features/contact/types";
import { WEEKDAYS, type Weekday } from "@/constants/scheduling";
import { cn } from "@/lib/utils";

import { CONTACT_PAGE } from "./contact-page-data";

export type ContactWorkingHoursProps = {
  schedule: PublicClinicSchedule | null;
  className?: string;
};

const WEEKDAY_LABEL: Record<Weekday, string> = {
  [WEEKDAYS.MONDAY]: "Mon",
  [WEEKDAYS.TUESDAY]: "Tue",
  [WEEKDAYS.WEDNESDAY]: "Wed",
  [WEEKDAYS.THURSDAY]: "Thu",
  [WEEKDAYS.FRIDAY]: "Fri",
  [WEEKDAYS.SATURDAY]: "Sat",
  [WEEKDAYS.SUNDAY]: "Sun",
};

const WEEKDAY_ORDER: Weekday[] = [
  WEEKDAYS.MONDAY,
  WEEKDAYS.TUESDAY,
  WEEKDAYS.WEDNESDAY,
  WEEKDAYS.THURSDAY,
  WEEKDAYS.FRIDAY,
  WEEKDAYS.SATURDAY,
  WEEKDAYS.SUNDAY,
];

/**
 * Working hours from Clinic Settings scheduling configuration.
 */
export function ContactWorkingHours({
  schedule,
  className,
}: ContactWorkingHoursProps) {
  const openDays = new Set(schedule?.workingDays ?? []);

  return (
    <section
      id="working-hours"
      aria-labelledby="working-hours-heading"
      className={cn(
        "relative overflow-hidden font-montserrat",
        "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-blue)_6%,white)_0%,var(--brand-surface)_55%,white_100%)]",
        className
      )}
    >
      <PageContainer size="xl" className="relative public-section-y">
        <div
          className={cn(
            "mx-auto grid max-w-5xl grid-cols-1 items-center gap-10",
            "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14"
          )}
        >
          <header className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-brand-blue/15",
                "bg-white px-3.5 py-1.5",
                "text-[0.6875rem] font-bold tracking-[0.16em] text-brand-blue uppercase",
                "sm:text-xs sm:tracking-[0.18em]"
              )}
            >
              <Clock3
                className="size-3.5 shrink-0 text-brand-blue"
                strokeWidth={1.75}
                aria-hidden
              />
              {CONTACT_PAGE.hoursEyebrow}
            </p>

            <h2
              id="working-hours-heading"
              className={cn(
                "mt-5 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
                "sm:mt-6 sm:text-4xl"
              )}
            >
              {CONTACT_PAGE.hoursHeading}
            </h2>

            <div className="mt-4 h-1 w-12 rounded-full bg-brand-teal" aria-hidden />

            <p className="mt-5 max-w-md text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
              {schedule?.summaryLabel ??
                "Clinic hours will appear once scheduling is configured."}
            </p>
          </header>

          <div
            className={cn(
              "rounded-3xl border border-brand-blue/10 bg-white p-6 shadow-sm",
              "sm:p-8"
            )}
          >
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <dt className="text-[0.6875rem] font-bold tracking-[0.14em] text-brand-muted uppercase">
                  Opening Time
                </dt>
                <dd className="mt-2 font-serif text-2xl font-medium text-brand-dark sm:text-3xl">
                  {schedule?.openingTimeLabel ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] font-bold tracking-[0.14em] text-brand-muted uppercase">
                  Closing Time
                </dt>
                <dd className="mt-2 font-serif text-2xl font-medium text-brand-dark sm:text-3xl">
                  {schedule?.closingTimeLabel ?? "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-brand-blue/10 pt-6">
              <p className="text-[0.6875rem] font-bold tracking-[0.14em] text-brand-muted uppercase">
                Working Days
              </p>
              <p className="mt-2 text-sm font-medium text-brand-dark sm:text-[0.9375rem]">
                {schedule?.workingDaysLabel ?? "—"}
              </p>

              <ul
                className="mt-4 flex flex-wrap gap-2"
                aria-label="Weekly schedule"
              >
                {WEEKDAY_ORDER.map((day) => {
                  const open = openDays.has(day);
                  return (
                    <li key={day}>
                      <span
                        className={cn(
                          "inline-flex min-w-11 items-center justify-center rounded-full px-2.5 py-1.5",
                          "text-xs font-semibold",
                          open
                            ? "bg-brand-blue/10 text-brand-blue"
                            : "bg-slate-100 text-brand-muted"
                        )}
                      >
                        {WEEKDAY_LABEL[day]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
