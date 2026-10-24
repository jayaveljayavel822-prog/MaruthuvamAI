import React, { useState } from 'react';
import { Sparkles, Trash2, Calendar, Hospital, Pill, Activity, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { explainRecordApi } from '../../api/medicalRecords';

export default function RecordCard({ record, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  const typeConfig = {
    rx: { label: '💊 Prescription', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    lab: { label: '🧪 Lab Report', color: 'bg-sky-100 text-sky-700 border-sky-200' },
    dc: { label: '🏥 Discharge Summary', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    dx: { label: '🩻 Diagnostic', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    other: { label: '📁 Medical Document', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  };

  const currentType = typeConfig[record.record_type] || typeConfig['other'];
  const structured = record.structured_data || {};

  const handleExplain = async () => {
    if (aiExplanation) {
      setExpanded(true);
      return;
    }
    setExplaining(true);
    try {
      const data = await explainRecordApi(record.id);
      setAiExplanation(data.explanation);
      setExpanded(true);
    } catch (err) {
      setAiExplanation('Could not explain this document right now.');
    } finally {
      setExplaining(false);
    }
  };

  return (
    <div className="glass-card p-5 border border-pink-100 space-y-3.5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentType.color}`}>
            {currentType.label}
          </span>
          <h4 className="text-sm font-bold text-slate-800">{record.title}</h4>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{record.record_date}</span>
          </div>
          {record.source_facility && (
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <Hospital className="w-3.5 h-3.5" />
              <span>{record.source_facility}</span>
            </div>
          )}
        </div>
      </div>

      {/* Raw Text Body */}
      {record.raw_text && (
        <p className="text-xs text-slate-600 leading-relaxed font-normal whitespace-pre-wrap bg-pink-50/40 p-3 rounded-2xl border border-pink-50">
          {record.raw_text}
        </p>
      )}

      {/* Structured Medical Badges */}
      {structured.diagnoses?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] font-bold text-slate-400">Diagnosis:</span>
          {structured.diagnoses.map((d, i) => (
            <span key={i} className="text-[11px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-semibold border border-rose-100">
              • {d}
            </span>
          ))}
        </div>
      )}

      {structured.medications?.length > 0 && (
        <div className="space-y-1">
          {structured.medications.map((m, i) => (
            <div key={i} className="text-[11px] text-purple-900 bg-purple-50/60 px-3 py-1 rounded-xl font-medium flex items-center gap-1.5">
              <Pill className="w-3 h-3 text-purple-600 shrink-0" />
              <span>
                <strong>{m.name || m}</strong> {m.dosage && `· ${m.dosage}`} {m.frequency && `· ${m.frequency}`} {m.duration && `· ${m.duration}`}
              </span>
            </div>
          ))}
        </div>
      )}

      {structured.tests?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {structured.tests.map((t, i) => (
            <div
              key={i}
              className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                t.flag === 'HIGH' || t.flag === 'LOW'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}
            >
              <span className="font-semibold">{t.name}: {t.value} {t.unit}</span>
              <span className="text-[10px] font-bold uppercase">{t.flag}</span>
            </div>
          ))}
        </div>
      )}

      {/* AI Explanation Box */}
      {expanded && aiExplanation && (
        <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-pink-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed animate-fadeIn">
          <div className="font-bold text-purple-800 flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI Plain-Language Interpretation</span>
          </div>
          {aiExplanation}
        </div>
      )}

      {/* Card Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-pink-50">
        <button
          onClick={handleExplain}
          disabled={explaining}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {explaining ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Explaining...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain with AI</span>
            </>
          )}
        </button>

        <button
          onClick={() => onDelete(record.id)}
          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
          title="Delete medical record"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
