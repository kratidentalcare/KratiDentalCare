"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DashboardChromeContextValue = {
  /** Mobile drawer open state. */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  openMobile: () => void;
  closeMobile: () => void;
  /** Tablet icon-rail collapse (ignored on permanent desktop sidebar). */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  /**
   * Pathname used for nav highlight / header title while a dashboard
   * navigation is in flight. Equals `pendingHref ?? pathname`.
   */
  displayPath: string;
  /** Mark an in-dashboard route change so chrome updates immediately. */
  markNavigating: (href: string) => void;
};

const DashboardChromeContext =
  createContext<DashboardChromeContextValue | null>(null);

export function DashboardChromeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleCollapsed = useCallback(
    () => setCollapsed((prev) => !prev),
    [],
  );

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const markNavigating = useCallback(
    (href: string) => {
      if (href === pathname) {
        return;
      }
      setPendingHref(href);
    },
    [pathname],
  );

  const displayPath = pendingHref ?? pathname;

  const value = useMemo(
    () => ({
      mobileOpen,
      setMobileOpen,
      openMobile,
      closeMobile,
      collapsed,
      setCollapsed,
      toggleCollapsed,
      displayPath,
      markNavigating,
    }),
    [
      mobileOpen,
      openMobile,
      closeMobile,
      collapsed,
      toggleCollapsed,
      displayPath,
      markNavigating,
    ],
  );

  return (
    <DashboardChromeContext.Provider value={value}>
      {children}
    </DashboardChromeContext.Provider>
  );
}

export function useDashboardChrome(): DashboardChromeContextValue {
  const context = useContext(DashboardChromeContext);
  if (!context) {
    throw new Error(
      "useDashboardChrome must be used within DashboardChromeProvider",
    );
  }
  return context;
}
