
import React, { useState } from 'react';
import { Group, Tag, Asset } from '../types';
import { useApp } from '../store';

interface EditorPanelProps {
  group: Group;
  onClose: () => void;
}

const COLOR_OPTIONS = ['rose', 'blue', 'emerald', 'amber', 'indigo', 'orange', 'purple', 'slate', 'red'];

const EditorPanel: React.FC<EditorPanelProps> = ({ group, onClose }) => {
  const { 
    state, updateAsset, updateAssetTarget, updateGroupTarget, updateGroupTags, deleteGroup,
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
  const groupAssets = metrics.assets;
  const plannedTotal = calculated.plannedTotal || 1;

  // 计算子资产配比合计
  const totalSubTargetPercent = groupAssets.reduce((sum, asset) => sum + (asset.targetPercent || 0), 0);
  const isAllocationMismatch = Math.abs(totalSubTargetPercent - group.targetPercent) > 0.01;

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssetName.trim()) {
      addAssetToGroup(group.id, newAssetName.trim());
      setNewAssetName('');
    }
  };

  const handleToggleGroupTag = (tagId: string) => {
    const currentTags = group.tagIds || [];
    const newTags = currentTags.includes(tagId) 
      ? currentTags.filter(id => id !== tagId) 
      : [...currentTags, tagId];
    updateGroupTags(group.id, newTags);
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

  const handleDeleteGroup = () => {
    if (confirm(`确定要删除“${group.name}”板块吗？此操作不可撤销。`)) {
      deleteGroup(group.id);
      onClose();
    }
  };

  return (
    <div className="space-y-8 pb-4">
      {/* 1. Group Strategy Header */}
      <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">板块目标设定 (Strategy)</h3>
            <button 
              onClick={handleDeleteGroup}
              className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg active:scale-95 transition-transform"
            >
              删除板块
            </button>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-indigo-500 uppercase">目标金额</span>
            <span className="text-sm font-black text-slate-900">¥{Math.round(metrics.target).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 mb-8">
          <button 
            className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold active:scale-90 transition-transform text-slate-400 border border-slate-100"
            onClick={() => updateGroupTarget(group.id, Math.max(0, group.targetPercent - 1))}
          >－</button>
          <div className="flex-1 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-slate-900">{group.targetPercent}</span>
              <span className="text-xl font-bold text-slate-400 ml-1">%</span>
            </div>
          </div>
          <button 
            className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold active:scale-90 transition-transform text-slate-400 border border-slate-100"
            onClick={() => updateGroupTarget(group.id, Math.min(100, group.targetPercent + 1))}
          >＋</button>
        </div>

        <input type="range" min="0" max="100" value={group.targetPercent} onChange={(e) => updateGroupTarget(group.id, parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2" />
      </section>

      {/* 2. Attribution Rules (Only for attribution view) */}
      {group.viewType === 'attribution' && (
        <section className="bg-indigo-50/30 p-5 rounded-[2rem] border border-indigo-100/50">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">归因逻辑定义 (Attribution Rule)</h3>
            <span className="text-[10px] font-bold text-indigo-300">多选标签自动聚合资产</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.tags.map(tag => {
              const isActive = group.tagIds?.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => handleToggleGroupTag(tag.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                    isActive 
                      ? `bg-${tag.color}-500 text-white shadow-lg shadow-${tag.color}-100` 
                      : `bg-white text-slate-400 border border-slate-100`
                  }`}
                >
                  {tag.name} {isActive ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Validation Alert */}
      {isAllocationMismatch && (
        <div className="mx-1 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-pulse shadow-sm shadow-rose-100">
          <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
            <h4 className="text-xs font-black text-rose-700 uppercase mb-0.5">配比不平衡 (Imbalance)</h4>
            <p className="text-[10px] font-bold text-rose-500 leading-relaxed">
              子资产目标配比合计为 <span className="underline decoration-2">{totalSubTargetPercent.toFixed(1)}%</span>，
              而板块设定的目标配比为 <span className="underline decoration-2">{group.targetPercent.toFixed(1)}%</span>。
              请调整子资产比例以匹配板块战略。
            </p>
          </div>
        </div>
      )}

      {/* 4. Tag Hub */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">标签管理中心 (Tag Hub)</h3>
          <button onClick={() => setShowTagCreator(!showTagCreator)} className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">{showTagCreator ? '取消' : '+ 新建'}</button>
        </div>

        {showTagCreator && (
          <form onSubmit={handleSaveTag} className="p-4 bg-white rounded-2xl border border-indigo-100 mb-4 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{editingTagId ? '编辑标签' : '创建新标签'}</span>
              {editingTagId && <button type="button" onClick={() => { if(confirm('删除标签将从所有资产和板块规则中移除，确定？')) { deleteTag(editingTagId); resetTagForm(); } }} className="text-[10px] font-bold text-rose-500 uppercase">删除</button>}
            </div>
            <input type="text" value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="名称..." className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none" />
            <div className="flex gap-2 flex-wrap justify-center">
              {COLOR_OPTIONS.map(color => (
                <button key={color} type="button" onClick={() => setSelectedColor(color)} className={`w-7 h-7 rounded-full border-2 ${selectedColor === color ? 'border-slate-900 scale-125' : 'border-transparent'} bg-${color}-500 shadow-sm`} />
              ))}
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-transform">{editingTagId ? '保存' : '创建'}</button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {state.tags.map(tag => (
             <button key={tag.id} onClick={() => startEditTag(tag)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-${tag.color}-100 text-${tag.color}-700 border border-${tag.color}-200/50 flex items-center gap-1.5`}>
                {tag.name}
             </button>
          ))}
        </div>
      </section>

      {/* 5. Assets Detail Breakdown */}
      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">包含资产明细 (Assets)</h3>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-full">{groupAssets.length} 项</span>
        </div>
        
        <div className="space-y-6">
          {groupAssets.map(asset => {
            const actualPercent = (asset.value / plannedTotal) * 100;
            const targetAmount = (plannedTotal * asset.targetPercent) / 100;
            const gapAmount = targetAmount - asset.value;
            const progress = targetAmount > 0 ? (asset.value / targetAmount) * 100 : (asset.value > 0 ? 100 : 0);

            return (
              <div key={asset.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                  <div className="space-y-2 flex-1 mr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{asset.name}</span>
                      {group.viewType === 'structural' && (
                        <button onClick={() => { if(confirm(`确定移除 ${asset.name} 吗？`)) deleteAssetFromGroup(group.id, asset.id); }} className="p-1 text-slate-300 hover:text-rose-500">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tagIds?.map(tid => {
                        const tag = state.tags.find(t => t.id === tid);
                        if (!tag) return null;
                        return (
                          <span key={tid} onClick={() => removeTagFromAsset(asset.id, tid)} className={`px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter bg-${tag.color}-500 text-white flex items-center gap-1`}>
                            {tag.name} ✕
                          </span>
                        );
                      })}
                      <div className="flex gap-1 items-center">
                        <select className="appearance-none bg-slate-200 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg focus:ring-0" onChange={(e) => { if (e.target.value) addTagToAsset(asset.id, e.target.value); e.target.value = ""; }}>
                          <option value="">+ 贴标</option>
                          {state.tags.filter(t => !asset.tagIds?.includes(t.id)).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button onClick={() => addAllTagsToAsset(asset.id)} className="bg-indigo-100 text-indigo-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg">全选</button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">持仓占比</div>
                    <div className="text-sm font-black text-slate-900">{actualPercent.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase block">市值 (¥)</label>
                    <input type="number" value={asset.value || ''} onChange={(e) => updateAsset(asset.id, parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border-none rounded-2xl py-2.5 px-4 text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase block">配比 (%)</label>
                    <div className="relative">
                      <input type="number" value={asset.targetPercent || ''} onChange={(e) => updateAssetTarget(asset.id, parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border-none rounded-2xl py-2.5 px-4 text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex gap-4">
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">目标额</div>
                        <div className="text-[11px] font-black text-slate-700">¥{Math.round(targetAmount).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">偏差</div>
                        <div className={`text-[11px] font-black ${gapAmount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>¥{Math.abs(Math.round(gapAmount)).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-slate-900">{progress.toFixed(0)}%</div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-700 ${gapAmount > 0 ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}

          <form onSubmit={handleAddAsset} className="flex gap-2">
            <input type="text" value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)} placeholder="新增资产项..." className="flex-1 bg-white border border-dashed border-slate-300 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
            <button type="submit" disabled={!newAssetName.trim()} className="px-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase shadow-lg disabled:opacity-30">添加</button>
          </form>
        </div>
      </section>

      {/* 6. Bottom Summary Bar */}
      <section className="bg-slate-900 rounded-[2rem] p-6 shadow-xl text-white">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
              配比对齐情况 
              <span className={`w-1.5 h-1.5 rounded-full ${isAllocationMismatch ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            </div>
            <div className={`text-sm font-black ${isAllocationMismatch ? 'text-amber-400' : 'text-emerald-400'}`}>
              {totalSubTargetPercent.toFixed(1)}% / {group.targetPercent.toFixed(1)}%
            </div>
            <div className="h-px w-full bg-white/10 my-2" />
            <div className="text-[10px] font-bold opacity-50 uppercase">板块总体偏差</div>
            <div className={`text-2xl font-black ${metrics.gap > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {metrics.gap > 0 ? '需补 ¥' : '需降 ¥'}{Math.abs(Math.round(metrics.gap)).toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} className="bg-white text-slate-900 w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform shadow-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
        <div className="flex items-center gap-1.5 opacity-60">
          <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="text-[8px] font-black uppercase">{isSaving ? 'Saving...' : 'Auto-saved'}</span>
        </div>
      </section>
    </div>
  );
};

export default EditorPanel;
