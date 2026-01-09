
export type ViewMode = 'structural' | 'attribution';

export interface Asset {
  id: string;
  name: string;
  value: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  targetPercent: number;
  assetIds: string[];
  themeColor: string;
  viewType: ViewMode;
}

export interface GlobalSettings {
  aSharePool: number;
  globalPool: number;
  cashUSD: number;
  cashJPY: number;
  usdRate: number;
  jpyRate: number;
}

export interface AppState {
  settings: GlobalSettings;
  assets: Asset[];
  groups: Group[];
  activeView: ViewMode;
}
