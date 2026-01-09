
import React from 'react';
import { Group } from '../types';
import { useApp } from '../store';

interface SmartCardProps {
  group: Group;
  onClick: () => void;
}

const SmartCard: React.FC<SmartCardProps> = ({ group, onClick }) => {
  const { calculated } = useApp();
  const metrics = calculated.groupMetrics[group.id];

  const themeClasses: Record<string, string> = {
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  const barClasses: Record<string, string> = {
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  const isUnderweight = metrics.gap > 0;

  return (
    <div 
      onClick={onClick}
      className={`mb-4 p-5 rounded-3xl border shadow-sm transition-all active:scale-[0.98] ${themeClasses[group.themeColor] || themeClasses.indigo}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold">{group.name}</h3>
          <p className="text-xs opacity-70 font-medium">{group.description}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold tracking-wider opacity-60">目标占比</div>
          <div className="text-lg font-black">{group.targetPercent}%</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-end mb-1.5">
          <span className="text-xs font-bold opacity-60 uppercase">当前市值</span>
          <span className="text-lg font-black tracking-tight">¥{metrics.current.toLocaleString()}</span>
        </div>
        <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden border border-black/5">
          <div 
            className={`h-full transition-all duration-700 ease-out ${barClasses[group.themeColor]}`}
            style={{ width: `${Math.min(metrics.completion, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] font-bold opacity-50 uppercase">
          <span>{metrics.completion.toFixed(1)}% 已完成</span>
          <span>目标 ¥{Math.round(metrics.target).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-black/5">
        <div className="flex items-center gap-2">
          {isUnderweight ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
              🔴 低配 Underweight
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
              🟢 健康 On Track
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold opacity-50 uppercase">
            {isUnderweight ? '建议买入' : '偏离额'}
          </div>
          <div className={`text-sm font-bold ${isUnderweight ? 'text-rose-600' : 'text-slate-600'}`}>
            ¥{Math.abs(Math.round(metrics.gap)).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartCard;
