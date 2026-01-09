
import React, { useState } from 'react';
import { useApp, AppProvider } from './store';
import SmartCard from './components/SmartCard';
import BottomSheet from './components/BottomSheet';
import EditorPanel from './components/EditorPanel';
import SettingsPanel from './components/SettingsPanel';
import { Group } from './types';

const AppContent: React.FC = () => {
  const { state, setViewMode, calculated } = useApp();
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeGroups = state.groups.filter(g => g.viewType === state.activeView);
  const editingGroup = state.groups.find(g => g.id === editingGroupId);

  return (
    <div className="min-h-screen pb-10">
      {/* Layer 1: Global Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">总资产 Total Assets</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">¥{(calculated.totalAssets / 10000).toFixed(1)}</span>
              <span className="text-sm font-bold text-slate-500">万</span>
              <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-black text-white">
                仓位 {calculated.positionPercent.toFixed(0)}%
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2 text-left active:bg-indigo-100 transition-colors"
          >
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">💵 现金弹药</div>
            <div className="text-sm font-black text-indigo-600 flex items-center">
              ¥{(calculated.totalCash / 10000).toFixed(1)}万 <span className="ml-1 text-[10px]">›</span>
            </div>
          </button>
        </div>
      </header>

      {/* Layer 2: View Switch Tabs */}
      <div className="px-4 mt-4 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setViewMode('structural')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              state.activeView === 'structural' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            🏛️ 结构视角
          </button>
          <button 
            onClick={() => setViewMode('attribution')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              state.activeView === 'attribution' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            🧭 归因视角
          </button>
        </div>
      </div>

      {/* Layer 3: Main Content */}
      <main className="px-4">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
            {state.activeView === 'structural' ? '资产结构分布 (Structure)' : '主题风险暴露 (Risk Attribution)'}
          </h2>
          <span className="text-[10px] font-bold text-indigo-500 animate-pulse">点击卡片可直接编辑</span>
        </div>

        <div className="space-y-4">
          {activeGroups.map(group => (
            <SmartCard 
              key={group.id} 
              group={group} 
              onClick={() => setEditingGroupId(group.id)} 
            />
          ))}
        </div>

        {/* Action Suggestion */}
        <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl shadow-slate-200">
          <div className="text-xs font-bold opacity-50 uppercase tracking-widest mb-2">💡 策略建议 Strategy Suggestion</div>
          <p className="text-lg font-bold leading-snug">
            您的 {activeGroups.find(g => calculated.groupMetrics[g.id].gap > 1000)?.name || '资产配置'} 目前处于低配状态，建议补充仓位。
          </p>
          <button className="mt-4 w-full bg-white text-slate-900 py-3 rounded-xl font-black text-sm active:scale-95 transition-transform">
            一键生成交易计划 (Trade Plan)
          </button>
        </div>
      </main>

      {/* Editing Bottom Sheet */}
      <BottomSheet 
        isOpen={!!editingGroupId} 
        onClose={() => setEditingGroupId(null)}
        title={editingGroup ? `编辑：${editingGroup.name}` : ''}
      >
        {editingGroup && (
          <EditorPanel group={editingGroup} onClose={() => setEditingGroupId(null)} />
        )}
      </BottomSheet>

      {/* Settings Bottom Sheet */}
      <BottomSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="宏观设定 Settings"
      >
        <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
      </BottomSheet>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
