import React, { useState, useEffect } from 'react';
import { getRemindersApi, createReminderApi, deleteReminderApi, logReminderTakenApi } from '../api/medications';
import { Clock, Plus, Trash2, CheckCircle, Bell, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAppointmentsApi } from '../api/appointments';

export default function Reminders() {
  const { t, language } = useLanguage();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [time, setTime] = useState('09:00');
  const [frequency, setFrequency] = useState('daily');
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');

  const fetchReminders = async () => {
    try {
      const data = await getRemindersApi();
      setReminders(data);
    } catch (err) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Browser notifications work while this app is open; browsers may limit background delivery.
  useEffect(() => {
    if (!notificationsEnabled || !('Notification' in window)) return undefined;
    const notified = new Set();
    const checkSchedules = async () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dayKey = now.toISOString().slice(0, 10);
      try {
        const currentReminders = await getRemindersApi();
        currentReminders.filter(r => r.is_active && r.reminder_time === hhmm && r.frequency !== 'as_needed').forEach(r => {
          const key = `med:${dayKey}:${r.id}:${hhmm}`;
          if (!notified.has(key)) {
            const reminderTitle = ({ Tamil: 'மருந்து நினைவூட்டல்', Telugu: 'మందుల రిమైండర్', Hindi: 'दवा रिमाइंडर', Tanglish: 'Medicine reminder' })[language] || 'Medicine reminder';
            new Notification(reminderTitle, { body: `${r.medicine_name} • ${r.frequency.replaceAll('_', ' ')}`, tag: key });
            notified.add(key);
          }
        });
        const appointments = await getAppointmentsApi();
        appointments.filter(a => a.status === 'scheduled').forEach(a => {
          const when = new Date(a.appointment_date);
          const diff = when.getTime() - now.getTime();
          // Notify once when the appointment is within 30 minutes (only while app is open).
          if (diff >= 0 && diff <= 30 * 60 * 1000) {
            const key = `appt:${a.id}`;
            if (!notified.has(key)) {
              const appointmentTitle = ({ Tamil: 'மருத்துவர் சந்திப்பு', Telugu: 'వైద్య అపాయింట్‌మెంట్', Hindi: 'डॉक्टर अपॉइंटमेंट', Tanglish: 'Doctor appointment' })[language] || 'Upcoming appointment';
              new Notification(appointmentTitle, { body: `${a.doctor_or_facility} • ${when.toLocaleString()}`, tag: key });
              notified.add(key);
            }
          }
        });
      } catch (err) { /* API may be temporarily unavailable; retry next minute. */ }
    };
    checkSchedules();
    const timer = window.setInterval(checkSchedules, 60 * 1000);
    return () => window.clearInterval(timer);
  }, [notificationsEnabled, language]);

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      setActionMsg('This browser does not support notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    setActionMsg(permission === 'granted' ? 'Browser notifications enabled ✓' : 'Notification permission was not granted.');
    window.setTimeout(() => setActionMsg(''), 3500);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createReminderApi({
        medicine_name: name.trim(),
        reminder_time: time,
        frequency,
        is_active: true,
      });
      setName('');
      setTime('09:00');
      setActionMsg('Reminder added ✓');
      setTimeout(() => setActionMsg(''), 2500);
      await fetchReminders();
    } catch (err) {
      alert('Could not add reminder.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReminderApi(id);
      setReminders(reminders.filter((r) => r.id !== id));
    } catch (err) {}
  };

  const handleMarkTaken = async (id) => {
    try {
      await logReminderTakenApi(id, 'taken');
      setActionMsg('Marked dose taken! 💊');
      setTimeout(() => setActionMsg(''), 2500);
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('reminders')}</h2>
            <p className="text-xs text-slate-500">Use the exact prescription instructions; enable browser notifications for dose and appointment alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button type="button" onClick={enableNotifications} className="text-xs font-bold px-3 py-2 rounded-full border border-pink-200 bg-white text-pink-700 hover:bg-pink-50">
            <Bell className="w-3.5 h-3.5 inline mr-1" />{notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
          </button>
          {actionMsg && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">{actionMsg}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Reminder Card */}
        <form onSubmit={handleAdd} className="glass-card p-6 lg:col-span-1 space-y-4 shadow-lg border border-pink-100">
          <h3 className="text-sm font-bold text-slate-800 border-b border-pink-100 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-pink-500" />
            <span>Add Medicine Reminder</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Medicine, dosage & duration (as prescribed) *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Medicine 500 mg — 1 tablet — 5 days (as written)"
              required
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Reminder Time *</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="daily">Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="thrice_daily">Thrice Daily</option>
              <option value="weekly">Weekly</option>
              <option value="as_needed">As Needed (SOS)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Set Daily Reminder</span>
              </>
            )}
          </button>
        </form>

        {/* Active Reminders List */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-pink-100 pb-3 flex items-center justify-between">
            <span>Scheduled Medicine Reminders</span>
            <span className="text-xs font-normal text-slate-400">{reminders.length} active</span>
          </h3>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading reminders...</div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No active medicine reminders configured.</div>
          ) : (
            <div className="space-y-3">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className="p-4 bg-white/90 rounded-2xl border border-pink-100 flex items-center justify-between shadow-xs hover:border-pink-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {r.reminder_time}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{r.medicine_name}</h4>
                      <p className="text-[11px] text-slate-400 capitalize">{r.frequency.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkTaken(r.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors"
                      title="Mark as taken"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Taken</span>
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
