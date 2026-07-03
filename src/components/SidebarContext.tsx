'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  sidebarOpen: true,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage so state survives page navigations
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Read persisted value after mount (avoid SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem('sidebar_open');
    if (stored !== null) setSidebarOpen(stored === 'true');
  }, []);

  const set = (val: boolean) => {
    setSidebarOpen(val);
    localStorage.setItem('sidebar_open', String(val));
  };

  return (
    <SidebarContext.Provider value={{
      sidebarOpen,
      openSidebar:  () => set(true),
      closeSidebar: () => set(false),
      toggleSidebar: () => set(!sidebarOpen),
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
