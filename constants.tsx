
import { Asset, Group, GlobalSettings, Tag } from './types';

export const INITIAL_SETTINGS: GlobalSettings = {
  plannedTotal: 500000,
  aSharePool: 240000,
  globalPool: 100000,
  cashUSD: 15000,
  cashJPY: 200000,
  usdRate: 7.23,
  jpyRate: 0.047
};

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag-growth', name: '高增长', color: 'rose' },
  { id: 'tag-value', name: '价值股', color: 'blue' },
  { id: 'tag-dividend', name: '高股息', color: 'emerald' },
  { id: 'tag-hedge', name: '避险', color: 'amber' },
  { id: 'tag-cycle', name: '周期', color: 'orange' }
];

export const INITIAL_ASSETS: Asset[] = [
  { id: 'zijin', name: '紫金矿业', value: 10365, targetPercent: 8, tagIds: ['tag-value', 'tag-hedge', 'tag-cycle'] },
  { id: 'youose', name: '有色ETF', value: 0, targetPercent: 5, tagIds: ['tag-growth', 'tag-cycle'] },
  { id: 'gold', name: '黄金ETF', value: 7052, targetPercent: 6, tagIds: ['tag-hedge'] },
  { id: 'kechuang', name: '科创50', value: 15400, targetPercent: 12, tagIds: ['tag-growth'] },
  { id: 'chip', name: '芯片ETF', value: 12012, targetPercent: 10, tagIds: ['tag-growth'] },
  { id: 'nvda', name: 'NVDA', value: 18000, targetPercent: 15, tagIds: ['tag-growth'] },
  { id: 'qqq', name: 'QQQ', value: 9000, targetPercent: 8, tagIds: ['tag-growth', 'tag-value'] }
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'res-group',
    name: '核心资源与避险',
    description: '自动归集：避险、周期标签资产',
    targetPercent: 19,
    assetIds: [], // Attribution view uses tagIds
    tagIds: ['tag-hedge', 'tag-cycle'],
    themeColor: 'amber',
    viewType: 'attribution'
  },
  {
    id: 'tech-group',
    name: '全球科技创新',
    description: '自动归集：高增长标签资产',
    targetPercent: 45,
    assetIds: [],
    tagIds: ['tag-growth'],
    themeColor: 'indigo',
    viewType: 'attribution'
  },
  {
    id: 'ashares-group',
    name: 'A股核心资产',
    description: '国内市场手动配置',
    targetPercent: 60,
    assetIds: ['zijin', 'youose', 'gold', 'kechuang', 'chip'],
    themeColor: 'red',
    viewType: 'structural'
  },
  {
    id: 'global-group',
    name: '全球市场配置',
    description: '海外资产手动配置',
    targetPercent: 40,
    assetIds: ['nvda', 'qqq'],
    themeColor: 'blue',
    viewType: 'structural'
  }
];
