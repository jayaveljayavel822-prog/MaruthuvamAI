import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateMeApi } from '../../api/auth';
import { Scale, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function BmiCalculator({ bmi, bmiCategory, onUpdated }) {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [age, setAge] = useState(user?.profile?.age || 25);
  const [height, setHeight] = useState(user?.profile?.height_cm || 170);
  const [weight, setWeight] = useState(user?.profile?.weight_kg || 65);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    if (user?.profile) {
      if (user.profile.age) setAge(user.profile.age);
      if (user.profile.height_cm) setHeight(user.profile.height_cm);
      if (user.profile.weight_kg) setWeight(user.profile.weight_kg);
    }
  }, [user]);

  // Live BMI calculation
  const calculatedBmi =
    height > 0 && weight > 0
      ? (weight / Math.pow(height / 100, 2)).toFixed(1)
      : bmi || '--';

  const category =
    calculatedBmi !== '--'
      ? parseFloat(calculatedBmi) < 18.5
        ? 'Underweight'
        : parseFloat(calculatedBmi) < 25
        ? 'Healthy weight range'
        : parseFloat(calculatedBmi) < 30
        ? 'Overweight'
        : 'Obese range'
      : bmiCategory || '--';

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg('');
    try {
      await updateMeApi({
        profile: {
          age: parseInt(age, 10),
          height_cm: parseFloat(height),
          weight_kg: parseFloat(weight),
        },
      });
      await refreshUser();
      setSavedMsg('Profile updated ✓');
      setTimeout(() => setSavedMsg(''), 2500);
      if (onUpdated) onUpdated();
    } catch (err) {
      setSavedMsg('Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Scale className="w-4 h-4 text-pink-500" />
            <span>{t('bmiTitle')}</span>
          </h3>
          {savedMsg && <span className="text-xs text-emerald-600 font-semibold">{savedMsg}</span>}
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">{t('age')}</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-100 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">{t('height')}</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-100 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-pink-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">{t('weight')}</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-100 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-pink-400"
            />
          </div>
        </div>

        <div className="flex items-baseline justify-between p-3.5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
          <div>
            <div className="text-xs text-slate-500 font-medium">Body Mass Index (BMI)</div>
            <div className="text-2xl font-black text-pink-600">{calculatedBmi}</div>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-white/80 px-2.5 py-1 rounded-full shadow-xs border border-pink-100">
            {category}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-2">
        <p className="text-[10px] text-slate-400 max-w-[200px]">
          BMI is a population metric, not a definitive standalone health measure.
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}
