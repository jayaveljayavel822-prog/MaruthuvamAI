import React from 'react';
import { PhoneCall, ShieldAlert, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-12 bg-white/70 backdrop-blur-md border-t border-pink-100 py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Emergency SOS Banner */}
        <div className="flex items-center gap-2 text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-full font-semibold">
          <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          <span>
            🚨 Emergency (India):{' '}
            <a href="tel:108" className="underline font-bold hover:text-rose-900">
              108
            </a>{' '}
            Ambulance ·{' '}
            <a href="tel:112" className="underline font-bold hover:text-rose-900">
              112
            </a>{' '}
            National Helpline
          </span>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="text-center sm:text-right text-[11px] text-slate-400">
          <p>
            Maruthuvam.AI is an AI Health Copilot for guidance and organization. Not a substitute for professional medical advice.
          </p>
          <p className="mt-0.5">
            Built with <Heart className="w-3 h-3 inline text-pink-500" /> for accessible healthcare in India.
          </p>
        </div>
      </div>
    </footer>
  );
}
