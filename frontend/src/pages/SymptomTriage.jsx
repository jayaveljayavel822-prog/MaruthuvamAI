import React, { useState } from 'react';
import TriageForm from '../components/triage/TriageForm';
import EmergencyResult from '../components/triage/EmergencyResult';
import { AlertTriangle, PhoneCall, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SymptomTriage() {
  const { t } = useLanguage();
  const [assessmentResult, setAssessmentResult] = useState(null);

  const emergencyContacts = [
    { label: 'All Emergencies', number: '112', desc: 'Unified National Helpline' },
    { label: 'Ambulance', number: '108', desc: '24/7 Medical Emergency Response' },
    { label: 'Mother & Child', number: '102', desc: 'Maternal Transport Service' },
    { label: 'Tele-MANAS', number: '14416', desc: 'Mental Health Distress Support' },
    { label: 'National Poison Center', number: '1800-116-117', desc: 'Toxic Ingestion / Snakebite' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('triage')} & Urgency Guidance</h2>
            <p className="text-xs text-slate-500">Safety-first assessment based on clinician-reviewed red-flag rules</p>
          </div>
        </div>
      </div>

      {/* Emergency Quick Bar */}
      <div className="glass-card p-5 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
            Indian Emergency Response Helplines (Tap to Call)
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {emergencyContacts.map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number.replace(/-/g, '')}`}
              className="p-3 bg-white rounded-2xl border border-rose-100 hover:border-rose-300 text-center shadow-xs transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              <div className="text-sm font-black text-rose-600 flex items-center justify-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{c.number}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-800 mt-0.5">{c.label}</div>
              <div className="text-[10px] text-slate-400">{c.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Interactive Triage Form */}
      <TriageForm onAssessmentComplete={setAssessmentResult} />

      {/* Result Card */}
      <EmergencyResult result={assessmentResult} />
    </div>
  );
}
