
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
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">宏观资金池设定</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">A股策略总包 (CNY)</label>
            <input 
              type="number"
              value={settings.aSharePool || ''}
              onChange={(e) => updateSettings({ aSharePool: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-2xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">全球策略总包 (CNY等值)</label>
            <input 
              type="number"
              value={settings.globalPool || ''}
              onChange={(e) => updateSettings({ globalPool: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-2xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">现金储备 (Dry Powder)</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">美元 (USD)</label>
            <input 
              type="number"
              value={settings.cashUSD || ''}
              onChange={(e) => updateSettings({ cashUSD: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">日元 (JPY)</label>
            <input 
              type="number"
              value={settings.cashJPY || ''}
              onChange={(e) => updateSettings({ cashJPY: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xl font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">实时汇率折算合计</span>
          <span className="text-lg font-black text-indigo-600">¥{Math.round(calculated.totalCash).toLocaleString()}</span>
        </div>
      </section>

      <button 
        onClick={onClose}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform mt-4"
      >
        保存宏观设定
      </button>
    </div>
  );
};

export default SettingsPanel;
