import React, { useState } from 'react';
import ChatWindow from '../components/chat/ChatWindow';
import { performQuickTaskApi } from '../api/chat';
import { Bot, Sparkles, Sun, Calendar, HelpCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AICopilot() {
  const { language, t } = useLanguage();
  const [quickResult, setQuickResult] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [loadingTask, setLoadingTask] = useState(false);

  const handleRunTask = async (taskType, title) => {
    setLoadingTask(true);
    setQuickTitle(title);
    setQuickResult('');
    try {
      const data = await performQuickTaskApi(taskType, '', language);
      setQuickResult(data.result_text);
    } catch (err) {
      setQuickResult('Could not complete this AI task right now.');
    } finally {
      setLoadingTask(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('aiCopilot')} Health Assistant</h2>
            <p className="text-xs text-slate-500">
              Interactive clinical assistant supporting English, தமிழ் (Tamil), Tanglish, हिन्दी, and తెలుగు
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Tools Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => handleRunTask('weekly_summary', 'Weekly Lifestyle Summary')}
          className="glass-card p-4 text-left border border-pink-100 hover:border-pink-300 transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 group-hover:bg-pink-100 transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Weekly Summary</h4>
            <p className="text-[11px] text-slate-400">Wins & action steps from 7-day data</p>
          </div>
        </button>

        <button
          onClick={() => handleRunTask('daily_tip', 'Daily Health & Hydration Tip')}
          className="glass-card p-4 text-left border border-pink-100 hover:border-pink-300 transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Tip of the Day</h4>
            <p className="text-[11px] text-slate-400">Personalized daily wellness boost</p>
          </div>
        </button>

        <button
          onClick={() => handleRunTask('doctor_questions', 'Questions for My Clinician')}
          className="glass-card p-4 text-left border border-pink-100 hover:border-pink-300 transition-all flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Doctor Questions</h4>
            <p className="text-[11px] text-slate-400">Prepare for doctor appointments</p>
          </div>
        </button>
      </div>

      {/* Quick Result Popup/Card */}
      {(loadingTask || quickResult) && (
        <div className="p-5 bg-gradient-to-r from-pink-50 via-purple-50 to-white rounded-3xl border border-pink-200 animate-slideDown shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-bold text-xs text-pink-700">
            <Sparkles className="w-4 h-4" />
            <span>{quickTitle}</span>
          </div>
          {loadingTask ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
              <span>Generating personalized response...</span>
            </div>
          ) : (
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
              {quickResult}
            </p>
          )}
        </div>
      )}

      {/* Main Conversational Chat Window */}
      <ChatWindow />
    </div>
  );
}
