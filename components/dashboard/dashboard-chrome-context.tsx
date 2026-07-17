"use client";

import {
  createContext,
  useCallback,
  useContext,
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
};

const DashboardChromeContext =
  createContext<DashboardChromeContextValue | null>(null);

export function DashboardChromeProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleCollapsed = useCallback(
    () => setCollapsed((prev) => !prev),
    [],
  );

  const value = useMemo(
    () => ({
      mobileOpen,
      setMobileOpen,
      openMobile,
      closeMobile,
      collapsed,
      setCollapsed,
      toggleCollapsed,
    }),
    [
      mobileOpen,
      openMobile,
      closeMobile,
      collapsed,
      toggleCollapsed,
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
