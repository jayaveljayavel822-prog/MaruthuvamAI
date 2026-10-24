import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Globe } from 'lucide-react';

export default function LanguageModal({ isOpen, onClose }) {
  const { language, setLanguage, languages } = useLanguage();

  if (!isOpen) return null;

  const handleSelect = (langCode) => {
    setLanguage(langCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-pink-100">
        <div className="w-14 h-14 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Globe className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">
          🩺 Welcome to Maruthuvam.AI
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Choose your preferred language · உங்கள் மொழியைத் தேர்ந்தெடுக்கவும் · अपनी भाषा चुनें · మీ భాషను ఎంచుకోండి
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`p-3.5 rounded-2xl border text-base font-medium transition-all ${
                language === l.code
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-md'
                  : 'bg-slate-50 hover:bg-pink-50 text-slate-700 border-slate-200 hover:border-pink-300'
              }`}
            >
              <div className="font-semibold">{l.native}</div>
              <div className="text-xs opacity-80">{l.code}</div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-600 underline"
        >
          Continue with current ({language})
        </button>
      </div>
    </div>
  );
}
