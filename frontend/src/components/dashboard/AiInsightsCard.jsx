import React, { useState } from 'react';
import { performQuickTaskApi } from '../../api/chat';
import { Sparkles, Bot, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AiInsightsCard() {
  const { language, t } = useLanguage();
  const [insight, setInsight] = useState(
    'Analyses your medical records and daily wellness data together into UNDERSTAND, ORGANIZE, and MANAGE.'
  );
  const [loading, setLoading] = useState(false);

  const handleAnalyse = async () => {
    setLoading(true);
    try {
      const data = await performQuickTaskApi('cross_insights', '', language);
      setInsight(data.result_text);
    } catch (err) {
      setInsight('Could not generate insights right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 mt-6 border-l-4 border-l-pink-500">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Bot className="w-5 h-5 text-pink-500" />
          <span>{t('aiInsights')}</span>
          <span className="text-[10px] bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-2 py-0.5 rounded-full">
            AI Copilot
          </span>
        </h3>
      </div>

      <div className="p-4 bg-pink-50/50 rounded-2xl text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
        {insight}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[10px] text-slate-400">
          Provides lifestyle organization guidance only. Not an automated diagnosis.
        </p>
        <button
          onClick={handleAnalyse}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold shadow-md hover:opacity-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('analyseHealth')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
