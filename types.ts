
export type ViewMode = 'structural' | 'attribution';

export interface Tag {
  id: string;
  name: string;
  color: string; // Tailwind color name like 'rose', 'blue', etc.
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  targetPercent: number; // Allocation target relative to the total portfolio
  tagIds?: string[];
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
  plannedTotal: number; // The user-defined target total portfolio size
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
  tags: Tag[];
  activeView: ViewMode;
}
