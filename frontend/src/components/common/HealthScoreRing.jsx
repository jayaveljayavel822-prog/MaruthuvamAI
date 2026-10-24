import React from 'react';

export default function HealthScoreRing({ score = 0, size = 120, strokeWidth = 8, label = 'Health Score' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, Math.round(score || 0)));
  const progressRatio = clampedScore / 100;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#ffffff"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-md"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-3xl font-extrabold tracking-tight">{clampedScore}</span>
          <span className="text-[10px] tracking-wider uppercase font-semibold opacity-90">%</span>
        </div>
      </div>
      {label && <small className="mt-1.5 text-xs text-white/90 font-medium tracking-wide">{label}</small>}
    </div>
  );
}
