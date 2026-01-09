
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
  updateGroupTags: (groupId: string, tagIds: string[]) => void;
  createGroup: (name: string, viewType: ViewMode) => void;
  deleteGroup: (groupId: string) => void;
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
    groupMetrics: Record<string, { current: number; target: number; gap: number; completion: number; assets: Asset[] }>;
    tagMetrics: Array<{ id: string; name: string; color: string; value: number; percent: number }>;
  };
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error("Failed to load state", e); }
    return null;
  };

  const savedState = loadSavedState();

  const [settings, setSettings] = useState<GlobalSettings>(savedState?.settings || INITIAL_SETTINGS);
  const [assets, setAssets] = useState<Asset[]>(savedState?.assets || INITIAL_ASSETS);
  const [groups, setGroups] = useState<Group[]>(savedState?.groups || INITIAL_GROUPS);
  const [tags, setTags] = useState<Tag[]>(savedState?.tags || INITIAL_TAGS);
  const [activeView, setViewMode] = useState<ViewMode>(savedState?.activeView || 'attribution');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ settings, assets, groups, tags, activeView }));
      setIsSaving(false);
    }, 1000);
    return () => clearTimeout(handler);
  }, [settings, assets, groups, tags, activeView]);

  const updateSettings = useCallback((newSettings: Partial<GlobalSettings>) => setSettings(prev => ({ ...prev, ...newSettings })), []);
  const updateAsset = useCallback((id: string, value: number) => setAssets(prev => prev.map(a => a.id === id ? { ...a, value } : a)), []);
  const updateAssetTarget = useCallback((id: string, targetPercent: number) => setAssets(prev => prev.map(a => a.id === id ? { ...a, targetPercent } : a)), []);
  const updateGroupTarget = useCallback((id: string, targetPercent: number) => setGroups(prev => prev.map(g => g.id === id ? { ...g, targetPercent } : g)), []);
  const updateGroupTags = useCallback((groupId: string, tagIds: string[]) => setGroups(prev => prev.map(g => g.id === groupId ? { ...g, tagIds } : g)), []);

  const createGroup = useCallback((name: string, viewType: ViewMode) => {
    const colors = ['amber', 'indigo', 'red', 'blue', 'purple', 'emerald'];
    const themeColor = colors[groups.length % colors.length];
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      description: viewType === 'attribution' ? '自动根据标签聚合资产' : '手动配置资产列表',
      targetPercent: 0,
      assetIds: [],
      tagIds: [],
      themeColor,
      viewType
    };
    setGroups(prev => [...prev, newGroup]);
  }, [groups]);

  const deleteGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  }, []);

  const addAssetToGroup = useCallback((groupId: string, name: string) => {
    const group = groups.find(g => g.id === groupId);
    const newId = `asset-${Date.now()}`;
    const newAsset: Asset = { 
      id: newId, 
      name, 
      value: 0, 
      targetPercent: 0, 
      tagIds: group?.viewType === 'attribution' ? [...(group.tagIds || [])] : [] 
    };
    setAssets(prev => [...prev, newAsset]);
    if (group?.viewType === 'structural') {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, assetIds: [...g.assetIds, newId] } : g));
    }
  }, [groups]);

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

  const createTag = useCallback((name: string, color: string) => setTags(prev => [...prev, { id: `tag-${Date.now()}`, name, color }]), []);
  const updateTag = useCallback((tagId: string, name: string, color: string) => setTags(prev => prev.map(t => t.id === tagId ? { ...t, name, color } : t)), []);
  const deleteTag = useCallback((tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    setAssets(prev => prev.map(a => ({ ...a, tagIds: (a.tagIds || []).filter(id => id !== tagId) })));
    setGroups(prev => prev.map(g => ({ ...g, tagIds: (g.tagIds || []).filter(id => id !== tagId) })));
  }, []);

  const calculated = useMemo(() => {
    const totalCash = (settings.cashUSD * settings.usdRate) + (settings.cashJPY * settings.jpyRate);
    const totalInvested = assets.reduce((acc, a) => acc + a.value, 0);
    const plannedTotal = settings.plannedTotal || 1;
    const totalAssets = totalInvested + totalCash;
    const positionPercent = (totalInvested / plannedTotal) * 100;

    const groupMetrics: AppContextType['calculated']['groupMetrics'] = {};
    groups.forEach(group => {
      let groupAssets: Asset[] = [];
      if (group.viewType === 'attribution') {
        groupAssets = assets.filter(a => a.tagIds?.some(tid => group.tagIds?.includes(tid)));
      } else {
        groupAssets = assets.filter(a => group.assetIds.includes(a.id));
      }

      const current = groupAssets.reduce((sum, a) => sum + a.value, 0);
      const target = (plannedTotal * group.targetPercent) / 100;
      const gap = target - current;
      const completion = target > 0 ? (current / target) * 100 : 0;
      groupMetrics[group.id] = { current, target, gap, completion, assets: groupAssets };
    });

    const tagMetrics = tags.map(tag => {
      const value = assets.reduce((acc, asset) => asset.tagIds?.includes(tag.id) ? acc + asset.value : acc, 0);
      const percent = (value / plannedTotal) * 100;
      return { ...tag, value, percent };
    }).sort((a, b) => b.value - a.value);

    return { totalCash, totalInvested, totalAssets, plannedTotal, positionPercent, groupMetrics, tagMetrics };
  }, [settings, assets, groups, tags]);

  return (
    <AppContext.Provider value={{
      state: { settings, assets, groups, tags, activeView },
      updateSettings, updateAsset, updateAssetTarget, updateGroupTarget, updateGroupTags,
      createGroup, deleteGroup,
      addAssetToGroup, deleteAssetFromGroup, addTagToAsset, removeTagFromAsset, addAllTagsToAsset,
      createTag, updateTag, deleteTag, setViewMode, isSaving, calculated
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
