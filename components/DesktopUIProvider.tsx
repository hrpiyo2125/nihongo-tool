"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

type DesktopUIContextType = {
  sbOpen: boolean;
  setSbOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activePage: string;
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
  navigateTo: (page: string) => void;
};

const DesktopUIContext = createContext<DesktopUIContextType>({
  sbOpen: false,
  setSbOpen: () => {},
  activePage: "home",
  setActivePage: () => {},
  navigateTo: () => {},
});

const PAGE_MAP: Record<string, string> = {
  '/about': 'about', '/faq': 'faq', '/plan': 'plan',
  '/privacy': 'privacy', '/terms': 'terms', '/tokushoho': 'tokushoho',
  '/dl': 'dl', '/purchases': 'purchases', '/fav': 'fav',
  '/announcements': 'announcements',
  '/settings': 'settings-profile', '/settings/billing': 'settings-billing',
};

const URL_MAP: Record<string, string> = {
  home: '/', about: '/about', faq: '/faq', guide: '/faq',
  plan: '/plan', privacy: '/privacy', terms: '/terms', tokushoho: '/tokushoho',
  dl: '/dl', purchases: '/purchases', fav: '/fav',
  announcements: '/announcements',
  'settings-profile': '/settings', 'settings-billing': '/settings/billing',
};

export function DesktopUIProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEn = pathname.startsWith('/en');
  const path = pathname.replace(/^\/(en|ja)/, '') || '/';
  const [sbOpen, setSbOpen] = useState(false);
  const [activePage, setActivePage] = useState(PAGE_MAP[path] ?? "home");

  const navigateTo = useCallback((page: string) => {
    const actualPage = page === 'guide' ? 'faq' : page;
    const base = isEn ? '/en' : '';
    const urlPath = URL_MAP[actualPage];
    if (urlPath) window.history.pushState(null, '', `${base}${urlPath === '/' ? '' : urlPath}` || '/');
    setActivePage(actualPage);
  }, [isEn]);

  return (
    <DesktopUIContext.Provider value={{ sbOpen, setSbOpen, activePage, setActivePage, navigateTo }}>
      {children}
    </DesktopUIContext.Provider>
  );
}

export const useDesktopUI = () => useContext(DesktopUIContext);
