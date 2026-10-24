import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { getDashboardTrendsApi } from '../../api/dashboard';
import { Flame, BarChart2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function WeeklyChart({ streak = 0 }) {
  const { t } = useLanguage();
  const [metric, setMetric] = useState('water');
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDashboardTrendsApi(metric)
      .then((data) => {
        if (active && data?.days) {
          setTrendData(data.days);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [metric]);

  const getMetricColor = () => {
    switch (metric) {
      case 'water':
        return '#38bdf8';
      case 'sleep':
        return '#a855f7';
      case 'steps':
        return '#fb923c';
      case 'mood':
        return '#f472b6';
      default:
        return '#ec4899';
    }
  };

  return (
    <div className="glass-card p-6 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{t('last7Days')}</h3>
            <p className="text-xs text-slate-400">Historical daily wellness records</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Logging Streak Badge */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs">
            <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
            <span>
              {t('streak')}: {streak} {streak === 1 ? 'day' : 'days'}
            </span>
          </div>

          {/* Metric Selector */}
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="bg-pink-50/70 border border-pink-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-pink-400 cursor-pointer"
          >
            <option value="water">💧 Water (glasses)</option>
            <option value="sleep">😴 Sleep (hours)</option>
            <option value="steps">👣 Steps</option>
            <option value="mood">🙂 Mood (1-5)</option>
          </select>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Loading 7-day health trend...
          </div>
        ) : trendData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No historical health logs found. Log today to start building charts.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fbcfe8" opacity={0.4} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9a6677', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9a6677', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '1rem',
                  border: '1px solid #fbcfe8',
                  boxShadow: '0 10px 25px rgba(224, 69, 123, 0.1)',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
                cursor={{ fill: 'rgba(244, 114, 182, 0.08)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {trendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getMetricColor()} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
