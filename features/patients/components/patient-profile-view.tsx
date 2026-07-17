"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  ClipboardListIcon,
  MailIcon,
  PhoneIcon,
  PillIcon,
} from "lucide-react";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { PatientEditContactDialog } from "@/features/patients/components/patient-edit-contact-dialog";
import { PatientStatusDialog } from "@/features/patients/components/patient-status-dialog";
import type { PatientProfile } from "@/features/patients/types";
import { PrintButton } from "@/components/dashboard/prescriptions/print-button";
import { ROUTES } from "@/constants/routes";
import { PATIENT_STATUSES } from "@/constants/statuses";
import {
  PaginationControls,
  StatusBadge,
  UserAvatar,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PatientProfileViewProps = {
  profile: PatientProfile;
};

export function PatientProfileView({ profile }: PatientProfileViewProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const refresh = useCallback(() => {
    startRefresh(() => {
      router.refresh();
    });
  }, [router]);

  const updateHistoryPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page <= 1) {
      params.delete("historyPage");
    } else {
      params.set("historyPage", String(page));
    }
    const query = params.toString();
    router.replace(
      `${ROUTES.DASHBOARD.PATIENTS}/${profile.id}${query ? `?${query}` : ""}`,
    );
  };

  const updatePrescriptionPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page <= 1) {
      params.delete("rxPage");
    } else {
      params.set("rxPage", String(page));
    }
    const query = params.toString();
    router.replace(
      `${ROUTES.DASHBOARD.PATIENTS}/${profile.id}${query ? `?${query}` : ""}`,
    );
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <UserAvatar name={profile.fullName} size="lg" />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-2xl font-medium tracking-tight text-brand-dark">
                  {profile.fullName}
                </h2>
                <StatusBadge status={profile.status} />
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p className="inline-flex items-center gap-2">
                  <PhoneIcon className="size-4 shrink-0" />
                  {profile.phone}
                </p>
                <p className="inline-flex items-center gap-2">
                  <MailIcon className="size-4 shrink-0" />
                  {profile.email ?? "No email on file"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              onClick={() => setEditOpen(true)}
            >
              Edit contact
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              onClick={() => setStatusOpen(true)}
            >
              {profile.status === PATIENT_STATUSES.ACTIVE
                ? "Mark inactive"
                : "Mark active"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={ROUTES.DASHBOARD.PATIENTS} />}
            >
              Back to list
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total appointments"
          value={profile.statistics.totalAppointments}
        />
        <StatCard
          label="Completed"
          value={profile.statistics.completedAppointments}
        />
        <StatCard
          label="Cancelled"
          value={profile.statistics.cancelledAppointments}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDaysIcon className="size-4 text-brand-blue" />
              Upcoming appointment
            </CardTitle>
            <CardDescription>
              Next scheduled visit for this patient.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.upcomingAppointment ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium text-brand-dark">
                  {profile.upcomingAppointment.date} ·{" "}
                  {profile.upcomingAppointment.timeLabel}
                </p>
                <p className="text-muted-foreground">
                  {profile.upcomingAppointment.doctorName}
                </p>
                <AppointmentStatusBadge
                  status={profile.upcomingAppointment.status}
                />
                {profile.upcomingAppointment.reason ? (
                  <p className="text-muted-foreground">
                    {profile.upcomingAppointment.reason}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming appointments.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PillIcon className="size-4 text-brand-blue" />
              Prescription history
            </CardTitle>
            <CardDescription>
              Issued e-prescriptions linked to this patient.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.prescriptionHistory.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#E5E7EB] px-4 py-8 text-center text-sm text-muted-foreground">
                No prescriptions recorded yet.
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {profile.prescriptionHistory.map((rx) => (
                    <li
                      key={rx.id}
                      className="rounded-xl p-3 text-sm ring-1 ring-foreground/10"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <p className="font-medium text-brand-dark">
                            {rx.prescriptionNumber}
                          </p>
                          <p className="text-muted-foreground">
                            {rx.issuedDateLabel} · {rx.doctorName}
                          </p>
                          <p className="truncate text-muted-foreground">
                            {rx.diagnosis ?? "No diagnosis"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rx.medicationCount} medicine
                            {rx.medicationCount === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            nativeButton={false}
                            render={
                              <Link
                                href={
                                  rx.appointmentId
                                    ? `${ROUTES.DASHBOARD.PRESCRIPTIONS}?appointmentId=${rx.appointmentId}`
                                    : `${ROUTES.DASHBOARD.PRESCRIPTIONS}/${rx.id}`
                                }
                              />
                            }
                          >
                            View
                          </Button>
                          <PrintButton prescriptionId={rx.id} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <PaginationControls
                  page={profile.prescriptionHistoryPagination.page}
                  pageSize={profile.prescriptionHistoryPagination.limit}
                  totalItems={profile.prescriptionHistoryPagination.total}
                  onPageChange={updatePrescriptionPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardListIcon className="size-4 text-brand-blue" />
            Appointment history
          </CardTitle>
          <CardDescription>
            Past and scheduled visits linked to this patient chart.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.appointmentHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No appointments recorded yet.
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-3 md:hidden">
                {profile.appointmentHistory.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl p-3 text-sm ring-1 ring-foreground/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {item.date} · {item.timeLabel}
                        </p>
                        <p className="text-muted-foreground">
                          {item.doctorName}
                        </p>
                      </div>
                      <AppointmentStatusBadge status={item.status} />
                    </div>
                    {item.reason ? (
                      <p className="mt-2 text-muted-foreground">{item.reason}</p>
                    ) : null}
                  </li>
                ))}
              </ul>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.appointmentHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.timeLabel}</TableCell>
                        <TableCell>{item.doctorName}</TableCell>
                        <TableCell className="max-w-[14rem] truncate">
                          {item.reason ?? "—"}
                        </TableCell>
                        <TableCell>
                          <AppointmentStatusBadge status={item.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <PaginationControls
                page={profile.appointmentHistoryPagination.page}
                pageSize={profile.appointmentHistoryPagination.limit}
                totalItems={profile.appointmentHistoryPagination.total}
                onPageChange={updateHistoryPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      <PatientEditContactDialog
        patient={profile}
        open={editOpen}
        onOpenChange={setEditOpen}
        onComplete={refresh}
      />

      <PatientStatusDialog
        patientId={profile.id}
        currentStatus={profile.status}
        open={statusOpen}
        onOpenChange={setStatusOpen}
        onComplete={refresh}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-0 shadow-none ring-1 ring-[#E5E7EB]">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
