'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { adToBs, bsToAd } from '@/lib/dateConverter';

export type DateMode = 'AD' | 'BS';

interface DateContextType {
  dateMode: DateMode;
  toggleDateMode: () => void;
  setDateMode: (mode: DateMode) => void;
  formatDate: (dateAD: Date | string, customDateBS?: string) => string;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [dateMode, setDateModeState] = useState<DateMode>('AD');

  useEffect(() => {
    const savedMode = localStorage.getItem('dateMode') as DateMode | null;
    if (savedMode) {
      setDateModeState(savedMode);
    }
  }, []);

  const setDateMode = (mode: DateMode) => {
    setDateModeState(mode);
    localStorage.setItem('dateMode', mode);
  };

  const toggleDateMode = () => {
    const newMode = dateMode === 'AD' ? 'BS' : 'AD';
    setDateMode(newMode);
  };

  const formatDate = (dateAD: Date | string, customDateBS?: string): string => {
    if (dateMode === 'BS') {
      if (customDateBS) return customDateBS;
      // Convert on the fly
      try {
        const bs = adToBs(new Date(dateAD));
        return bs.formatted;
      } catch (e) {
        return typeof dateAD === 'string' ? dateAD : dateAD.toDateString();
      }
    } else {
      // Return AD Date (YYYY-MM-DD)
      try {
        const d = new Date(dateAD);
        return d.toISOString().split('T')[0];
      } catch (e) {
        return typeof dateAD === 'string' ? dateAD.split('T')[0] : dateAD.toDateString();
      }
    }
  };

  return (
    <DateContext.Provider value={{ dateMode, toggleDateMode, setDateMode, formatDate }}>
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
}
