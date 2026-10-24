import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackgroundPills from '../components/common/BackgroundPills';
import EcgLine from '../components/common/EcgLine';
import { LogIn, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Invalid username or password. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('demo_user');
    setPassword('demo1234');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundPills />

      <div className="glass-card max-w-md w-full p-8 sm:p-10 relative z-10 shadow-2xl border border-pink-200">
        <div className="text-center mb-6">
          <span className="text-4xl hb inline-block">🩺</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent mt-2">
            Maruthuvam.AI
          </h1>
          <EcgLine width={200} height={40} className="my-2" />
          <p className="text-xs text-slate-500 font-medium">
            Understand · Organize · Manage your health journey
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
              className="w-full bg-pink-50/40 border border-pink-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full bg-pink-50/40 border border-pink-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Account Filler */}
        <div className="mt-5 pt-4 border-t border-pink-100 text-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="inline-flex items-center gap-1.5 text-xs text-pink-600 hover:text-pink-700 font-bold bg-pink-50 px-3 py-1.5 rounded-full border border-pink-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Use Demo Account (demo_user)</span>
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          <span>New here? </span>
          <Link to="/register" className="font-bold text-pink-600 hover:text-pink-700 underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
