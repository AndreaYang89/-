
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { AppState, GlobalSettings, Asset, Group, ViewMode } from './types';
import { INITIAL_SETTINGS, INITIAL_ASSETS, INITIAL_GROUPS } from './constants';

interface AppContextType {
  state: AppState;
  updateSettings: (settings: Partial<GlobalSettings>) => void;
  updateAsset: (id: string, value: number) => void;
  updateGroupTarget: (id: string, targetPercent: number) => void;
  setViewMode: (mode: ViewMode) => void;
  calculated: {
    totalCash: number;
    totalAssets: number;
    positionPercent: number;
    groupMetrics: Record<string, { current: number; target: number; gap: number; completion: number }>;
  };
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GlobalSettings>(INITIAL_SETTINGS);
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [activeView, setViewMode] = useState<ViewMode>('attribution');

  const updateSettings = useCallback((newSettings: Partial<GlobalSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateAsset = useCallback((id: string, value: number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, value } : a));
  }, []);

  const updateGroupTarget = useCallback((id: string, targetPercent: number) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, targetPercent } : g));
  }, []);

  const calculated = useMemo(() => {
    const totalCash = (settings.cashUSD * settings.usdRate) + (settings.cashJPY * settings.jpyRate);
    const totalInvested = assets.reduce((acc, a) => acc + a.value, 0);
    const totalAssets = totalInvested + totalCash;
    const positionPercent = totalAssets > 0 ? (totalInvested / totalAssets) * 100 : 0;

    const groupMetrics: AppContextType['calculated']['groupMetrics'] = {};

    groups.forEach(group => {
      const current = group.assetIds.reduce((acc, id) => {
        const asset = assets.find(a => a.id === id);
        return acc + (asset?.value || 0);
      }, 0);

      // Simple pool logic: Structural uses its own logic, Attribution uses total invested as base
      const poolBase = group.viewType === 'structural' ? (settings.aSharePool + settings.globalPool) : totalInvested;
      const target = (poolBase * group.targetPercent) / 100;
      const gap = target - current;
      const completion = target > 0 ? (current / target) * 100 : 0;

      groupMetrics[group.id] = { current, target, gap, completion };
    });

    return { totalCash, totalAssets, positionPercent, groupMetrics };
  }, [settings, assets, groups]);

  const value = {
    state: { settings, assets, groups, activeView },
    updateSettings,
    updateAsset,
    updateGroupTarget,
    setViewMode,
    calculated
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
