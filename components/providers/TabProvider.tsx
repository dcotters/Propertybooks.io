'use client'

import React, { createContext, useContext, useState } from 'react';

interface TabContextType {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  return (
    <TabContext.Provider value={{ selectedTab, setSelectedTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabContext must be used within a TabProvider');
  }
  return context;
}; 