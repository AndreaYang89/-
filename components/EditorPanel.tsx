
import React from 'react';
import { Group } from '../types';
import { useApp } from '../store';

interface EditorPanelProps {
  group: Group;
  onClose: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ group, onClose }) => {
  const { state, updateAsset, updateGroupTarget, calculated } = useApp();
  const metrics = calculated.groupMetrics[group.id];

  const groupAssets = state.assets.filter(a => group.assetIds.includes(a.id));

  return (
    <div className="space-y-8">
      {/* Target Setting */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">调整目标 (Target Setting)</h3>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg font-bold">
            对应目标: ¥{Math.round(metrics.target).toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center gap-6 mb-6">
          <button 
            className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-bold active:bg-slate-200"
            onClick={() => updateGroupTarget(group.id, Math.max(0, group.targetPercent - 1))}
          >
            －
          </button>
          <div className="flex-1 text-center">
            <span className="text-5xl font-black text-slate-900">{group.targetPercent}</span>
            <span className="text-xl font-bold text-slate-400 ml-1">%</span>
          </div>
          <button 
            className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-bold active:bg-slate-200"
            onClick={() => updateGroupTarget(group.id, Math.min(100, group.targetPercent + 1))}
          >
            ＋
          </button>
        </div>

        <input 
          type="range" 
          min="0" 
          max="100" 
          value={group.targetPercent} 
          onChange={(e) => updateGroupTarget(group.id, parseInt(e.target.value))}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </section>

      <div className="h-px bg-slate-100 w-full" />

      {/* Actuals Updating */}
      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">更新现状 (Update Actuals)</h3>
        <div className="space-y-4">
          {groupAssets.map(asset => (
            <div key={asset.id} className="flex items-center justify-between">
              <label className="text-slate-700 font-bold">{asset.name}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">¥</span>
                <input 
                  type="number"
                  value={asset.value || ''}
                  onChange={(e) => updateAsset(asset.id, parseFloat(e.target.value) || 0)}
                  className="w-32 bg-slate-50 border-none rounded-xl py-3 pl-7 pr-3 text-right font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 text-slate-400">
            <span className="text-xs font-bold uppercase">当前总市值合计</span>
            <span className="font-black text-slate-900">¥{metrics.current.toLocaleString()}</span>
          </div>
        </div>
      </section>

      <div className="h-px bg-slate-100 w-full" />

      {/* Result Preview */}
      <section className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">实时结果预览 (Instant Result)</h3>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs font-bold text-slate-500">调整后新差值</div>
            <div className={`text-lg font-black ${metrics.gap > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {metrics.gap > 0 ? '🔴 需买入 ' : '🟢 需减仓 '} 
              ¥{Math.abs(Math.round(metrics.gap)).toLocaleString()}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
          >
            保存更改
          </button>
        </div>
      </section>
    </div>
  );
};

export default EditorPanel;
