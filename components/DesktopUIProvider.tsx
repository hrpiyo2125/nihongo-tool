"use client";
import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";

type DesktopUIContextType = {
  sbOpen: boolean;
  setSbOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activePage: string;
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
};

const DesktopUIContext = createContext<DesktopUIContextType>({
  sbOpen: false,
  setSbOpen: () => {},
  activePage: "home",
  setActivePage: () => {},
});

const PAGE_MAP: Record<string, string> = {
  '/about': 'about', '/faq': 'faq', '/plan': 'plan',
  '/privacy': 'privacy', '/terms': 'terms', '/tokushoho': 'tokushoho',
};

export function DesktopUIProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const path = pathname.replace(/^\/(en|ja)/, '') || '/';
  const [sbOpen, setSbOpen] = useState(false);
  const [activePage, setActivePage] = useState(PAGE_MAP[path] ?? "home");

  return (
    <DesktopUIContext.Provider value={{ sbOpen, setSbOpen, activePage, setActivePage }}>
      {children}
    </DesktopUIContext.Provider>
  );
}

export const useDesktopUI = () => useContext(DesktopUIContext);
