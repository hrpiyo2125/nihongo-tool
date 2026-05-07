"use client";
import { createContext, useContext, useState } from "react";

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

export function DesktopUIProvider({ children }: { children: React.ReactNode }) {
  const [sbOpen, setSbOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");
  return (
    <DesktopUIContext.Provider value={{ sbOpen, setSbOpen, activePage, setActivePage }}>
      {children}
    </DesktopUIContext.Provider>
  );
}

export const useDesktopUI = () => useContext(DesktopUIContext);
