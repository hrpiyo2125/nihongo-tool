"use client";
import { createContext, useContext, useState, useEffect } from "react";

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

  useEffect(() => {
    console.log("[DesktopUIProvider] mounted");
    return () => console.log("[DesktopUIProvider] unmounted");
  }, []);

  useEffect(() => {
    console.log("[DesktopUIProvider] activePage changed:", activePage);
  }, [activePage]);

  return (
    <DesktopUIContext.Provider value={{ sbOpen, setSbOpen, activePage, setActivePage }}>
      {children}
    </DesktopUIContext.Provider>
  );
}

export const useDesktopUI = () => useContext(DesktopUIContext);
