import React, { useState, useEffect } from 'react';
import { getTriageRulesApi, assessTriageApi } from '../../api/triage';
import { ShieldAlert, AlertCircle, PhoneCall, Loader2 } from 'lucide-react';

export default function TriageForm({ onAssessmentComplete }) {
  const [symptomText, setSymptomText] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [severity, setSeverity] = useState('mild');
  const [isWorsening, setIsWorsening] = useState(false);
  const [categories, setCategories] = useState({});
  const [loadingRules, setLoadingRules] = useState(true);
  const [assessing, setAssessing] = useState(false);

  useEffect(() => {
    getTriageRulesApi()
      .then((data) => setCategories(data))
      .catch(() => {})
      .finally(() => setLoadingRules(false));
  }, []);

  const handleToggleId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptomText.trim() && selectedIds.length === 0) {
      alert('Please describe your symptoms or tick at least one item from the checklist.');
      return;
    }

    setAssessing(true);
    try {
      const result = await assessTriageApi({
        symptom_text: symptomText,
        selected_symptom_ids: selectedIds,
        severity,
        is_worsening_quickly: isWorsening,
      });
      onAssessmentComplete(result);
    } catch (err) {
      alert('Triage assessment failed. Please retry or call 108 if in urgent need.');
    } finally {
      setAssessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
      <div>
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>Symptom Triage Assessment</span>
          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
            Safety-First · No Diagnosis
          </span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Tick any symptom that applies, or describe how you feel in your own words (English or Tanglish).
          This evaluates urgency only; it does not diagnose medical disease.
        </p>
      </div>

      {/* Free-text input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Describe your symptoms in your own words:
        </label>
        <textarea
          rows="3"
          value={symptomText}
          onChange={(e) => setSymptomText(e.target.value)}
          placeholder="e.g. headache and mild fever since yesterday, or nenju vali / difficulty breathing..."
          className="w-full bg-slate-50 border border-slate-200 focus:border-rose-400 rounded-2xl p-3 text-xs outline-none"
        />
      </div>

      {/* Categorized Checklists */}
      {loadingRules ? (
        <div className="text-xs text-slate-400 py-3">Loading clinical symptom checklist...</div>
      ) : (
        <div className="space-y-4 max-h-72 overflow-y-auto pr-2 border-y border-pink-100 py-3">
          {Object.entries(categories).map(([catName, items]) => (
            <div key={catName}>
              <h4 className="text-xs font-bold text-pink-700 mb-1.5">{catName}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((it) => (
                  <label
                    key={it.id}
                    className={`flex items-start gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedIds.includes(it.id)
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                        : 'bg-white/70 border-slate-200 text-slate-700 hover:bg-pink-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(it.id)}
                      onChange={() => handleToggleId(it.id)}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-400 cursor-pointer"
                    />
                    <span className="leading-tight">{it.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Severity and Progression */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="mild">Feels Mild</option>
              <option value="mod">Moderate Discomfort</option>
              <option value="severe">Severe / Unbearable Pain</option>
            </select>
          </div>

          <label className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isWorsening}
              onChange={(e) => setIsWorsening(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded cursor-pointer"
            />
            <span>Getting worse rapidly</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={assessing}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
        >
          {assessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Assessing Urgency...</span>
            </>
          ) : (
            <span>Check Symptom Urgency</span>
          )}
        </button>
      </div>
    </form>
  );
}
