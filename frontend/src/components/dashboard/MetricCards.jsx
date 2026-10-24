import React from 'react';
import { Droplets, Moon, Footprints, Smile } from 'lucide-react';

export default function MetricCards({ metrics = [] }) {
  const getIcon = (key) => {
    switch (key) {
      case 'water':
        return <Droplets className="w-5 h-5 text-sky-500" />;
      case 'sleep':
        return <Moon className="w-5 h-5 text-purple-500" />;
      case 'steps':
        return <Footprints className="w-5 h-5 text-orange-500" />;
      case 'mood':
        return <Smile className="w-5 h-5 text-pink-500" />;
      default:
        return <Droplets className="w-5 h-5 text-pink-500" />;
    }
  };

  const getBorderColor = (key) => {
    switch (key) {
      case 'water':
        return 'border-sky-200';
      case 'sleep':
        return 'border-purple-200';
      case 'steps':
        return 'border-orange-200';
      case 'mood':
        return 'border-pink-200';
      default:
        return 'border-pink-200';
    }
  };

  const getStrokeColor = (key) => {
    switch (key) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {metrics.filter((m) => !['water', 'sleep', 'steps', 'mood'].includes(m.key)).map((m) => {
        const radius = 24;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - m.progress_ratio);

        return (
          <div
            key={m.key}
            className={`glass-card p-5 relative overflow-hidden flex flex-col justify-between border-t-4 ${getBorderColor(
              m.key
            )}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {m.name}
              </span>
              <div className="p-2 rounded-xl bg-pink-50/70">{getIcon(m.key)}</div>
            </div>

            <div className="flex items-end justify-between mt-4">
              <div>
                <div className="text-3xl font-extrabold text-slate-800">
                  {m.value}
                  <span className="text-sm font-normal text-slate-400 ml-1">{m.unit}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Goal: {m.goal} {m.unit}
                </div>
              </div>

              {/* Progress Mini Ring */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg width="56" height="56" className="transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    fill="transparent"
                    stroke="#fce7f3"
                    strokeWidth="5"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    fill="transparent"
                    stroke={getStrokeColor(m.key)}
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-slate-700">
                  {m.percentage}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
