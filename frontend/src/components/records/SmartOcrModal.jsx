import React, { useState } from 'react';
import { runOcrApi, confirmOcrRecordApi } from '../../api/medicalRecords';
import { Camera, Upload, Check, AlertTriangle, X, Loader2, Plus } from 'lucide-react';

export default function SmartOcrModal({ isOpen, onClose, onRecordSaved, familyMember = 'My profile' }) {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [autoReminders, setAutoReminders] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleExtract = async () => {
    if (!file && !rawText.trim()) {
      setErrorMsg('Please select a photo or enter report text.');
      return;
    }
    setErrorMsg('');
    setExtracting(true);

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (rawText) formData.append('raw_text', rawText);

      const result = await runOcrApi(formData);
      setExtractedData(result);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Could not process document OCR. Please verify photo quality.');
    } finally {
      setExtracting(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!extractedData) return;
    setSaving(true);
    try {
      await confirmOcrRecordApi({
        title: `[${familyMember}] ${extractedData.title || 'Scanned Medical Record'}`, 
        record_type: extractedData.record_type || 'rx',
        record_date: extractedData.record_date || new Date().toISOString().slice(0, 10),
        source_facility: extractedData.source_facility || 'Medical Facility',
        raw_text: extractedData.raw_extracted_text || rawText,
        structured_data: {
          diagnoses: extractedData.diagnoses || [],
          medications: extractedData.medications || [],
          tests: extractedData.tests || [],
          uncertain: extractedData.uncertain_fields || [],
          family_member: familyMember,
        },
        auto_create_reminders: autoReminders,
      });

      onRecordSaved();
      onClose();
    } catch (err) {
      setErrorMsg('Failed to save verified record. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-pink-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Smart Scan (AI OCR)</h3>
              <p className="text-xs text-slate-400">Extract medicines, tests, and diagnoses with user verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2 border border-rose-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!extractedData ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload Document Photo or Text File
              </label>
              <div className="border-2 border-dashed border-pink-200 rounded-2xl p-6 text-center hover:bg-pink-50/40 transition-colors">
                <Upload className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept="image/*,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  Supports prescriptions, lab reports, discharge summaries (JPG, PNG, TXT up to 15MB)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Or Paste Report Content Directly
              </label>
              <textarea
                rows="4"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste prescription drugs (e.g. Tab Paracetamol 500mg) or lab values (e.g. Hemoglobin 11.5 g/dL)..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-pink-400 rounded-2xl p-3 text-xs outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow hover:opacity-95 disabled:opacity-50 transition-all"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting Medical Fields...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Extract Data (AI OCR)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* User Review Step Before Saving */
          <div className="mt-6 space-y-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center justify-between">
              <span>✅ Extraction Complete. Please review fields before saving to your records:</span>
              <span className="text-[10px] uppercase bg-emerald-200/80 px-2 py-0.5 rounded-full font-bold">
                {extractedData.record_type}
              </span>
            </div>

            {/* Title & Facility */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500">Record Title</label>
                <input
                  type="text"
                  value={extractedData.title}
                  onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500">Doctor / Hospital</label>
                <input
                  type="text"
                  value={extractedData.source_facility || ''}
                  onChange={(e) => setExtractedData({ ...extractedData, source_facility: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Diagnoses */}
            {extractedData.diagnoses?.length > 0 && (
              <div className="p-3 bg-pink-50/60 rounded-2xl border border-pink-100">
                <span className="text-xs font-bold text-slate-700 block mb-1">🩺 Extracted Diagnoses:</span>
                <div className="flex flex-wrap gap-1.5">
                  {extractedData.diagnoses.map((d, i) => (
                    <span key={i} className="text-[11px] bg-white text-pink-700 px-2.5 py-1 rounded-full font-semibold border border-pink-200">
                      • {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Medicines */}
            {extractedData.medications?.length > 0 && (
              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                <span className="text-xs font-bold text-slate-700 block mb-1">💊 Prescribed Medicines:</span>
                <div className="space-y-1">
                  {extractedData.medications.map((m, i) => (
                    <div key={i} className="text-xs text-purple-900 font-medium">
                      • <strong>{m.name}</strong> {m.dosage && `(${m.dosage})`} {m.frequency && `– ${m.frequency}`} {m.duration && `x ${m.duration}`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Tests */}
            {extractedData.tests?.length > 0 && (
              <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-100">
                <span className="text-xs font-bold text-slate-700 block mb-1">🧪 Laboratory Test Findings:</span>
                <div className="space-y-1">
                  {extractedData.tests.map((t, i) => (
                    <div key={i} className="text-xs text-slate-800 flex items-center justify-between">
                      <span>• <strong>{t.name}</strong>: {t.value} {t.unit} (Ref: {t.low_ref || 0} - {t.high_ref || 0})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.flag === 'NORMAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {t.flag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uncertain Fields */}
            {extractedData.uncertain_fields?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
                <span className="font-bold">⚠️ Review needed: </span>
                {extractedData.uncertain_fields.join(', ')}
              </div>
            )}

            {/* Option to Auto-add to Reminders */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoRem"
                checked={autoReminders}
                onChange={(e) => setAutoReminders(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded cursor-pointer"
              />
              <label htmlFor="autoRem" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Automatically add extracted medicines to daily medication reminders
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-pink-100">
              <button
                onClick={() => setExtractedData(null)}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Scan Another Document
              </button>
              <button
                onClick={handleConfirmAndSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow hover:opacity-95 disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm & Save to Health Records</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
