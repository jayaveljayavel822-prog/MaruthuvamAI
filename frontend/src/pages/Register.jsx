import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BackgroundPills from '../components/common/BackgroundPills';
import EcgLine from '../components/common/EcgLine';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { languages } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('English');
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Username and password are required.');
      return;
    }
    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      await register({
        username,
        password,
        email: email.trim() || null,
        preferred_language: language,
        age: parseInt(age, 10),
        height_cm: parseFloat(height),
        weight_kg: parseFloat(weight),
      });
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Registration failed. Username may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden py-10">
      <BackgroundPills />

      <div className="glass-card max-w-lg w-full p-8 sm:p-10 relative z-10 shadow-2xl border border-pink-200">
        <div className="text-center mb-6">
          <span className="text-4xl hb inline-block">🩺</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent mt-2">
            Create Health Account
          </h1>
          <EcgLine width={200} height={40} className="my-2" />
          <p className="text-xs text-slate-500 font-medium">
            Personalized health copilot with multilingual support
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username"
                required
                className="w-full bg-pink-50/40 border border-pink-200 focus:border-pink-500 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose password"
                required
                className="w-full bg-pink-50/40 border border-pink-200 focus:border-pink-500 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-pink-50/40 border border-pink-200 focus:border-pink-500 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-pink-50/40 border border-pink-200 focus:border-pink-500 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-pink-50/40 border border-pink-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register & Continue</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-pink-600 hover:text-pink-700 underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
