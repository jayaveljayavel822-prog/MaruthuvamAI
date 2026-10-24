import React from 'react';
import { PhoneCall, AlertTriangle, CheckCircle, Navigation, ShieldAlert } from 'lucide-react';

export default function EmergencyResult({ result }) {
  if (!result) return null;

  const isEmergency = result.level_code === 2;
  const isUrgent = result.level_code === 1;

  const bannerColor = isEmergency
    ? 'bg-rose-600 text-white shadow-rose-200'
    : isUrgent
    ? 'bg-amber-500 text-white shadow-amber-200'
    : 'bg-emerald-600 text-white shadow-emerald-200';

  return (
    <div className="glass-card p-6 mt-6 space-y-5 animate-slideUp border-2 border-rose-100">
      {/* Top Urgency Header */}
      <div className={`p-5 rounded-2xl shadow-lg flex items-center justify-between ${bannerColor}`}>
        <div className="flex items-center gap-3">
          {isEmergency ? (
            <ShieldAlert className="w-8 h-8 animate-bounce shrink-0" />
          ) : isUrgent ? (
            <AlertTriangle className="w-8 h-8 shrink-0" />
          ) : (
            <CheckCircle className="w-8 h-8 shrink-0" />
          )}
          <div>
            <h3 className="text-xl font-black tracking-tight">{result.title}</h3>
            <p className="text-xs text-white/90 font-medium mt-0.5">{result.action_guidance}</p>
          </div>
        </div>
      </div>

      {/* Immediate Emergency Action Calling */}
      {isEmergency && (
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-rose-900 font-bold text-xs">
            🚨 Immediate Action: Do not delay care. Tap below to call emergency services:
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:108"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-xs shadow-md transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 108 (Ambulance)</span>
            </a>
            <a
              href="tel:112"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-full text-xs shadow-md transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 112 (Helpline)</span>
            </a>
          </div>
        </div>
      )}

      {/* First Aid Guidance */}
      {result.first_aid_advice && (
        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium">
          <strong className="block mb-1 text-amber-950 font-bold">🩺 First Aid Guidance:</strong>
          {result.first_aid_advice}
        </div>
      )}

      {/* Matched Reasons */}
      {result.matched_reasons?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 mb-2">Evaluated Contributing Factors:</h4>
          <ul className="space-y-1.5">
            {result.matched_reasons.map((r, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nearby Care Navigation Button */}
      <div className="flex items-center gap-3 pt-2">
        <a
          href="https://www.google.com/maps/search/emergency+hospital+24+hours"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-full text-xs font-bold shadow-md transition-all"
        >
          <Navigation className="w-4 h-4 text-pink-400" />
          <span>Find 24/7 Emergency Hospitals on Maps</span>
        </a>
      </div>

      {/* Clinical Disclaimer */}
      <div className="pt-3 border-t border-pink-100 text-[11px] text-slate-400">
        {result.disclaimer}
      </div>
    </div>
  );
}
