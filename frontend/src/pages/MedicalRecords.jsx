import React, { useState, useEffect } from 'react';
import {
  getMedicalRecordsApi,
  createMedicalRecordApi,
  deleteMedicalRecordApi,
  generateUnifiedSummaryApi,
  runOcrApi,
  confirmOcrRecordApi,
} from '../api/medicalRecords';
import RecordCard from '../components/records/RecordCard';
import SmartOcrModal from '../components/records/SmartOcrModal';
import { FileText, Camera, Plus, Search, Sparkles, Filter, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MedicalRecords() {
  const { t } = useLanguage();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordType, setRecordType] = useState('all');
  const [search, setSearch] = useState('');
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [familyMembers, setFamilyMembers] = useState(() => { try { return JSON.parse(localStorage.getItem('maruthuvam_family_members') || '["My profile"]'); } catch { return ['My profile']; } });
  const [activeMember, setActiveMember] = useState(() => localStorage.getItem('maruthuvam_active_member') || 'My profile');
  const [newMember, setNewMember] = useState('');

  // Manual Add Form State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualType, setManualType] = useState('rx');
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualFacility, setManualFacility] = useState('');
  const [manualText, setManualText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI Unified Summary
  const [unifiedSummary, setUnifiedSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  const addFamilyMember = () => {
    const name = newMember.trim();
    if (!name || familyMembers.includes(name)) return;
    const next = [...familyMembers, name];
    setFamilyMembers(next);
    localStorage.setItem('maruthuvam_family_members', JSON.stringify(next));
    setNewMember('');
  };

  const selectFamilyMember = (name) => {
    setActiveMember(name);
    localStorage.setItem('maruthuvam_active_member', name);
  };

  const handleMultiUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setBatchBusy(true);
    setBatchResults([]);
    const results = [];
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const extracted = await runOcrApi(formData);
        results.push({ fileName: file.name, extracted, status: 'ready' });
      } catch (error) {
        results.push({ fileName: file.name, error: error.response?.data?.detail || 'Could not read this file. Try a clearer image.', status: 'error' });
      }
      setBatchResults([...results]);
    }
    setBatchBusy(false);
  };

  const saveBatchRecord = async (item, index) => {
    if (!item?.extracted) return;
    const data = item.extracted;
    // Keep extraction uncertainty visible; user must review the extracted text before relying on it.
    try {
      await confirmOcrRecordApi({
        title: `[${activeMember}] ${data.title || item.fileName}`,
        record_type: data.record_type || 'rx',
        record_date: data.record_date || new Date().toISOString().slice(0, 10),
        source_facility: data.source_facility || null,
        raw_text: data.raw_extracted_text || '',
        structured_data: { diagnoses: data.diagnoses || [], medications: data.medications || [], tests: data.tests || [], uncertain: data.uncertain_fields || [], family_member: activeMember },
        auto_create_reminders: false,
      });
      setBatchResults(prev => prev.map((entry, i) => i === index ? { ...entry, status: 'saved' } : entry));
      await fetchRecords();
    } catch (error) {
      setBatchResults(prev => prev.map((entry, i) => i === index ? { ...entry, error: 'Save failed. Please retry.' } : entry));
    }
  };

  const fetchRecords = async () => {
    try {
      const data = await getMedicalRecordsApi(recordType, search);
      setRecords(data);
    } catch (err) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [recordType, search]);

  const visibleRecords = records.filter((record) => {
    const title = record.title || '';
    return title.startsWith(`[${activeMember}]`) || (activeMember === 'My profile' && !/^\[[^\]]+\]/.test(title));
  });

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    setSubmitting(true);
    try {
      await createMedicalRecordApi({
        title: `[${activeMember}] ${manualTitle}`, 
        record_type: manualType,
        record_date: manualDate,
        source_facility: manualFacility.trim() || null,
        raw_text: manualText.trim() || null,
        structured_data: { family_member: activeMember },
      });
      setShowManualForm(false);
      setManualTitle('');
      setManualText('');
      setManualFacility('');
      await fetchRecords();
    } catch (err) {
      alert('Could not save record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Delete this medical record?')) return;
    try {
      await deleteMedicalRecordApi(recordId);
      setRecords(records.filter((r) => r.id !== recordId));
    } catch (err) {}
  };

  const handleGenerateSummary = async () => {
    setSummarizing(true);
    try {
      const data = await generateUnifiedSummaryApi();
      setUnifiedSummary(data.summary);
    } catch (err) {
      setUnifiedSummary('Could not generate unified summary at this time.');
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('unifiedRecords')}</h2>
            <p className="text-xs text-slate-500">Prescriptions, lab findings, and discharge summaries in one secure place</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOcrModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Smart Scan (OCR)</span>
          </button>
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-pink-200 text-pink-700 bg-white hover:bg-pink-50 text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showManualForm ? 'Close Form' : 'Add Manually'}</span>
          </button>
        </div>
      </div>

      <div className="glass-card p-5 border border-pink-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-600 mb-1">Active family health profile</label>
            <select value={activeMember} onChange={(e) => selectFamilyMember(e.target.value)} className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm">
              {familyMembers.map(member => <option key={member} value={member}>{member}</option>)}
            </select>
          </div>
          <div className="flex flex-1 gap-2">
            <input value={newMember} onChange={(e) => setNewMember(e.target.value)} placeholder="Add family member name" className="min-w-0 flex-1 bg-white border border-pink-200 rounded-xl px-3 py-2 text-sm" />
            <button type="button" onClick={addFamilyMember} className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold">Add profile</button>
          </div>
        </div>
        <p className="text-[11px] text-amber-700">Family profile labels are saved in this browser. This prototype does not yet enforce separate server-side access permissions for each family member; avoid storing another person's records unless you have permission.</p>
        <div className="border-t border-pink-100 pt-4">
          <label className="block text-xs font-bold text-slate-700 mb-2">Upload multiple prescription / medical document images</label>
          <input type="file" multiple accept="image/*,.txt" onChange={handleMultiUpload} disabled={batchBusy} className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-100 file:text-pink-700" />
          <p className="text-[11px] text-slate-500 mt-1">Each file is OCR-processed separately. Check the extracted text and medicine instructions before saving; batch upload does not auto-create medicine reminders.</p>
          {batchBusy && <p className="text-xs font-semibold text-pink-600 mt-3">Processing uploaded files one by one…</p>}
          {batchResults.length > 0 && <div className="space-y-3 mt-3">{batchResults.map((item, index) => <div key={`${item.fileName}-${index}`} className="p-3 rounded-xl border border-pink-100 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2"><div><p className="text-xs font-bold text-slate-800">{item.fileName}</p>{item.error && <p className="text-xs text-rose-600 mt-1">{item.error}</p>}{item.extracted && <><p className="text-xs text-slate-600 mt-1">Title: {item.extracted.title || 'Medical document'} · Type: {item.extracted.record_type || 'rx'}</p><p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">Extracted text: {(item.extracted.raw_extracted_text || 'No text extracted').slice(0, 600)}</p>{item.extracted.uncertain_fields?.length > 0 && <p className="text-xs text-amber-700 mt-1">Needs review: {item.extracted.uncertain_fields.join(', ')}</p>}</>}</div>
              {item.status === 'ready' && <button type="button" onClick={() => saveBatchRecord(item, index)} className="shrink-0 px-3 py-2 rounded-full bg-pink-500 text-white text-xs font-bold">Save record</button>}{item.status === 'saved' && <span className="text-xs font-bold text-emerald-600">Saved</span>}</div></div>)}</div>}
        </div>
      </div>

      {/* Manual Entry Collapsible Card */}
      {showManualForm && (
        <form onSubmit={handleManualSubmit} className="glass-card p-6 space-y-4 border-2 border-pink-200 animate-slideDown">
          <h3 className="text-sm font-bold text-slate-800">Add Medical Document Manually</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Type</label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              >
                <option value="rx">💊 Prescription</option>
                <option value="lab">🧪 Lab Report</option>
                <option value="dc">🏥 Discharge Summary</option>
                <option value="dx">🩻 Diagnostic Report</option>
                <option value="other">📁 Other Document</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Title</label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. Complete Blood Count (CBC)"
                required
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Doctor or Hospital</label>
            <input
              type="text"
              value={manualFacility}
              onChange={(e) => setManualFacility(e.target.value)}
              placeholder="e.g. Dr. Kumar, City Clinic"
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Details (Medications, Lab Values, Advice)</label>
            <textarea
              rows="3"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Enter medicines, dosages, test parameters, and clinical advice..."
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl p-3 text-xs text-slate-800 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-full bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      )}

      {/* AI Unified Summary Card */}
      <div className="glass-card p-6 border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-800">AI Unified Medical Summary</h3>
          </div>
          <button
            onClick={handleGenerateSummary}
            disabled={summarizing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {summarizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Summary</span>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-purple-50/40 p-4 rounded-2xl border border-purple-100 font-medium mt-3">
          {unifiedSummary || 'One combined overview of the account records. For family privacy, review the selected profile before generating or sharing summaries.'}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/70 p-3 rounded-2xl border border-pink-100">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-pink-500 shrink-0" />
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">All Record Types</option>
            <option value="rx">💊 Prescriptions</option>
            <option value="lab">🧪 Lab Reports</option>
            <option value="dc">🏥 Discharge Summaries</option>
            <option value="dx">🩻 Diagnostics</option>
            <option value="other">📁 Other Documents</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records by title, doctor, drug..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs outline-none focus:border-pink-400"
          />
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading medical records...</div>
      ) : visibleRecords.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 space-y-3">
          <FileText className="w-10 h-10 text-pink-300 mx-auto" />
          <p className="text-xs">No records found. Upload a prescription or lab report to begin organizing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleRecords.map((r) => (
            <RecordCard key={r.id} record={r} onDelete={handleDeleteRecord} />
          ))}
        </div>
      )}

      {/* OCR Extraction Modal */}
      <SmartOcrModal
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        onRecordSaved={fetchRecords}
        familyMember={activeMember}
      />
    </div>
  );
}
