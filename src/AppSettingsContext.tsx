import React, { createContext, useContext, useState } from 'react';

export type AppSettingsContextType = {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  notifications: boolean;
  setNotifications: (val: boolean) => void;
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <AppSettingsContext.Provider value={{ darkMode, setDarkMode, notifications, setNotifications }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
};
