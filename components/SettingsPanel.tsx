
import React from 'react';
import { useApp } from '../store';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { state, updateSettings, calculated } = useApp();
  const { settings } = state;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">核心资产配置目标</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-3xl space-y-2">
            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">年度总投资计划 (Goal)</label>
            <div className="relative">
               <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-black text-indigo-300">¥</span>
               <input 
                 type="number"
                 value={settings.plannedTotal || ''}
                 onChange={(e) => updateSettings({ plannedTotal: parseFloat(e.target.value) || 0 })}
                 className="w-full bg-transparent border-none rounded-2xl pl-6 py-2 text-3xl font-black text-slate-900 focus:ring-0"
                 placeholder="0"
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A股策略包</label>
              <input 
                type="number"
                value={settings.aSharePool || ''}
                onChange={(e) => updateSettings({ aSharePool: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">全球策略包</label>
              <input 
                type="number"
                value={settings.globalPool || ''}
                onChange={(e) => updateSettings({ globalPool: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">现金储备 (Dry Powder)</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">美元 (USD)</label>
            <input 
              type="number"
              value={settings.cashUSD || ''}
              onChange={(e) => updateSettings({ cashUSD: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-lg font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">日元 (JPY)</label>
            <input 
              type="number"
              value={settings.cashJPY || ''}
              onChange={(e) => updateSettings({ cashJPY: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-lg font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="mt-4 p-5 bg-slate-900 rounded-[2rem] flex justify-between items-center text-white shadow-xl shadow-slate-200">
          <div>
            <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">折算人民币现金合计</div>
            <div className="text-xl font-black">¥{Math.round(calculated.totalCash).toLocaleString()}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </section>

      <button 
        onClick={onClose}
        className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-transform mt-4"
      >
        确认更新全局参数
      </button>
    </div>
  );
};

export default SettingsPanel;
