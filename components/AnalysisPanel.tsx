
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { GoogleGenAI } from "@google/genai";

// 显式声明 process 以通过 TypeScript 编译检查
declare var process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  };
};

interface AnalysisPanelProps {
  onClose: () => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onClose }) => {
  const { state, calculated } = useApp();
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portfolioSummary = useMemo(() => {
    const groupDetails = state.groups.map(g => {
      const m = calculated.groupMetrics[g.id];
      return `- ${g.name}: 目标占比 ${g.targetPercent}%, 当前市值 ¥${m.current.toLocaleString()}, 偏差 ¥${Math.round(m.gap).toLocaleString()} (${m.gap > 0 ? '需买入' : '需调降'})`;
    }).join('\n');

    const assetDetails = state.assets.map(a => {
      const tags = (a.tagIds || []).map(tid => state.tags.find(t => t.id === tid)?.name).filter(Boolean).join(', ');
      return `- ${a.name}: 市值 ¥${a.value.toLocaleString()}, 目标占比 ${a.targetPercent}%${tags ? ` (标签: ${tags})` : ''}`;
    }).join('\n');

    const tagDetails = calculated.tagMetrics.map(t => `- ${t.name}: 占比 ${t.percent.toFixed(1)}%, 市值 ¥${t.value.toLocaleString()}`).join('\n');

    return `
# 资产配置诊断报告 (Portfolio Diagnostic)

## 核心参数 (Macro Settings)
- 计划总额 (Goal): ¥${calculated.plannedTotal.toLocaleString()}
- 持有市值 (Actual): ¥${calculated.totalInvested.toLocaleString()}
- 现金储备 (Dry Powder): ¥${Math.round(calculated.totalCash).toLocaleString()}
- 当前总仓位: ${calculated.positionPercent.toFixed(1)}%

## 板块分析 (Sector Groups)
${groupDetails}

## 个股/资产详情 (Asset Details)
${assetDetails}

## 标签分布 (Tag Distribution)
${tagDetails}
    `.trim();
  }, [state, calculated]);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
你是一位资深的全球资产配置专家。请根据以下持仓数据进行深度分析，并提供具体的“交易计划”建议。

持仓概况如下：
${portfolioSummary}

请按以下结构提供分析：
1. **持仓健康度评分** (1-10分) 及其核心理由。
2. **主要偏离预警**：指出哪些板块或资产偏离目标最严重，以及潜在风险。
3. **具体交易动作建议**：根据当前的现金储备(¥${Math.round(calculated.totalCash).toLocaleString()})，给出明确的买入/卖出优先级建议。
4. **宏观对冲建议**：基于目前的标签分布（如避险、增长等），提出优化的配置方向。

请使用专业、简洁、富有洞察力的语言回复。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      setAnalysisResult(response.text || "未能生成分析报告，请重试。");
    } catch (err) {
      console.error(err);
      setError("AI 分析请求失败，请检查网络或 API 配置。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyPrompt = () => {
    const fullPrompt = `请分析我的资产配置：\n\n${portfolioSummary}`;
    navigator.clipboard.writeText(fullPrompt);
    alert("持仓数据提示词已复制到剪贴板！");
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">持仓摘要 (Summary)</h3>
          <button 
            onClick={copyPrompt}
            className="text-[10px] font-black text-indigo-500 bg-white border border-indigo-100 px-3 py-1.5 rounded-xl shadow-sm active:scale-95 transition-transform"
          >
            复制提示词 (Copy Prompt)
          </button>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto no-scrollbar">
          <pre className="text-[10px] font-mono leading-relaxed text-slate-600 whitespace-pre-wrap">
            {portfolioSummary}
          </pre>
        </div>
      </section>

      {!analysisResult ? (
        <div className="space-y-4">
          <div className="p-6 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h4 className="text-lg font-black mb-2">启动 Gemini 深度诊断</h4>
            <p className="text-xs opacity-70 leading-relaxed mb-6 px-4">
              AI 将根据您的计划总额、现持仓、偏差额及现金储备，提供专业的调仓逻辑与风险对冲建议。
            </p>
            <button 
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className={`w-full bg-white text-indigo-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  正在深度诊断中...
                </>
              ) : '立即分析 (Analyze Now)'}
            </button>
          </div>
          {error && <p className="text-center text-xs font-bold text-rose-500">{error}</p>}
        </div>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              AI 交易计划建议
            </h3>
            <button 
              onClick={() => setAnalysisResult(null)}
              className="text-[10px] font-bold text-slate-400"
            >
              重新分析
            </button>
          </div>
          <div className="bg-slate-900 rounded-[2.5rem] p-6 text-slate-300 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="prose prose-invert prose-xs max-h-[50vh] overflow-y-auto no-scrollbar prose-p:leading-relaxed prose-li:my-1 text-sm font-medium leading-relaxed">
              {analysisResult.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-black text-white mb-4 mt-2">{line.replace('# ', '')}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-black text-indigo-400 mb-3 mt-4">{line.replace('## ', '')}</h2>;
                if (line.startsWith('**')) return <p key={i} className="text-white font-bold my-2">{line.replace(/\*\*/g, '')}</p>;
                if (line.startsWith('- ')) return <li key={i} className="ml-2 pl-1 mb-1">{line.replace('- ', '')}</li>;
                return <p key={i} className="mb-2 opacity-90">{line}</p>;
              })}
            </div>
            <button 
              onClick={onClose}
              className="mt-6 w-full bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-colors"
            >
              关闭并去执行 (Done)
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default AnalysisPanel;
