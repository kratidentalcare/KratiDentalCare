import type { AppointmentListItem } from "@/features/appointments/types";
import type { PatientStatus } from "@/constants/statuses";

export type DashboardMetrics = {
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  todayPrescriptions: number;
};

export type DashboardRecentPatient = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  status: PatientStatus;
  createdAt: string;
};

export type DashboardOverview = {
  metrics: DashboardMetrics;
  recentAppointments: AppointmentListItem[];
  recentPatients: DashboardRecentPatient[];
  timezone: string;
  todayCivilDate: string;
};
