
import { Asset, Group, GlobalSettings, ViewMode } from './types';

export const INITIAL_SETTINGS: GlobalSettings = {
  aSharePool: 240000,
  globalPool: 100000,
  cashUSD: 15000,
  cashJPY: 200000,
  usdRate: 7.23,
  jpyRate: 0.047
};

export const INITIAL_ASSETS: Asset[] = [
  { id: 'zijin', name: '紫金矿业', value: 10365 },
  { id: 'youose', name: '有色ETF', value: 0 },
  { id: 'gold', name: '黄金ETF', value: 7052 },
  { id: 'kechuang', name: '科创50', value: 15400 },
  { id: 'chip', name: '芯片ETF', value: 12012 },
  { id: 'nvda', name: 'NVDA', value: 18000 },
  { id: 'qqq', name: 'QQQ', value: 9000 }
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'res-group',
    name: '核心资源与避险',
    description: '紫金+有色+黄金',
    targetPercent: 19,
    assetIds: ['zijin', 'youose', 'gold'],
    themeColor: 'amber',
    viewType: 'attribution'
  },
  {
    id: 'tech-group',
    name: '全球科技创新',
    description: '科创+芯片+英伟达+QQQ',
    targetPercent: 45,
    assetIds: ['kechuang', 'chip', 'nvda', 'qqq'],
    themeColor: 'indigo',
    viewType: 'attribution'
  },
  {
    id: 'ashares-group',
    name: 'A股核心资产',
    description: '国内市场配置',
    targetPercent: 60,
    assetIds: ['zijin', 'youose', 'gold', 'kechuang', 'chip'],
    themeColor: 'red',
    viewType: 'structural'
  },
  {
    id: 'global-group',
    name: '全球市场配置',
    description: '美股/日股/港股',
    targetPercent: 40,
    assetIds: ['nvda', 'qqq'],
    themeColor: 'blue',
    viewType: 'structural'
  }
];
