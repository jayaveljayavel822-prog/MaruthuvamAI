import React from 'react';
import { useNavigate } from 'react-router-dom';
import HealthScoreRing from '../common/HealthScoreRing';
import { PenTool, FolderPlus, AlertCircle, Bot, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroBanner({ summary }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 p-6 sm:p-10 text-white shadow-2xl">
      {/* Aurora glow blobs */}
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-24 w-60 h-60 rounded-full bg-pink-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left greeting and action buttons */}
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-white/30">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{summary?.today_date_str || 'Today'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">
            {summary?.greeting || 'Hello!'}
          </h1>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-light">
            {summary?.wellness_message || 'Understand, organize, and manage your health journey today.'}
          </p>

          {/* Quick Actions */}
          <div className="pt-2 flex flex-wrap gap-2.5 justify-center md:justify-start">
            <button
              onClick={() => navigate('/tracking')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 backdrop-blur-md text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{t('logToday')}</span>
            </button>
            <button
              onClick={() => navigate('/records')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 backdrop-blur-md text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Add Medical Report</span>
            </button>
            <button
              onClick={() => navigate('/triage')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 backdrop-blur-md text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Check Urgency</span>
            </button>
            <button
              onClick={() => navigate('/copilot')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 backdrop-blur-md text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{t('askCopilot')}</span>
            </button>
          </div>
        </div>

        {/* Right Health Score Ring */}
        <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg">
          <HealthScoreRing
            score={summary?.health_score || 0}
            size={130}
            strokeWidth={9}
            label={t('healthScore')}
          />
          <p className="mt-2 text-[10px] text-white/80 max-w-[180px] text-center leading-tight">
            Transparent wellness index from daily logged water, sleep, steps & mood.
          </p>
        </div>
      </div>
    </div>
  );
}
