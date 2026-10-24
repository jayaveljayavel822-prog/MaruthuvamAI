import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SmartAlerts({ alerts = [] }) {
  const { t } = useLanguage();

  return (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>{t('smartAlerts')}</span>
            <span className="text-[10px] font-semibold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
              rule-based
            </span>
          </h3>
        </div>

        <div className="space-y-2.5">
          {alerts.length === 0 ? (
            <div className="text-xs text-slate-400 p-3 bg-pink-50/50 rounded-2xl">
              No active alerts. Log your day to calculate recommendations.
            </div>
          ) : (
            alerts.map((a, i) => (
              <div
                key={a.id || i}
                className={`p-3 rounded-2xl text-xs font-medium flex items-start gap-2.5 border transition-all ${
                  a.level === 'ok'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : a.level === 'warning'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
                }`}
              >
                {a.level === 'ok' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : a.level === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                )}
                <span>{a.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-pink-50 text-[11px] text-slate-400">
        Alerts reflect your configured goals and logged values. Not automated clinical diagnosis.
      </div>
    </div>
  );
}
