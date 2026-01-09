
import React, { useState } from 'react';
import { useApp, AppProvider } from './store';
import SmartCard from './components/SmartCard';
import BottomSheet from './components/BottomSheet';
import EditorPanel from './components/EditorPanel';
import SettingsPanel from './components/SettingsPanel';
import AnalysisPanel from './components/AnalysisPanel';

const AppContent: React.FC = () => {
  const { state, setViewMode, createGroup, calculated } = useApp();
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const activeGroups = state.groups.filter(g => g.viewType === state.activeView);
  const editingGroup = state.groups.find(g => g.id === editingGroupId);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createGroup(newGroupName.trim(), state.activeView);
      setNewGroupName('');
      setIsAddingGroup(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Layer 1: Global Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">计划总额 Planned Goal</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px] font-black text-white">
                仓位 {calculated.positionPercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 leading-tight">¥{(calculated.plannedTotal / 10000).toFixed(1)}</span>
              <span className="text-sm font-bold text-slate-400">万</span>
              
              <div className="ml-2 pl-3 border-l border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">持有市值 Actual</div>
                <div className="text-sm font-black text-slate-600">¥{(calculated.totalInvested / 10000).toFixed(1)}<span className="text-[10px] font-bold ml-0.5">万</span></div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-2 text-left active:bg-indigo-100 transition-colors shrink-0"
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
        <div className="flex bg-slate-200/50 p-1 rounded-2xl">
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
      <main className="px-4 space-y-8">
        {/* Attribution Cards */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {state.activeView === 'structural' ? '资产结构分布 (Structure)' : '主题风险暴露 (Risk Attribution)'}
            </h2>
            <span className="text-[10px] font-bold text-indigo-500">点击卡片编辑</span>
          </div>
          <div className="space-y-4">
            {activeGroups.map(group => (
              <SmartCard key={group.id} group={group} onClick={() => setEditingGroupId(group.id)} />
            ))}
            
            {/* Add Group Action */}
            {!isAddingGroup ? (
              <button 
                onClick={() => setIsAddingGroup(true)}
                className="w-full py-6 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">新增板块 (Add Group)</span>
              </button>
            ) : (
              <form onSubmit={handleCreateGroup} className="p-6 bg-white rounded-[2rem] border border-indigo-100 shadow-sm animate-in zoom-in-95">
                <input 
                  autoFocus
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="板块名称, 如: 价值蓝筹..."
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none mb-3"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">确认添加</button>
                  <button type="button" onClick={() => setIsAddingGroup(false)} className="px-4 bg-slate-100 text-slate-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">取消</button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Tag Analysis Section */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              标签仓位分布 (Tag Distribution)
            </h2>
            <div className="text-[10px] font-bold text-slate-300">交叉统计</div>
          </div>
          
          <div className="space-y-5">
            {calculated.tagMetrics.map(tag => (
              <div key={tag.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${tag.color}-500 shadow-sm shadow-${tag.color}-200`} />
                    <span className="text-sm font-bold text-slate-700">{tag.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900">{tag.percent.toFixed(1)}%</span>
                    <span className="text-[10px] font-bold text-slate-400 ml-1">¥{(tag.value/1000).toFixed(1)}k</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${tag.color}-500 transition-all duration-1000 ease-out`}
                    style={{ width: `${tag.percent}%` }}
                  />
                </div>
              </div>
            ))}
            {calculated.tagMetrics.length === 0 && (
              <div className="text-center py-4 text-slate-300 text-xs italic">暂无标签数据，请在编辑页面为资产贴标</div>
            )}
          </div>
        </section>

        {/* Action Suggestion */}
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200">
          <div className="text-xs font-bold opacity-50 uppercase tracking-widest mb-2">💡 策略建议 Strategy Suggestion</div>
          <p className="text-lg font-bold leading-snug">
            您的 {activeGroups.find(g => calculated.groupMetrics[g.id].gap > 1000)?.name || '资产配置'} 目前处于低配状态，建议补充仓位。
          </p>
          <button 
            onClick={() => setIsAnalysisOpen(true)}
            className="mt-4 w-full bg-white text-slate-900 py-3 rounded-xl font-black text-sm active:scale-95 transition-transform"
          >
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

      {/* Analysis Bottom Sheet */}
      <BottomSheet
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        title="AI 持仓诊断 (Gemini Pro)"
      >
        <AnalysisPanel onClose={() => setIsAnalysisOpen(false)} />
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
