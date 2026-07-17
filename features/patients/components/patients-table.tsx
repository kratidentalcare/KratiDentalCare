"use client";

import Link from "next/link";
import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  UserRoundMinusIcon,
  UserRoundPlusIcon,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { PATIENT_STATUSES } from "@/constants/statuses";
import type { PatientListItem } from "@/features/patients/types";
import {
  DataTable,
  type DataTableColumn,
  StatusBadge,
  UserAvatar,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PatientsTableProps = {
  items: PatientListItem[];
  onEdit: (patient: PatientListItem) => void;
  onToggleStatus: (patient: PatientListItem) => void;
};

export function PatientsTable({
  items,
  onEdit,
  onToggleStatus,
}: PatientsTableProps) {
  const columns: DataTableColumn<PatientListItem>[] = [
    {
      id: "name",
      header: "Full name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.fullName} size="sm" />
          <div className="min-w-0">
            <Link
              href={`${ROUTES.DASHBOARD.PATIENTS}/${row.id}`}
              className="font-medium text-brand-dark hover:underline"
            >
              {row.fullName}
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      cell: (row) => row.phone,
    },
    {
      id: "email",
      header: "Email",
      className: "hidden lg:table-cell",
      cell: (row) => (
        <span className="text-muted-foreground">{row.email ?? "—"}</span>
      ),
    },
    {
      id: "total",
      header: "Appointments",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="tabular-nums">{row.totalAppointments}</span>
      ),
    },
    {
      id: "lastVisit",
      header: "Last visit",
      className: "hidden xl:table-cell",
      cell: (row) => row.lastVisitLabel ?? "—",
    },
    {
      id: "next",
      header: "Next appointment",
      className: "hidden xl:table-cell",
      cell: (row) => row.nextAppointmentLabel ?? "—",
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-12 text-right",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.fullName}`}
              />
            }
          >
            <MoreHorizontalIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={<Link href={`${ROUTES.DASHBOARD.PATIENTS}/${row.id}`} />}
              className="cursor-pointer gap-2"
            >
              <EyeIcon className="size-4" />
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => onEdit(row)}
            >
              <PencilIcon className="size-4" />
              Edit contact
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => onToggleStatus(row)}
            >
              {row.status === PATIENT_STATUSES.ACTIVE ? (
                <>
                  <UserRoundMinusIcon className="size-4" />
                  Mark inactive
                </>
              ) : (
                <>
                  <UserRoundPlusIcon className="size-4" />
                  Mark active
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={items}
      getRowId={(row) => row.id}
      caption="Patients"
      emptyTitle="No patients found"
      emptyDescription="Patients are created automatically when appointments are booked."
      renderMobileRow={(row) => (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar name={row.fullName} size="sm" />
              <div className="min-w-0">
                <Link
                  href={`${ROUTES.DASHBOARD.PATIENTS}/${row.id}`}
                  className="font-medium text-brand-dark hover:underline"
                >
                  {row.fullName}
                </Link>
                <p className="text-sm text-muted-foreground">{row.phone}</p>
              </div>
            </div>
            <StatusBadge status={row.status} />
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate font-medium">{row.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Appointments</dt>
              <dd className="font-medium tabular-nums">
                {row.totalAppointments}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last visit</dt>
              <dd className="font-medium">{row.lastVisitLabel ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Next</dt>
              <dd className="font-medium">
                {row.nextAppointmentLabel ?? "—"}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={`${ROUTES.DASHBOARD.PATIENTS}/${row.id}`} />}
            >
              View
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onEdit(row)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onToggleStatus(row)}
            >
              {row.status === PATIENT_STATUSES.ACTIVE
                ? "Mark inactive"
                : "Mark active"}
            </Button>
          </div>
        </div>
      )}
    />
  );
}
