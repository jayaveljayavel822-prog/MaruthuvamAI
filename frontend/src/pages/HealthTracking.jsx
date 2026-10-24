import React, { useState, useEffect } from 'react';
import { getHealthLogsApi, saveHealthLogApi, deleteHealthLogApi } from '../api/healthLogs';
import { HeartPulse, Droplets, Moon, Footprints, Smile, Calendar, Trash2, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function HealthTracking() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [water, setWater] = useState(8);
  const [sleep, setSleep] = useState(7.5);
  const [steps, setSteps] = useState(7500);
  const [mood, setMood] = useState(4);
  const [notes, setNotes] = useState('');

  const fetchLogs = async () => {
    try {
      const data = await getHealthLogsApi(30);
      setLogs(data);
    } catch (err) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await saveHealthLogApi({
        log_date: logDate,
        water_glasses: parseInt(water, 10) || 0,
        sleep_hours: parseFloat(sleep) || 0,
        steps: parseInt(steps, 10) || 0,
        mood: parseInt(mood, 10) || 3,
        notes: notes.trim() || null,
      });

      setSuccessMsg('Health entry saved successfully ✓');
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchLogs();
    } catch (err) {
      alert('Could not save entry. Please verify inputs.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Delete this health log entry?')) return;
    try {
      await deleteHealthLogApi(logId);
      setLogs(logs.filter((l) => l.id !== logId));
    } catch (err) {}
  };

  const moodEmojis = {
    5: '😄 Great',
    4: '🙂 Good',
    3: '😐 Okay',
    2: '😕 Low',
    1: '😞 Bad',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('logToday')} & Daily Habits</h2>
            <p className="text-xs text-slate-500">Record and track your hydration, sleep, physical steps, and mood</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form Card */}
        <form onSubmit={handleSave} className="glass-card p-6 lg:col-span-1 space-y-4 shadow-lg border border-pink-100">
          <h3 className="text-sm font-bold text-slate-800 border-b border-pink-100 pb-3 flex items-center justify-between">
            <span>Log Daily Wellness</span>
            {successMsg && <span className="text-xs text-emerald-600 font-semibold">{successMsg}</span>}
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              <span>Date</span>
            </label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>Water Intake (glasses)</span>
            </label>
            <input
              type="number"
              min="0"
              max="40"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-purple-500" />
              <span>Sleep Duration (hours)</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-orange-500" />
              <span>Step Count</span>
            </label>
            <input
              type="number"
              min="0"
              max="100000"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-pink-500" />
              <span>Mood Rating</span>
            </label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="5">😄 Great (5/5)</option>
              <option value="4">🙂 Good (4/5)</option>
              <option value="3">😐 Okay (3/5)</option>
              <option value="2">😕 Low (2/5)</option>
              <option value="1">😞 Bad (1/5)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Optional Notes</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. morning jog, rested well, felt energetic..."
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Log...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{t('saveEntry')}</span>
              </>
            )}
          </button>
        </form>

        {/* Historical Logs List */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-pink-100 pb-3 flex items-center justify-between">
            <span>Historical Health Logs</span>
            <span className="text-xs font-normal text-slate-400">{logs.length} logged records</span>
          </h3>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading logged records...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No logs found yet. Log today to start!</div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {logs.map((l) => (
                <div
                  key={l.id}
                  className="p-4 bg-white/90 rounded-2xl border border-pink-100 flex items-center justify-between shadow-xs hover:border-pink-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{l.log_date}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold">
                        {moodEmojis[l.mood] || `${l.mood}/5`}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-3 font-medium">
                      <span>💧 {l.water_glasses} glasses</span>
                      <span>😴 {l.sleep_hours} hrs</span>
                      <span>👣 {l.steps} steps</span>
                    </div>
                    {l.notes && <p className="text-[11px] text-slate-400 italic">"{l.notes}"</p>}
                  </div>

                  <button
                    onClick={() => handleDelete(l.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
