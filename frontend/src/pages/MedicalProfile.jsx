import React, { useState, useEffect } from 'react';
import { getMedicalRecordsApi } from '../api/medicalRecords';
import { getRemindersApi } from '../api/medications';
import LabTrends from '../components/records/LabTrends';
import { User, Activity, AlertCircle, Pill, Clock, Compass, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function MedicalProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [records, setRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMedicalRecordsApi(), getRemindersApi()])
      .then(([recData, remData]) => {
        setRecords(recData);
        setReminders(remData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Aggregate diagnoses across records
  const allDiagnoses = Array.from(
    new Set(records.flatMap((r) => r.structured_data?.diagnoses || []))
  );

  // Aggregate medicines across records + active reminders
  const recordMeds = records.flatMap((r) =>
    (r.structured_data?.medications || []).map((m) => ({
      name: m.name || m,
      dosage: m.dosage || '',
      source: r.title,
      date: r.record_date,
    }))
  );

  // Aggregate abnormal findings
  const abnormalFindings = records.flatMap((r) =>
    (r.structured_data?.tests || [])
      .filter((t) => t.flag === 'HIGH' || t.flag === 'LOW')
      .map((t) => ({ ...t, date: r.record_date, source: r.title }))
  );

  // Chronological timeline
  const timelineRecords = [...records].sort((a, b) => b.record_date.localeCompare(a.record_date));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title & Patient Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-pink-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">
              {user?.profile?.full_name || user?.username}
            </h2>
            <div className="text-xs text-slate-500 flex flex-wrap gap-3 mt-1 font-medium">
              <span>Age: {user?.profile?.age || '--'}</span>
              <span>Height: {user?.profile?.height_cm || '--'} cm</span>
              <span>Weight: {user?.profile?.weight_kg || '--'} kg</span>
              {user?.abha_number && <span>ABHA: {user.abha_number}</span>}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs px-3 py-1 bg-white font-semibold rounded-full border border-pink-200 text-pink-700 shadow-xs">
            Unified Patient Profile
          </span>
        </div>
      </div>

      {/* Grid: Diagnoses, Medicines, Abnormal Findings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Diagnoses Card */}
        <div className="glass-card p-6 border-t-4 border-t-pink-500 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-pink-500" />
            <span>🩺 Diagnoses & Conditions</span>
          </h3>
          <p className="text-[11px] text-slate-400">Extracted from prescriptions and discharge records</p>
          <div className="space-y-1.5 pt-1">
            {allDiagnoses.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No diagnoses extracted yet.</div>
            ) : (
              allDiagnoses.map((d, i) => (
                <div key={i} className="text-xs bg-pink-50 text-pink-800 font-semibold p-2 rounded-xl border border-pink-100">
                  • {d}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Medicines Card */}
        <div className="glass-card p-6 border-t-4 border-t-purple-500 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Pill className="w-4 h-4 text-purple-500" />
            <span>💊 Active & Record Medicines</span>
          </h3>
          <p className="text-[11px] text-slate-400">Prescribed and currently active reminders</p>
          <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto pr-1">
            {reminders.map((r) => (
              <div key={r.id} className="text-xs bg-purple-50 text-purple-900 font-semibold p-2 rounded-xl border border-purple-100 flex items-center justify-between">
                <span>⏰ {r.medicine_name}</span>
                <span className="text-[10px] text-purple-600 font-bold">{r.reminder_time}</span>
              </div>
            ))}
            {recordMeds.map((m, i) => (
              <div key={i} className="text-xs bg-white text-slate-700 font-medium p-2 rounded-xl border border-pink-100">
                • <strong>{m.name}</strong> {m.dosage && `(${m.dosage})`}
              </div>
            ))}
            {reminders.length === 0 && recordMeds.length === 0 && (
              <div className="text-xs text-slate-400 italic">No medicines recorded yet.</div>
            )}
          </div>
        </div>

        {/* Abnormal Findings Card */}
        <div className="glass-card p-6 border-t-4 border-t-amber-500 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>⚠️ Abnormal Lab Flags</span>
          </h3>
          <p className="text-[11px] text-slate-400">Values outside normal clinical reference ranges</p>
          <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto pr-1">
            {abnormalFindings.length === 0 ? (
              <div className="text-xs text-emerald-600 font-semibold p-2 bg-emerald-50 rounded-xl">
                No abnormal findings detected! 🎉
              </div>
            ) : (
              abnormalFindings.map((t, i) => (
                <div key={i} className="text-xs bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200">
                  <div className="font-bold">{t.name}: {t.value} {t.unit} ({t.flag})</div>
                  <div className="text-[10px] text-amber-700">{t.source} · {t.date}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lab Trends Component */}
      <LabTrends records={records} />

      {/* Chronological Health Timeline */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Compass className="w-5 h-5 text-pink-500" />
          <span>🧭 Chronological Health Timeline</span>
        </h3>

        {timelineRecords.length === 0 ? (
          <div className="text-xs text-slate-400 p-6 bg-pink-50/50 rounded-2xl text-center">
            No clinical records logged yet. Add medical reports to generate your chronological timeline.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-pink-200 space-y-6">
            {timelineRecords.map((r) => (
              <div key={r.id} className="relative group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 border-2 border-white shadow-sm" />

                <div className="p-4 bg-white/90 rounded-2xl border border-pink-100 shadow-xs hover:border-pink-300 transition-colors">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-pink-600 font-bold">{r.record_date}</span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-bold">
                      {r.record_type}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{r.title}</h4>
                  {r.source_facility && (
                    <p className="text-xs text-slate-500 font-medium">{r.source_facility}</p>
                  )}
                  {r.raw_text && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">
                      "{r.raw_text}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
