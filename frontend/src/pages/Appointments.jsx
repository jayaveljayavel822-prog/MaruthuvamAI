import React, { useState, useEffect } from 'react';
import { getAppointmentsApi, createAppointmentApi, deleteAppointmentApi } from '../api/appointments';
import { Calendar, Plus, Trash2, Hospital, Clock, Loader2, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Appointments() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState('');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [dateStr, setDateStr] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAppointments = async () => {
    try {
      const data = await getAppointmentsApi();
      setAppointments(data);
    } catch (err) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!doctor.trim() || !dateStr) return;
    setSaving(true);
    try {
      await createAppointmentApi({
        doctor_or_facility: doctor.trim(),
        specialty,
        appointment_date: new Date(dateStr).toISOString(),
        reason: reason.trim() || null,
        notes: notes.trim() || null,
        status: 'scheduled',
      });
      setDoctor('');
      setDateStr('');
      setReason('');
      setNotes('');
      await fetchAppointments();
    } catch (err) {
      alert('Could not schedule appointment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await deleteAppointmentApi(id);
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 text-pink-600 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('appointments')}</h2>
            <p className="text-xs text-slate-500">Manage clinical appointments and upcoming hospital consultations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule Appointment Form */}
        <form onSubmit={handleAdd} className="glass-card p-6 lg:col-span-1 space-y-4 shadow-lg border border-pink-100">
          <h3 className="text-sm font-bold text-slate-800 border-b border-pink-100 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-pink-500" />
            <span>Schedule New Appointment</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Doctor or Hospital *</label>
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="e.g. Dr. S. Kumar, City Clinic"
              required
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Specialty</label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option>General Medicine</option>
              <option>Cardiology</option>
              <option>Diabetology</option>
              <option>Pediatrics</option>
              <option>Dermatology</option>
              <option>Orthopedics</option>
              <option>ENT</option>
              <option>Dental</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Date & Time *</label>
            <input
              type="datetime-local"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              required
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Reason for Visit</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual blood pressure check, review CBC"
              className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Notes / Instructions</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring fasting lab report, take morning tablets..."
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
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Appointment</span>
              </>
            )}
          </button>
        </form>

        {/* Appointments List */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-pink-100 pb-3 flex items-center justify-between">
            <span>Upcoming & Past Consultations</span>
            <span className="text-xs font-normal text-slate-400">{appointments.length} entries</span>
          </h3>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No appointments scheduled yet.</div>
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="p-4 bg-white/90 rounded-2xl border border-pink-100 flex items-start justify-between shadow-xs hover:border-pink-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Hospital className="w-4 h-4 text-pink-500" />
                      <h4 className="text-xs font-bold text-slate-800">{a.doctor_or_facility}</h4>
                      {a.status === 'scheduled' && new Date(a.appointment_date).getTime() < Date.now() && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">Overdue follow-up — confirm/reschedule</span>
                      )}
                      {a.specialty && (
                        <span className="text-[10px] bg-pink-100 text-pink-700 font-semibold px-2 py-0.5 rounded-full">
                          {a.specialty}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(a.appointment_date).toLocaleString()}</span>
                    </div>
                    {a.reason && <p className="text-xs text-slate-700 font-medium">Reason: {a.reason}</p>}
                    {a.notes && <p className="text-[11px] text-slate-400 italic">Notes: {a.notes}</p>}
                  </div>

                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-full hover:bg-rose-50"
                    title="Cancel appointment"
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
