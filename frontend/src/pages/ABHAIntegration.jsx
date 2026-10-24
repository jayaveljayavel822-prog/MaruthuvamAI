import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  previewFhirBundleApi,
  linkAbhaSandboxApi,
  importAbdmRecordsApi,
  unlinkAbhaApi,
} from '../api/fhir';
import { Link2, Download, Eye, CheckCircle2, ShieldCheck, FileCode, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ABHAIntegration() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [abhaInput, setAbhaInput] = useState(user?.abha_number || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(user?.abha_number ? 2 : 0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fhirBundle, setFhirBundle] = useState(null);
  const [loadingFhir, setLoadingFhir] = useState(false);

  useEffect(() => {
    if (user?.abha_number) {
      setAbhaInput(user.abha_number);
      setStep(2);
    }
  }, [user]);

  const handleSendOtp = () => {
    const cleaned = abhaInput.replace(/\D/g, '');
    if (cleaned.length !== 14 && cleaned.length > 0) {
      setMessage('ABHA number must be 14 digits.');
      return;
    }
    setStep(1);
    setMessage('Mock OTP sent (ABDM Sandbox simulation). Enter any 6 digits.');
  };

  const handleVerify = async () => {
    if (otp.length !== 6 && !/^\d{6}$/.test(otp)) {
      setMessage('Please enter a 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      await linkAbhaSandboxApi(abhaInput || '91123456789012');
      await refreshUser();
      setStep(2);
      setMessage('ABHA successfully linked in ABDM Sandbox mode ✓');
    } catch (err) {
      setMessage('Could not link ABHA.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const data = await importAbdmRecordsApi();
      setMessage(`Imported ${data.records_imported} records from ABDM network ✓`);
      await refreshUser();
    } catch (err) {
      setMessage('Failed to import records.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!window.confirm('Unlink ABHA profile?')) return;
    try {
      await unlinkAbhaApi();
      await refreshUser();
      setStep(0);
      setAbhaInput('');
      setOtp('');
      setMessage('ABHA unlinked.');
    } catch (err) {}
  };

  const handlePreviewFhir = async () => {
    setLoadingFhir(true);
    try {
      const data = await previewFhirBundleApi();
      setFhirBundle(data);
    } catch (err) {
      alert('Could not preview FHIR bundle.');
    } finally {
      setLoadingFhir(false);
    }
  };

  const handleDownloadFhir = () => {
    if (!fhirBundle) return;
    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maruthuvam_fhir_${user?.username || 'records'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('abha')} & ABDM Interoperability</h2>
            <p className="text-xs text-slate-500">
              FHIR R4 resource mappings: Patient, Condition, MedicationRequest, Observation, DiagnosticReport, Composition
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ABHA Linking Sandbox Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-pink-600" />
              <span>Ayushman Bharat Health Account (ABHA)</span>
            </h3>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              ABDM Sandbox
            </span>
          </div>

          {message && (
            <div className="p-3 bg-pink-50 border border-pink-200 text-pink-800 text-xs font-semibold rounded-2xl">
              {message}
            </div>
          )}

          {step === 2 && user?.abha_number ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Linked (ABDM Sandbox)</span>
                </div>
                <div><strong>ABHA Number:</strong> {user.abha_number}</div>
                <div><strong>ABHA Address:</strong> {user.abha_address || `${user.username}@abdm`}</div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  Import Records from ABDM (Mock)
                </button>
                <button
                  onClick={handleUnlink}
                  className="px-4 py-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  Unlink ABHA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  14-Digit ABHA Number (Leave blank to use mock generator)
                </label>
                <input
                  type="text"
                  maxLength="17"
                  value={abhaInput}
                  onChange={(e) => setAbhaInput(e.target.value)}
                  placeholder="e.g. 91-1234-5678-9012"
                  className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                />
              </div>

              {step === 1 && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Enter OTP (Enter any 6 digits in sandbox)
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>
              )}

              {step === 0 ? (
                <button
                  onClick={handleSendOtp}
                  className="px-5 py-2 rounded-full bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 shadow-sm"
                >
                  Send OTP
                </button>
              ) : (
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="px-5 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                >
                  {loading ? 'Verifying...' : 'Verify & Link'}
                </button>
              )}
            </div>
          )}

          <p className="text-[11px] text-slate-400 pt-2 border-t border-pink-50">
            Note: Production ABDM synchronization requires approved National Health Authority (NHA) gateway credentials.
            This interface operates securely in the official Sandbox specification mode.
          </p>
        </div>

        {/* FHIR R4 Bundle Export Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-purple-600" />
              <span>FHIR R4 Interoperability Bundle</span>
            </h3>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
              Standard R4 JSON
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Export health records mapped cleanly to standard FHIR resources: Patient, Condition, MedicationRequest,
            Observation, DiagnosticReport, and Composition.
          </p>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePreviewFhir}
              disabled={loadingFhir}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold transition-colors"
            >
              {loadingFhir ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              <span>Preview FHIR JSON</span>
            </button>

            {fhirBundle && (
              <button
                onClick={handleDownloadFhir}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow hover:opacity-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON ({fhirBundle.total_resources} resources)</span>
              </button>
            )}
          </div>

          {/* JSON Preview Canvas */}
          {fhirBundle && (
            <div className="mt-4">
              <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                <span>Bundle Preview ({fhirBundle.total_resources} mapped resources):</span>
                <span>Valid FHIR R4</span>
              </div>
              <pre className="bg-slate-900 text-pink-200 text-[11px] font-mono p-4 rounded-2xl max-h-64 overflow-auto scrollbar-thin">
                {JSON.stringify(fhirBundle, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
