import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { HeartPulse, Utensils, Users, Video, BookOpen, AlertTriangle, Check, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CareHub() {
  const { t } = useLanguage();

  // Vitals State
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [spo2, setSpo2] = useState('');
  const [glucose, setGlucose] = useState('');
  const [vitalsLogs, setVitalsLogs] = useState([]);
  const [vitalsAlerts, setVitalsAlerts] = useState([]);

  // Food log state
  const [foodItem, setFoodItem] = useState('');
  const [calories, setCalories] = useState('');
  const [foodLogs, setFoodLogs] = useState([]);

  // Caregivers state
  const [caregiverName, setCaregiverName] = useState('');
  const [relation, setRelation] = useState('Caregiver');
  const [caregivers, setCaregivers] = useState([]);

  // Telehealth Video Room
  const [videoRoom, setVideoRoom] = useState(null);

  const fetchVitalsAndFood = async () => {
    try {
      const [vData, fData, cData] = await Promise.all([
        api.get('/vitals').then((r) => r.data),
        api.get('/vitals/food').then((r) => r.data),
        api.get('/vitals/caregivers').then((r) => r.data),
      ]);
      setVitalsLogs(vData);
      setFoodLogs(fData);
      setCaregivers(cData);
    } catch (e) {}
  };

  useEffect(() => {
    fetchVitalsAndFood();
  }, []);

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.post('/vitals', {
        systolic: systolic ? parseInt(systolic, 10) : null,
        diastolic: diastolic ? parseInt(diastolic, 10) : null,
        spo2: spo2 ? parseFloat(spo2) : null,
        blood_glucose: glucose ? parseFloat(glucose) : null,
      });
      setVitalsAlerts(resp.data.alerts || []);
      setSystolic('');
      setDiastolic('');
      setSpo2('');
      setGlucose('');
      await fetchVitalsAndFood();
    } catch (e) {
      alert('Could not record vitals.');
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!foodItem.trim()) return;
    try {
      await api.post('/vitals/food', {
        food_item: foodItem.trim(),
        calories: parseInt(calories, 10) || 0,
      });
      setFoodItem('');
      setCalories('');
      await fetchVitalsAndFood();
    } catch (e) {}
  };

  const handleAddCaregiver = async (e) => {
    e.preventDefault();
    if (!caregiverName.trim()) return;
    try {
      await api.post('/vitals/caregivers', {
        name: caregiverName.trim(),
        relation,
        consent_scopes: ['appointments', 'reminders', 'records'],
      });
      setCaregiverName('');
      await fetchVitalsAndFood();
    } catch (e) {}
  };

  const handleRevokeCaregiver = async (id) => {
    try {
      await api.delete(`/vitals/caregivers/${id}`);
      setCaregivers(caregivers.filter((c) => c.id !== id));
    } catch (e) {}
  };

  const handleCreateVideoRoom = () => {
    const roomId = 'Maruthuvam-' + Math.random().toString(36).slice(2, 10);
    setVideoRoom(`https://meet.jit.si/${roomId}`);
  };

  const totalCalories = foodLogs.reduce((acc, f) => acc + (f.calories || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Care Hub & Telehealth</h2>
            <p className="text-xs text-slate-500">
              Vitals tracking, nutrition logs, family caregiver consent, and telehealth rooms
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Vitals Tracker */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-pink-100 pb-3">
            <HeartPulse className="w-4 h-4 text-pink-500" />
            <span>Vitals Tracker & Range Alerting</span>
          </h3>

          {vitalsAlerts.length > 0 && (
            <div className="space-y-1">
              {vitalsAlerts.map((a, i) => (
                <div key={i} className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                  {a}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSaveVitals} className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Systolic BP (mmHg)</label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Diastolic BP (mmHg)</label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">SpO₂ (%)</label>
              <input
                type="number"
                step="0.1"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                placeholder="98"
                className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Glucose (mg/dL)</label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="95"
                className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>

            <div className="col-span-2 pt-1 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 shadow-sm transition-all"
              >
                Save Reading
              </button>
            </div>
          </form>

          {/* Recent readings */}
          <div className="space-y-1.5 pt-2 border-t border-pink-50 max-h-40 overflow-y-auto">
            {vitalsLogs.map((v) => (
              <div key={v.id} className="text-xs bg-white p-2 rounded-xl border border-pink-100 flex justify-between font-medium">
                <span>{v.log_date} · BP {v.systolic || '–'}/{v.diastolic || '–'} mmHg · SpO₂ {v.spo2 || '–'}% · Glu {v.blood_glucose || '–'} mg/dL</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Nutrition Log */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-500" />
              <span>Daily Food Log</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {totalCalories} kcal today
            </span>
          </div>

          <form onSubmit={handleAddFood} className="flex gap-2">
            <input
              type="text"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="Food item e.g. Idli with sambar"
              className="flex-1 bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
            />
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="kcal"
              className="w-20 bg-pink-50/40 border border-pink-200 rounded-xl px-2 py-2 text-xs font-semibold outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-sm"
            >
              Add
            </button>
          </form>

          <div className="space-y-1 max-h-40 overflow-y-auto">
            {foodLogs.map((f) => (
              <div key={f.id} className="text-xs bg-white p-2 rounded-xl border border-pink-100 flex justify-between font-semibold">
                <span>🍲 {f.food_item}</span>
                <span className="text-emerald-600">{f.calories} kcal</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Family Caregiver Consent Hub */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-pink-100 pb-3">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Family Caregiver Access with Explicit Consent</span>
          </h3>

          <form onSubmit={handleAddCaregiver} className="flex gap-2">
            <input
              type="text"
              value={caregiverName}
              onChange={(e) => setCaregiverName(e.target.value)}
              placeholder="Caregiver name"
              className="flex-1 bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
            />
            <input
              type="text"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              placeholder="Relation"
              className="w-28 bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-2 text-xs font-semibold outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 shadow-sm"
            >
              Grant
            </button>
          </form>

          <div className="space-y-2">
            {caregivers.map((c) => (
              <div key={c.id} className="p-3 bg-white rounded-2xl border border-pink-100 flex items-center justify-between text-xs font-medium">
                <div>
                  <strong>{c.name}</strong> ({c.relation})
                  <div className="text-[10px] text-slate-400">Scopes: {(c.consent_scopes || []).join(', ')}</div>
                </div>
                <button
                  onClick={() => handleRevokeCaregiver(c.id)}
                  className="text-rose-500 hover:text-rose-700 text-xs font-bold underline"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Telehealth & Evidence-based Research */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-pink-100 pb-3">
            <Video className="w-4 h-4 text-indigo-600" />
            <span>Telehealth Video Room & Trusted Medical Evidence</span>
          </h3>

          <div>
            <p className="text-xs text-slate-500 mb-2">
              Generate an encrypted Jitsi video consultation room to share with your physician:
            </p>
            <button
              onClick={handleCreateVideoRoom}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow hover:opacity-95"
            >
              Create Secure Video Room
            </button>
            {videoRoom && (
              <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs">
                Room Link: <a href={videoRoom} target="_blank" rel="noopener noreferrer" className="font-bold underline text-indigo-700">{videoRoom}</a>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-pink-50">
            <h4 className="text-xs font-bold text-slate-700 mb-2">Search Clinical Evidence at Official Sources:</h4>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://www.who.int"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white border border-pink-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-pink-50"
              >
                🌐 WHO
              </a>
              <a
                href="https://www.nhs.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white border border-pink-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-pink-50"
              >
                🏥 NHS UK
              </a>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white border border-pink-200 rounded-full text-xs font-semibold text-slate-700 hover:bg-pink-50"
              >
                🔬 PubMed
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
