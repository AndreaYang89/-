
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { AppState, GlobalSettings, Asset, Group, Tag, ViewMode } from './types';
import { INITIAL_SETTINGS, INITIAL_ASSETS, INITIAL_GROUPS, INITIAL_TAGS } from './constants';

const LOCAL_STORAGE_KEY = 'assetwise_h5_data';

interface AppContextType {
  state: AppState;
  updateSettings: (settings: Partial<GlobalSettings>) => void;
  updateAsset: (id: string, value: number) => void;
  updateAssetTarget: (id: string, targetPercent: number) => void;
  updateGroupTarget: (id: string, targetPercent: number) => void;
  addAssetToGroup: (groupId: string, name: string) => void;
  deleteAssetFromGroup: (groupId: string, assetId: string) => void;
  addTagToAsset: (assetId: string, tagId: string) => void;
  removeTagFromAsset: (assetId: string, tagId: string) => void;
  addAllTagsToAsset: (assetId: string) => void;
  createTag: (name: string, color: string) => void;
  updateTag: (tagId: string, name: string, color: string) => void;
  deleteTag: (tagId: string) => void;
  setViewMode: (mode: ViewMode) => void;
  isSaving: boolean;
  calculated: {
    totalCash: number;
    totalInvested: number;
    totalAssets: number;
    plannedTotal: number;
    positionPercent: number;
    groupMetrics: Record<string, { current: number; target: number; gap: number; completion: number }>;
    tagMetrics: Array<{ id: string; name: string; color: string; value: number; percent: number }>;
  };
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load state from local storage", e);
    }
    return null;
  };

  const savedState = loadSavedState();

  const [settings, setSettings] = useState<GlobalSettings>(savedState?.settings || INITIAL_SETTINGS);
  const [assets, setAssets] = useState<Asset[]>(savedState?.assets || INITIAL_ASSETS);
  const [groups, setGroups] = useState<Group[]>(savedState?.groups || INITIAL_GROUPS);
  const [tags, setTags] = useState<Tag[]>(savedState?.tags || INITIAL_TAGS);
  const [activeView, setViewMode] = useState<ViewMode>('attribution');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(() => {
      const dataToSave = { settings, assets, groups, tags };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
      setIsSaving(false);
    }, 1500);

    return () => clearTimeout(handler);
  }, [settings, assets, groups, tags]);

  const updateSettings = useCallback((newSettings: Partial<GlobalSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateAsset = useCallback((id: string, value: number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, value } : a));
  }, []);

  const updateAssetTarget = useCallback((id: string, targetPercent: number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, targetPercent } : a));
  }, []);

  const updateGroupTarget = useCallback((id: string, targetPercent: number) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, targetPercent } : g));
  }, []);

  const addAssetToGroup = useCallback((groupId: string, name: string) => {
    const newId = `asset-${Date.now()}`;
    const newAsset: Asset = { id: newId, name, value: 0, targetPercent: 0, tagIds: [] };
    setAssets(prev => [...prev, newAsset]);
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, assetIds: [...g.assetIds, newId] } : g));
  }, []);

  const deleteAssetFromGroup = useCallback((groupId: string, assetId: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, assetIds: g.assetIds.filter(id => id !== assetId) } : g));
  }, []);

  const addTagToAsset = useCallback((assetId: string, tagId: string) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, tagIds: Array.from(new Set([...(a.tagIds || []), tagId])) } : a));
  }, []);

  const removeTagFromAsset = useCallback((assetId: string, tagId: string) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, tagIds: (a.tagIds || []).filter(id => id !== tagId) } : a));
  }, []);

  const addAllTagsToAsset = useCallback((assetId: string) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, tagIds: tags.map(t => t.id) } : a));
  }, [tags]);

  const createTag = useCallback((name: string, color: string) => {
    const newTag: Tag = { id: `tag-${Date.now()}`, name, color };
    setTags(prev => [...prev, newTag]);
  }, []);

  const updateTag = useCallback((tagId: string, name: string, color: string) => {
    setTags(prev => prev.map(t => t.id === tagId ? { ...t, name, color } : t));
  }, []);

  const deleteTag = useCallback((tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    setAssets(prev => prev.map(a => ({ ...a, tagIds: (a.tagIds || []).filter(id => id !== tagId) })));
  }, []);

  const calculated = useMemo(() => {
    const totalCash = (settings.cashUSD * settings.usdRate) + (settings.cashJPY * settings.jpyRate);
    const totalInvested = assets.reduce((acc, a) => acc + a.value, 0);
    const plannedTotal = settings.plannedTotal || 1;
    const totalAssets = totalInvested + totalCash;
    const positionPercent = (totalInvested / plannedTotal) * 100;

    const groupMetrics: AppContextType['calculated']['groupMetrics'] = {};
    groups.forEach(group => {
      const current = group.assetIds.reduce((acc, id) => {
        const asset = assets.find(a => a.id === id);
        return acc + (asset?.value || 0);
      }, 0);
      
      const target = (plannedTotal * group.targetPercent) / 100;
      const gap = target - current;
      const completion = target > 0 ? (current / target) * 100 : 0;
      groupMetrics[group.id] = { current, target, gap, completion };
    });

    const tagMetrics = tags.map(tag => {
      const value = assets.reduce((acc, asset) => {
        if (asset.tagIds?.includes(tag.id)) return acc + asset.value;
        return acc;
      }, 0);
      const percent = plannedTotal > 0 ? (value / plannedTotal) * 100 : 0;
      return { ...tag, value, percent };
    }).sort((a, b) => b.value - a.value);

    return { totalCash, totalInvested, totalAssets, plannedTotal, positionPercent, groupMetrics, tagMetrics };
  }, [settings, assets, groups, tags]);

  const value = {
    state: { settings, assets, groups, tags, activeView },
    updateSettings, updateAsset, updateAssetTarget, updateGroupTarget,
    addAssetToGroup, deleteAssetFromGroup, addTagToAsset, removeTagFromAsset, addAllTagsToAsset,
    createTag, updateTag, deleteTag, setViewMode, isSaving, calculated
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
