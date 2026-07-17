import type { LucideIcon } from "lucide-react";
import {
  CalendarDaysIcon,
  CalendarPlusIcon,
  CircleHelpIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  ClockIcon,
  UserCircleIcon,
  UsersIcon,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Exact match only (e.g. dashboard home). Default: prefix match. */
  exact?: boolean;
  /** Destructive / action styling (e.g. logout). */
  variant?: "default" | "danger";
  /** Non-navigation action rendered as a button. */
  action?: "logout";
};

/**
 * Primary sidebar destinations. Module hrefs are reserved for later phases —
 * the shell already highlights them when the matching route exists.
 */
export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: ROUTES.DASHBOARD.ROOT,
    icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    id: "appointments",
    label: "Appointments",
    href: ROUTES.DASHBOARD.APPOINTMENTS,
    icon: CalendarDaysIcon,
  },
  {
    id: "slots",
    label: "Slots",
    href: ROUTES.DASHBOARD.SLOTS,
    icon: ClockIcon,
  },
  {
    id: "patients",
    label: "Patients",
    href: ROUTES.DASHBOARD.PATIENTS,
    icon: UsersIcon,
  },
  {
    id: "prescriptions",
    label: "E-Prescriptions",
    href: ROUTES.DASHBOARD.PRESCRIPTIONS,
    icon: ClipboardListIcon,
  },
  {
    id: "faqs",
    label: "FAQs",
    href: ROUTES.DASHBOARD.FAQS,
    icon: CircleHelpIcon,
  },
  {
    id: "settings",
    label: "Clinic Settings",
    href: ROUTES.DASHBOARD.SETTINGS,
    icon: SettingsIcon,
  },
  {
    id: "profile",
    label: "Profile",
    href: ROUTES.DASHBOARD.PROFILE,
    icon: UserCircleIcon,
  },
  {
    id: "logout",
    label: "Logout",
    href: "#logout",
    icon: LogOutIcon,
    variant: "danger",
    action: "logout",
  },
] as const;

export const DASHBOARD_QUICK_ACTIONS = [
  {
    id: "generate-slots",
    label: "Generate Slots",
    href: ROUTES.DASHBOARD.SLOTS,
    icon: CalendarPlusIcon,
  },
  {
    id: "create-prescription",
    label: "Create Prescription",
    href: ROUTES.DASHBOARD.PRESCRIPTIONS,
    icon: ClipboardListIcon,
  },
  {
    id: "view-appointments",
    label: "View Appointments",
    href: ROUTES.DASHBOARD.APPOINTMENTS,
    icon: CalendarDaysIcon,
  },
] as const;

export function isDashboardNavActive(
  pathname: string,
  item: Pick<DashboardNavItem, "href" | "exact" | "action">,
): boolean {
  if (item.action) {
    return false;
  }

  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getDashboardNavItemByPath(
  pathname: string,
): DashboardNavItem | undefined {
  const linkItems = DASHBOARD_NAV_ITEMS.filter((item) => !item.action);

  const exact = linkItems.find(
    (item) => item.exact && pathname === item.href,
  );
  if (exact) {
    return exact;
  }

  return linkItems
    .filter((item) => !item.exact)
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
}

export function getDashboardPageTitle(pathname: string): string {
  return getDashboardNavItemByPath(pathname)?.label ?? "Dashboard";
}
