import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function LabTrends({ records = [] }) {
  // Aggregate tests across records sorted chronologically
  const trendsMap = {};

  const sortedRecords = [...records].sort((a, b) => a.record_date.localeCompare(b.record_date));

  sortedRecords.forEach((r) => {
    const tests = r.structured_data?.tests || [];
    tests.forEach((t) => {
      if (t.name && t.value !== undefined) {
        if (!trendsMap[t.name]) {
          trendsMap[t.name] = [];
        }
        trendsMap[t.name].push({
          date: r.record_date,
          value: t.value,
          unit: t.unit || '',
          flag: t.flag || 'NORMAL',
          low_ref: t.low_ref,
          high_ref: t.high_ref,
        });
      }
    });
  });

  const testNames = Object.keys(trendsMap);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-pink-500" />
        <h3 className="text-base font-bold text-slate-800">Laboratory Measurement Trends</h3>
      </div>

      {testNames.length === 0 ? (
        <div className="text-xs text-slate-400 p-4 bg-pink-50/50 rounded-2xl text-center">
          Upload blood or laboratory investigation reports to track repeated measurements over time.
        </div>
      ) : (
        <div className="space-y-3.5">
          {testNames.map((name) => {
            const series = trendsMap[name];
            const latest = series[series.length - 1];
            const isAbnormal = latest.flag === 'HIGH' || latest.flag === 'LOW';

            return (
              <div
                key={name}
                className="p-4 bg-white/90 rounded-2xl border border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAbnormal ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {latest.flag}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span>
                      Progression:{' '}
                      <strong className="text-slate-800">
                        {series.map((s) => s.value).join(' → ')} {latest.unit}
                      </strong>
                    </span>
                    {latest.low_ref !== undefined && latest.high_ref !== undefined && (
                      <span className="text-[11px] text-slate-400">
                        (Ref Range: {latest.low_ref} - {latest.high_ref} {latest.unit})
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <span>Latest: {latest.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
