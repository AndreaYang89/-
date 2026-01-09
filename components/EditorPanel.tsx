
import React, { useState } from 'react';
import { Group, Tag } from '../types';
import { useApp } from '../store';

interface EditorPanelProps {
  group: Group;
  onClose: () => void;
}

const COLOR_OPTIONS = ['rose', 'blue', 'emerald', 'amber', 'indigo', 'orange', 'purple', 'slate'];

const EditorPanel: React.FC<EditorPanelProps> = ({ group, onClose }) => {
  const { 
    state, updateAsset, updateAssetTarget, updateGroupTarget, 
    addAssetToGroup, deleteAssetFromGroup, addTagToAsset, 
    removeTagFromAsset, addAllTagsToAsset, createTag, updateTag, deleteTag, 
    calculated, isSaving 
  } = useApp();

  const [newAssetName, setNewAssetName] = useState('');
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [showTagCreator, setShowTagCreator] = useState(false);
  
  const metrics = calculated.groupMetrics[group.id];
  const groupAssets = state.assets.filter(a => group.assetIds.includes(a.id));
  const plannedTotal = calculated.plannedTotal || 1;

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssetName.trim()) {
      addAssetToGroup(group.id, newAssetName.trim());
      setNewAssetName('');
    }
  };

  const handleSaveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagName.trim()) {
      if (editingTagId) {
        updateTag(editingTagId, tagName.trim(), selectedColor);
      } else {
        createTag(tagName.trim(), selectedColor);
      }
      resetTagForm();
    }
  };

  const resetTagForm = () => {
    setTagName('');
    setEditingTagId(null);
    setShowTagCreator(false);
    setSelectedColor('indigo');
  };

  const startEditTag = (tag: Tag) => {
    setEditingTagId(tag.id);
    setTagName(tag.name);
    setSelectedColor(tag.color);
    setShowTagCreator(true);
  };

  return (
    <div className="space-y-8 pb-4">
      {/* 1. Group Strategy Header */}
      <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">板块战略目标 (Group Strategy)</h3>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-indigo-500 uppercase">当前目标总额</span>
            <span className="text-sm font-black text-slate-900">¥{Math.round(metrics.target).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mb-8">
          <button 
            className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold active:scale-90 transition-transform text-slate-400 border border-slate-100"
            onClick={() => updateGroupTarget(group.id, Math.max(0, group.targetPercent - 1))}
          >
            －
          </button>
          <div className="flex-1 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-slate-900">{group.targetPercent}</span>
              <span className="text-xl font-bold text-slate-400 ml-1">%</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">占计划总额比重</p>
          </div>
          <button 
            className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold active:scale-90 transition-transform text-slate-400 border border-slate-100"
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
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
        />
      </section>

      {/* 2. Tag Hub */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">标签中心 (Tag Hub)</h3>
          <button 
            onClick={() => setShowTagCreator(!showTagCreator)}
            className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            {showTagCreator ? '取消' : '+ 新建'}
          </button>
        </div>

        {showTagCreator && (
          <form onSubmit={handleSaveTag} className="p-4 bg-white rounded-2xl border border-indigo-100 mb-4 space-y-4 animate-in slide-in-from-top-2 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {editingTagId ? '正在编辑标签' : '创建新标签'}
              </span>
              {editingTagId && (
                <button 
                  type="button" 
                  onClick={() => { if(confirm('确定删除此标签吗？')) { deleteTag(editingTagId); resetTagForm(); } }}
                  className="text-[10px] font-bold text-rose-500 uppercase"
                >
                  删除标签
                </button>
              )}
            </div>
            <input 
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="标签名称..."
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2.5 flex-wrap justify-center">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-slate-900 scale-125' : 'border-transparent'
                  } bg-${color}-500 shadow-sm`}
                />
              ))}
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
            >
              {editingTagId ? '保存修改' : '创建标签'}
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {state.tags.map(tag => (
             <button 
               key={tag.id} 
               onClick={() => startEditTag(tag)}
               className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-${tag.color}-100 text-${tag.color}-700 border border-${tag.color}-200/50 active:scale-95 transition-transform flex items-center gap-1.5`}
             >
                {tag.name}
                <svg className="w-2.5 h-2.5 opacity-40" fill="currentColor" viewBox="0 0 24 24"><path d="M7.127 22.562l-7.127 1.438 1.438-7.128 5.689 5.69zm1.414-1.414l11.228-11.225-5.69-5.692-11.227 11.227 5.689 5.69zm9.768-21.148l-2.816 2.817 5.691 5.691 2.816-2.819-5.691-5.689z"/></svg>
             </button>
          ))}
        </div>
      </section>

      {/* 3. Assets Detail Breakdown */}
      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">资产配比明细 (Details)</h3>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-full">
            {groupAssets.length} 资产项
          </span>
        </div>
        
        <div className="space-y-6">
          {groupAssets.map(asset => {
            const actualPercent = (asset.value / plannedTotal) * 100;
            const targetAmount = (plannedTotal * asset.targetPercent) / 100;
            const gapAmount = targetAmount - asset.value;
            const gapStatus = gapAmount > 0 ? 'under' : 'over';
            const progress = targetAmount > 0 ? (asset.value / targetAmount) * 100 : (asset.value > 0 ? 100 : 0);

            return (
              <div key={asset.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Asset Header */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                  <div className="space-y-2 flex-1 mr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{asset.name}</span>
                      <button 
                        onClick={() => { if(confirm(`确定从板块中移除 ${asset.name} 吗？`)) deleteAssetFromGroup(group.id, asset.id); }}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tagIds?.map(tid => {
                        const tag = state.tags.find(t => t.id === tid);
                        if (!tag) return null;
                        return (
                          <span 
                            key={tid} 
                            onClick={() => removeTagFromAsset(asset.id, tid)}
                            className={`px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter bg-${tag.color}-500 text-white flex items-center gap-1 active:scale-95`}
                          >
                            {tag.name} ✕
                          </span>
                        );
                      })}
                      
                      <div className="flex gap-1 items-center">
                        <select 
                          className="appearance-none bg-slate-200 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-none focus:ring-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.value) addTagToAsset(asset.id, e.target.value);
                            e.target.value = "";
                          }}
                        >
                          <option value="">+ 贴标</option>
                          {state.tags.filter(t => !asset.tagIds?.includes(t.id)).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>

                        <button 
                          onClick={() => addAllTagsToAsset(asset.id)}
                          className="bg-indigo-100 text-indigo-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg active:scale-95 transition-transform"
                        >
                          全选
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">现持有占比</div>
                    <div className="text-sm font-black text-slate-900">{actualPercent.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Edit Controls */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">持有市值 (¥)</label>
                    <input 
                      type="number"
                      value={asset.value || ''}
                      onChange={(e) => updateAsset(asset.id, parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-2.5 px-4 text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">配比占比 (%)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={asset.targetPercent || ''}
                        onChange={(e) => updateAssetTarget(asset.id, parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-2.5 px-4 text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">%</span>
                    </div>
                  </div>
                </div>

                {/* Analysis Info & Integrated Progress Bar */}
                <div className="px-4 pb-4">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex gap-4">
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">目标金额</div>
                        <div className="text-[11px] font-black text-slate-700 leading-none">¥{Math.round(targetAmount).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">偏差</div>
                        <div className={`text-[11px] font-black leading-none ${gapStatus === 'under' ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {gapStatus === 'under' ? '需补 ' : '多出 '} 
                          ¥{Math.abs(Math.round(gapAmount)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-slate-900 leading-none">{progress.toFixed(0)}%</div>
                  </div>
                  
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${gapStatus === 'under' ? 'bg-rose-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <form onSubmit={handleAddAsset} className="flex gap-2">
            <input 
              type="text"
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              placeholder="新增资产, 如: 科创芯片..."
              className="flex-1 bg-white border border-dashed border-slate-300 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              type="submit" 
              disabled={!newAssetName.trim()} 
              className="px-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-lg disabled:opacity-30 transition-all active:scale-95"
            >
              添加
            </button>
          </form>
        </div>
      </section>

      {/* 4. Bottom Summary Bar */}
      <section className="bg-slate-900 rounded-[2rem] p-6 shadow-xl shadow-slate-200 text-white">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="opacity-50 uppercase tracking-widest">子资产配比合计</span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-lg font-black ${Math.abs(groupAssets.reduce((s, a) => s + a.targetPercent, 0) - group.targetPercent) < 0.1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {groupAssets.reduce((s, a) => s + a.targetPercent, 0).toFixed(1)}% / {group.targetPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="h-px bg-white/10" />

          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">板块总体偏差 (Group Gap)</div>
              <div className={`text-2xl font-black tracking-tighter ${metrics.gap > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {metrics.gap > 0 ? '需补充 ¥' : '需调降 ¥'} 
                {Math.abs(Math.round(metrics.gap)).toLocaleString()}
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={onClose} 
                className="bg-white text-slate-900 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </button>
              
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="text-[8px] font-black uppercase opacity-60 tracking-wider">
                  {isSaving ? 'Saving...' : 'Auto-saved'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditorPanel;
